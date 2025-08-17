// src/Kambaz/Courses/Quizzes/Take.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getMyLastAttempt, listMyAttempts, submitAttempt } from "./attemptsClient";

/* ---------- Types ---------- */
type QuizSettings = {
  shuffleAnswers?: boolean;
  multipleAttempts?: boolean;
  attemptsAllowed?: number;
  oneQuestionAtATime?: boolean;
  timeLimitMin?: number; // 0/undefined = none
  lockAfterAnswering?: boolean;
  accessCode?: string;   // optional access code
};

type Quiz = {
  _id: string;
  course: string;
  title: string;
  settings?: QuizSettings;
  published?: boolean;
  accessCode?: string;   // top-level support too
};

type Choice = { _id: string; text: string; isCorrect?: boolean };

type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title?: string;
  points: number;
  prompt?: string;
  choices?: Choice[];   // MC
  answer?: boolean;     // TF (client name)
  // FIB (client name – server may send acceptableAnswers or acceptableAnswersByBlank)
  answers?: string[];
  acceptableAnswers?: string[];
  acceptableAnswersByBlank?: string[][];
  correctBoolean?: boolean; // TF (server name)
};

/* ---------- Utils ---------- */
const HTTP_SERVER =
  (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";
const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

const fmt = (d: string) =>
  new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function msToClock(ms: number) {
  const clamped = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// blanks helpers (must match server logic)
const countBlanksInPrompt = (html?: string) =>
  html ? (html.match(/__\s*\d+\s*__/g) || []).length : 0;

const acceptedByBlank = (q: Question): string[][] => {
  if (Array.isArray(q.acceptableAnswersByBlank) && q.acceptableAnswersByBlank.length) {
    return q.acceptableAnswersByBlank.map((arr) => (arr || []).map((s) => String(s ?? "")).filter(Boolean));
  }
  const flat =
    (Array.isArray((q as any).acceptableAnswers) && (q as any).acceptableAnswers.length
      ? (q as any).acceptableAnswers
      : Array.isArray(q.answers) && q.answers.length
      ? q.answers
      : []) as string[];
  const blanks = countBlanksInPrompt(q.prompt || q.title || "");
  const clean = flat.map((s) => String(s ?? "")).filter(Boolean);
  if (blanks > 1 && clean.length === blanks) return clean.map((ans) => [ans]);
  return [clean]; // single-blank fallback
};

const caseInsensitive = (q: Question) => (q as any).caseInsensitive !== false;
const trimInput = (q: Question) => (q as any).trimInput !== false;
const normWith = (q: Question) => (s: string) => {
  const t = trimInput(q) ? String(s ?? "").trim() : String(s ?? "");
  return caseInsensitive(q) ? t.toLowerCase() : t;
};

/* ---------- Component ---------- */
export default function TakeQuiz() {
  const { cid, qid } = useParams();
  const location = useLocation();
  const isPreview = /\/preview\/?$/.test(location.pathname);

  const currentUser = useSelector(
    (s: RootState) => s.accountReducer.currentUser as { _id?: string; role?: string } | null
  );
  const isFaculty = currentUser?.role === "FACULTY";

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [lastAttempt, setLastAttempt] = useState<{
    _id: string;
    answersByQid: Record<string, any>;
    score: number;
    createdAt: string;
  } | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // choice order for MC shuffling
  const choiceOrderRef = useRef<Record<string, string[]>>({});
  const [shuffleEpoch, setShuffleEpoch] = useState(0);

  // Timer
  const endAtRef = useRef<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  // lock-after-answering state
  const [lockedMaxIndex, setLockedMaxIndex] = useState<number>(-1);
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  // ===== Access code gate =====
  const [accessOk, setAccessOk] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const expectedCode = (quiz?.settings?.accessCode || quiz?.accessCode || "").trim();
  const requiresAccess = !isPreview && expectedCode.length > 0;

  // Load quiz + questions + attempts (not in preview)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [{ data: qz }, { data: qs }] = await Promise.all([
          api.get(`/api/quizzes/${qid}`),
          api.get(`/api/quizzes/${qid}/questions`),
        ]);
        if (!alive) return;
        setQuiz(qz);
        setQuestions(qs);

        // Access gate: in preview bypass; otherwise wait for code entry if present
        setAccessOk(isPreview || !(qz?.settings?.accessCode || qz?.accessCode));

        if (!isPreview) {
          const [last, allMine] = await Promise.all([
            getMyLastAttempt(qid!, currentUser?._id),
            listMyAttempts(qid!, currentUser?._id).catch(() => [] as any[]),
          ]);
          if (!alive) return;
          setLastAttempt(last ?? null);
          setAttemptsUsed(allMine?.length ?? (last ? 1 : 0));
        } else {
          setLastAttempt(null);
          setAttemptsUsed(0);
        }

        // reset attempt-local state
        choiceOrderRef.current = {};
        setAnswers({});
        setCurrentIndex(0);
        setShuffleEpoch((e) => e + 1);
        setLockedMaxIndex(-1);
        setLockNotice(null);
        setCodeInput("");
        setCodeError(null);

        // timer
        const tl = Number(qz?.settings?.timeLimitMin || 0);
        const hasTL = !isPreview && tl > 0;
        if (hasTL) {
          endAtRef.current = Date.now() + tl * 60_000;
          setRemainingMs((endAtRef.current as number) - Date.now());
          setExpired(false);
        } else {
          endAtRef.current = null;
          setRemainingMs(0);
          setExpired(false);
        }
      } catch {
        if (alive) setQuiz(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [qid, currentUser?._id, isPreview]);

  // Countdown
  useEffect(() => {
    if (isPreview) return;
    if (!quiz?.settings?.timeLimitMin) return;
    if (lastAttempt) return;
    if (!endAtRef.current) return;
    const tick = () => {
      const ms = (endAtRef.current as number) - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) setExpired(true);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [quiz?.settings?.timeLimitMin, lastAttempt, isPreview]);

  // Auto-submit if expired
  useEffect(() => {
    if (!expired || isPreview || submitting) return;
    submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const attemptsInfo = useMemo(() => {
    const s = quiz?.settings || {};
    const enabled = !!s.multipleAttempts;
    const allowed = s.attemptsAllowed ?? 1;
    const max = enabled ? allowed : 1;
    const remaining = Math.max(0, max - attemptsUsed);
    return { enabled, allowed: max, remaining };
  }, [quiz, attemptsUsed]);

  const viewOnly = !!lastAttempt && attemptsInfo.remaining === 0;

  const setAns = (qid: string, value: any) =>
    setAnswers((a) => ({ ...a, [qid]: value }));

  /* ---------- Correctness (client mirror of server) ---------- */
  const isCorrect = (q: Question, val: any) => {
    if (q.type === "MC") {
      const correct = (q.choices ?? []).find((c) => c.isCorrect);
      return val === correct?._id || val === correct?.text;
    }
    if (q.type === "TF") {
      const right = (q as any).correctBoolean ?? q.answer;
      return Boolean(val) === Boolean(right);
    }
    // FIB: per-blank
    const byBlank = acceptedByBlank(q);
    const norm = normWith(q);
    const student: string[] = Array.isArray(val) ? val.map(String) : [String(val ?? "")];
    const blanks = Math.max(byBlank.length, student.length);
    const ok = Array.from({ length: blanks }, (_, i) => {
      const accepted = (byBlank[i] || []).map(norm);
      const s = norm(student[i] ?? "");
      if (!accepted.length) return false;
      return accepted.includes(s);
    });
    return ok.every(Boolean);
  };

  const currentAnswers = lastAttempt?.answersByQid ?? answers;

  /* ---------- Shuffle order for MC ---------- */
  const displayChoicesMap = useMemo(() => {
    const map: Record<string, Choice[]> = {};
    const shouldShuffle = !!quiz?.settings?.shuffleAnswers;

    for (const q of questions) {
      if (q.type !== "MC") continue;
      const raw = q.choices ?? [];
      if (!raw.length) continue;

      const existing = choiceOrderRef.current[q._id];
      let ids: string[];
      if (existing && existing.length === raw.length) {
        ids = existing;
      } else {
        const baseIds = raw.map((c) => c._id);
        ids = shouldShuffle ? shuffle(baseIds) : baseIds;
        choiceOrderRef.current[q._id] = ids;
      }
      const byId = new Map(raw.map((c) => [c._id, c]));
      map[q._id] = ids.map((id) => byId.get(id)!).filter(Boolean);
    }
    return map;
  }, [questions, quiz?.settings?.shuffleAnswers, shuffleEpoch]);

  const getDisplayChoices = (q: Question): Choice[] => {
    if (q.type !== "MC") return q.choices ?? [];
    return displayChoicesMap[q._id] ?? (q.choices ?? []);
  };

  /* ---------- Helpers: lock-after-answering ---------- */
  const oneAtATime = !!quiz?.settings?.oneQuestionAtATime;
  const lockAfter = !!quiz?.settings?.lockAfterAnswering && oneAtATime;

  const hasAnyAnswer = (q: Question, val: any): boolean => {
    if (q.type === "MC") return !!val;
    if (q.type === "TF") return typeof val === "boolean";
    if (Array.isArray(val)) return val.some((s) => String(s ?? "").trim().length > 0);
    return String(val ?? "").trim().length > 0;
  };

  const tryGoPrev = () => {
    if (!oneAtATime) return setCurrentIndex((i) => Math.max(0, i - 1));
    const target = currentIndex - 1;
    if (target < 0) return;
    if (lockAfter && target <= lockedMaxIndex) {
      setLockNotice("You can’t go back. This question was locked after you answered it.");
      return;
    }
    setCurrentIndex(target);
  };

  const goNext = () => {
    if (!oneAtATime) return;
    const q = questions[currentIndex];
    const ans = currentAnswers[q?._id || ""];
    if (lockAfter && q && hasAnyAnswer(q, ans)) {
      setLockedMaxIndex((idx) => Math.max(idx, currentIndex));
    }
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
  };

  /* ---------- Submit ---------- */
  const submit = async (_auto = false) => {
    if (isPreview) return;
    try {
      setSubmitting(true);
      const payload = { answersByQid: answers, user: currentUser?._id };
      const attempt = await submitAttempt(qid!, payload);
      setLastAttempt({
        _id: attempt._id,
        answersByQid: attempt.answersByQid,
        score: attempt.score,
        createdAt: attempt.createdAt as any,
      });
      setAttemptsUsed((n) => n + 1);
      setAnswers({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Access code check handler =====
  const verifyAccess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!requiresAccess) {
      setAccessOk(true);
      return;
    }
    if (codeInput.trim() === expectedCode) {
      setAccessOk(true);
      setCodeError(null);
    } else {
      setCodeError("Incorrect access code. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-3 text-secondary">
        <Spinner size="sm" className="me-2" />
        Loading quiz…
      </div>
    );
  }
  if (!quiz) return <div className="p-3 text-danger">Quiz not found.</div>;

  /* ===== NEW: block students from unpublished quizzes ===== */
  if (!isPreview && !isFaculty && quiz.published === false) {
    return (
      <div className="p-3" style={{ maxWidth: 640 }}>
        <h4 className="mb-3">{quiz.title}</h4>
        <Alert variant="warning" className="border">
          This quiz isn’t published yet. Please check back later or contact your instructor.
        </Alert>
        <Link
          to={`/Kambaz/Courses/${cid}/Quizzes`}
          className="btn btn-light border"
        >
          Back to Quizzes
        </Link>
      </div>
    );
  }

  // ===== If access code is required and not verified yet, show gate =====
  if (!isPreview && !isFaculty && (quiz.settings?.accessCode || quiz.accessCode) && !accessOk) {
    return (
      <div className="p-3" style={{ maxWidth: 640 }}>
        <h4 className="mb-3">{quiz.title}</h4>
        <Alert variant="light" className="border">
          <div className="fw-semibold mb-1">This quiz requires an access code.</div>
          <div className="text-secondary small">
            Enter the access code provided by your instructor to begin.
          </div>
        </Alert>
        {codeError && (
          <Alert variant="danger" className="py-2">
            {codeError}
          </Alert>
        )}
        <Form onSubmit={verifyAccess}>
          <Form.Group className="mb-3" controlId="quiz-access-code">
            <Form.Label>Access Code</Form.Label>
            <Form.Control
              type="password"
              autoFocus
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter access code"
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Link
              to={`/Kambaz/Courses/${cid}/Quizzes/${qid}`}
              className="btn btn-light border"
            >
              Back to Quiz
            </Link>
            <Button
              variant="danger"
              type="submit"
              disabled={codeInput.trim().length === 0}
              onClick={() => verifyAccess()}
            >
              Start Quiz
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  const resultMode = !isPreview && !!lastAttempt;
  const visibleQuestions = oneAtATime && !resultMode ? [questions[currentIndex]] : questions;

  const hasTimeLimit = !isPreview && !resultMode && (quiz.settings?.timeLimitMin || 0) > 0;

  return (
    <div className="p-3" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-3">
          {quiz.title}
          {isPreview && <span className="text-secondary ms-2 small">(Preview)</span>}
        </h4>
        {hasTimeLimit && endAtRef.current && (
          <div
            className={`px-3 py-2 rounded border ${
              remainingMs <= 60_000 ? "border-danger text-danger" : "border-secondary text-secondary"
            }`}
            aria-live="polite"
          >
            Time remaining: <b>{msToClock(remainingMs)}</b>
          </div>
        )}
      </div>

      {/* Notice for lock-after-answering */}
      {lockNotice && (
        <Alert
          variant="warning"
          onClose={() => setLockNotice(null)}
          dismissible
          className="py-2"
        >
          {lockNotice}
        </Alert>
      )}

      {!isPreview && !!lastAttempt && (
        <Alert variant="light" className="border d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Last attempt</div>
            <div className="text-secondary small">
              {fmt(lastAttempt.createdAt)} • Score: <b>{lastAttempt.score}</b>
            </div>
          </div>
          <div className="text-secondary small">
            Attempts used: {attemptsUsed}/{quiz.settings?.multipleAttempts ? (quiz.settings?.attemptsAllowed ?? 1) : 1}
          </div>
        </Alert>
      )}

      <ol className="ps-3">
        {visibleQuestions.map((q, idx) => {
          if (!q) return null;
          const ans = currentAnswers[q._id];
          const showCheck = resultMode;
          const correct = showCheck ? isCorrect(q, ans) : undefined;

          return (
            <li key={q._id} className="mb-4">
              <div
                className="p-3 border rounded"
                style={{
                  background: showCheck
                    ? correct
                      ? "rgba(25,135,84,.06)"
                      : "rgba(220,53,69,.06)"
                    : "transparent",
                }}
              >
                {/* Title + points */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-semibold">
                    {q.title?.trim() ? q.title : `Question ${oneAtATime ? currentIndex + 1 : idx + 1}`}
                  </div>
                  <div className="text-secondary small">
                    Points: <b>{Number(q.points) || 0}</b>
                  </div>
                </div>

                {/* prompt */}
                {q.prompt && (
                  <div className="mb-2" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                )}

                {/* type renderers */}
                {q.type === "MC" && (
                  <div className="mt-1 d-flex flex-column gap-2">
                    {getDisplayChoices(q).map((c) => (
                      <Form.Check
                        key={c._id}
                        disabled={viewOnly || showCheck || isPreview}
                        type="radio"
                        name={`q-${q._id}`}
                        label={c.text}
                        checked={ans === c._id || ans === c.text}
                        onChange={() => setAns(q._id, c._id)}
                      />
                    ))}
                  </div>
                )}

                {q.type === "TF" && (
                  <div className="mt-1 d-flex gap-4">
                    <Form.Check
                      disabled={viewOnly || showCheck || isPreview}
                      type="radio"
                      name={`q-${q._id}`}
                      label="True"
                      checked={ans === true}
                      onChange={() => setAns(q._id, true)}
                    />
                    <Form.Check
                      disabled={viewOnly || showCheck || isPreview}
                      type="radio"
                      name={`q-${q._id}`}
                      label="False"
                      checked={ans === false}
                      onChange={() => setAns(q._id, false)}
                    />
                  </div>
                )}

                {q.type === "FIB" && (() => {
                  const blanks = Math.max(1, countBlanksInPrompt(q.prompt || q.title || ""));
                  const arr: string[] = Array.isArray(ans)
                    ? ans.map((s: any) => String(s ?? ""))
                    : Array.from({ length: blanks }, () => String(ans ?? ""));
                  return (
                    <div className="mt-1 d-flex flex-column gap-2" style={{ maxWidth: 520 }}>
                      {Array.from({ length: blanks }, (_, i) => (
                        <Form.Control
                          key={i}
                          disabled={viewOnly || showCheck || isPreview}
                          placeholder={`Blank ${i + 1}`}
                          value={arr[i] ?? ""}
                          onChange={(e) => {
                            const next = [...arr];
                            next[i] = e.target.value;
                            setAns(q._id, next); // store ARRAY per blank
                          }}
                        />
                      ))}
                      {showCheck && (
                        <div className="small text-secondary mt-2">
                          {acceptedByBlank(q).map((acc, i) => (
                            <div key={i}>Blank {i + 1} accepted: {acc.join(" | ") || "—"}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* correctness label */}
                {showCheck && (
                  <div className={`mt-2 small ${correct ? "text-success" : "text-danger"}`}>
                    {correct ? "Correct" : "Incorrect"}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer */}
      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <Link
          to={`/Kambaz/Courses/${cid}/Quizzes/${qid}${isPreview ? "/edit" : ""}`}
          className="btn btn-light border"
        >
          {isPreview ? "Back to Editor" : "Back to Quiz"}
        </Link>

        <div className="d-flex gap-2">
          {/* Previous: allow click, but block + show notice if locked */}
          {oneAtATime && !resultMode && !isPreview && currentIndex > 0 && (
            <Button variant="secondary" onClick={tryGoPrev}>
              Previous
            </Button>
          )}
          {oneAtATime && !resultMode && !isPreview && currentIndex < questions.length - 1 && (
            <Button variant="secondary" onClick={goNext}>
              Next
            </Button>
          )}

          {!isPreview &&
            !resultMode &&
            (!oneAtATime || currentIndex === questions.length - 1) && (
              <Button variant="danger" disabled={submitting} onClick={() => submit(false)}>
                {submitting ? "Submitting…" : "Submit Quiz"}
              </Button>
            )}

          {!isPreview &&
            resultMode &&
            (attemptsInfo.remaining > 0 ? (
              <Button
                variant="danger"
                onClick={() => {
                  setAnswers({});
                  setLastAttempt(null);
                  setCurrentIndex(0);
                  choiceOrderRef.current = {};
                  setShuffleEpoch((e) => e + 1);
                  setLockedMaxIndex(-1);
                  setLockNotice(null);
                  const tl = Number(quiz?.settings?.timeLimitMin || 0);
                  if (tl > 0) {
                    endAtRef.current = Date.now() + tl * 60_000;
                    setRemainingMs((endAtRef.current as number) - Date.now());
                    setExpired(false);
                  } else {
                    endAtRef.current = null;
                    setRemainingMs(0);
                    setExpired(false);
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Retake Quiz
              </Button>
            ) : (
              <div className="text-secondary">No attempts remaining.</div>
            ))}
        </div>
      </div>
    </div>
  );
}