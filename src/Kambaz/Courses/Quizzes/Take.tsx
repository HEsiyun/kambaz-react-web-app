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
  lockAfterAnswering?: boolean;
};

type Quiz = {
  _id: string;
  course: string;
  title: string;
  settings?: QuizSettings;
  published?: boolean;
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
  answers?: string[];   // FIB (client name – server may send acceptableAnswers)
};

/* ---------- Utils ---------- */
const HTTP_SERVER =
  (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";

const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

const normalizeFibList = (q: Question) =>
  (q.answers && q.answers.length
    ? q.answers
    : ((q as any).acceptableAnswers as string[] | undefined)) ?? [];

const fmt = (d: string) =>
  new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function shuffleIds<T>(ids: T[]) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Component ---------- */
export default function TakeQuiz() {
  const { cid, qid } = useParams();
  const location = useLocation();
  const isPreview =
    /\/preview\/?$/.test(location.pathname) ||
    new URLSearchParams(location.search).get("preview") === "1";

  const currentUser = useSelector(
    (s: RootState) => s.accountReducer.currentUser as { _id?: string; role?: string } | null
  );

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

  // warning banner text
  const [warn, setWarn] = useState<string>("");

  /**
   * Stable per-session/attempt order map:
   *  - For MC: stores the array of choice IDs.
   *  - For TF: stores the array ["T","F"] or ["F","T"].
   */
  const orderRef = useRef<Record<string, string[]>>({});

  // Bump this to force a new shuffle (preview load, retake)
  const [shuffleEpoch, setShuffleEpoch] = useState(0);

  // Load quiz + questions + (if not preview) last attempt
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

        // Only fetch attempt data for real taking (not preview)
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

        // Reset UI state & force a fresh shuffle set
        orderRef.current = {};
        setAnswers({});
        setCurrentIndex(0);
        setWarn("");
        setShuffleEpoch((e) => e + 1);
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

  // correctness – tolerant of server/client field names
  const isCorrect = (q: Question, val: any) => {
    if (q.type === "MC") {
      const correct = (q.choices ?? []).find((c) => c.isCorrect);
      return val === correct?._id || val === correct?.text;
    }
    if (q.type === "TF") {
      const right = (q as any).correctBoolean ?? q.answer;
      return Boolean(val) === Boolean(right);
    }
    const accepted = normalizeFibList(q).map((s) => s.toLowerCase().trim());
    return accepted.includes(String(val ?? "").toLowerCase().trim());
  };

  const currentAnswers = lastAttempt?.answersByQid ?? answers;

  // Build display order maps for MC and TF
  const { mcChoicesMap, tfOrderMap } = useMemo(() => {
    const mcMap: Record<string, Choice[]> = {};
    const tfMap: Record<string, ("T" | "F")[]> = {};
    const shouldShuffle = !!quiz?.settings?.shuffleAnswers;

    for (const q of questions) {
      if (q.type === "MC") {
        const raw = q.choices ?? [];
        if (raw.length > 0) {
          const existing = orderRef.current[q._id];
          let ids: string[];
          if (existing && existing.length === raw.length) {
            ids = existing;
          } else {
            const baseIds = raw.map((c) => c._id);
            ids = shouldShuffle ? shuffleIds(baseIds) : baseIds;
            orderRef.current[q._id] = ids;
          }
          const byId = new Map(raw.map((c) => [c._id, c]));
          mcMap[q._id] = ids.map((id) => byId.get(id)).filter(Boolean) as Choice[];
        }
      }

      if (q.type === "TF") {
        const existing = orderRef.current[q._id];
        let ord: ("T" | "F")[];
        if (existing && existing.length === 2 && existing.includes("T") && existing.includes("F")) {
          ord = existing as ("T" | "F")[];
        } else {
          const base: ("T" | "F")[] = ["T", "F"];
          ord = shouldShuffle ? (shuffleIds(base) as ("T" | "F")[]) : base;
          orderRef.current[q._id] = ord;
        }
        tfMap[q._id] = ord;
      }
    }
    return { mcChoicesMap: mcMap, tfOrderMap: tfMap };
  }, [questions, quiz?.settings?.shuffleAnswers, shuffleEpoch]);

  const getDisplayChoices = (q: Question): Choice[] =>
    q.type === "MC" ? mcChoicesMap[q._id] ?? (q.choices ?? []) : (q.choices ?? []);

  const getTFOrder = (q: Question): ("T" | "F")[] =>
    q.type === "TF" ? tfOrderMap[q._id] ?? ["T", "F"] : ["T", "F"];

  // ---- navigation guards ----
  const oneAtATime = !!quiz?.settings?.oneQuestionAtATime;
  const lockAfter = !!quiz?.settings?.lockAfterAnswering;
  const resultMode = !isPreview && !!lastAttempt;

  const goPrev = () => {
    if (!oneAtATime || resultMode || isPreview) {
      setCurrentIndex((i) => Math.max(0, i - 1));
      return;
    }
    // guard only applies during an active attempt with lockAfterAnswering
    if (!lockAfter) {
      setCurrentIndex((i) => Math.max(0, i - 1));
      return;
    }
    setWarn(""); // clear any old message
    setCurrentIndex((i) => {
      const target = i - 1;
      if (target < 0) return 0;
      const prevQ = questions[target];
      const prevAnswered = prevQ && currentAnswers[prevQ._id] !== undefined;
      if (prevAnswered) {
        setWarn("You can’t go back. Questions are locked after answering.");
        // keep index unchanged
        return i;
      }
      return target;
    });
  };

  const submit = async () => {
    if (isPreview) return; // never submit in preview
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
      // keep orderRef so the review uses the same order this session
      setAnswers({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
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
  if (!quiz) {
    return <div className="p-3 text-danger">Quiz not found.</div>;
  }

  // During attempt show one item; after submit show ALL
  const visibleQuestions =
    oneAtATime && !resultMode ? [questions[currentIndex]] : questions;

  return (
    <div className="p-3" style={{ maxWidth: 900 }}>
      <h4 className="mb-2">
        {quiz.title}
        {isPreview && <span className="text-secondary ms-2 small">(Preview)</span>}
      </h4>

      {/* warning banner for lock-after-answering */}
      {warn && (
        <Alert
          variant="warning"
          onClose={() => setWarn("")}
          dismissible
          className="mb-3"
        >
          {warn}
        </Alert>
      )}

      {/* Status only in real take mode */}
      {!isPreview && !!lastAttempt && (
        <Alert variant="light" className="border d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Last attempt</div>
            <div className="text-secondary small">
              {fmt(lastAttempt.createdAt)} • Score: <b>{lastAttempt.score}</b>
            </div>
          </div>
          {attemptsInfo.remaining > 0 ? (
            <div className="text-secondary small">
              Attempts used: {attemptsUsed}/{attemptsInfo.allowed} • Remaining: {attemptsInfo.remaining}
            </div>
          ) : (
            <div className="text-secondary small">
              No attempts remaining ({attemptsUsed}/{attemptsInfo.allowed})
            </div>
          )}
        </Alert>
      )}

      <ol className="ps-3">
        {visibleQuestions.map((q) => {
          if (!q) return null;
          const ans = currentAnswers[q._id];
          const showCheck = resultMode; // never in preview
          const correct = showCheck ? isCorrect(q, ans) : undefined;
          const choices = getDisplayChoices(q);
          const tfOrder = getTFOrder(q);

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
                {q.prompt && <div dangerouslySetInnerHTML={{ __html: q.prompt }} />}

                {q.type === "MC" && (
                  <div className="mt-2 d-flex flex-column gap-2">
                    {choices.map((c) => (
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
                  <div className="mt-2 d-flex gap-4">
                    {tfOrder.map((key) => {
                      const isTrue = key === "T";
                      return (
                        <Form.Check
                          key={key}
                          disabled={viewOnly || showCheck || isPreview}
                          type="radio"
                          name={`q-${q._id}`}
                          label={isTrue ? "True" : "False"}
                          checked={ans === (isTrue ? true : false)}
                          onChange={() => setAns(q._id, isTrue)}
                        />
                      );
                    })}
                  </div>
                )}

                {q.type === "FIB" && (
                  <div className="mt-2" style={{ maxWidth: 360 }}>
                    <Form.Control
                      disabled={viewOnly || showCheck || isPreview}
                      placeholder="Your answer"
                      value={ans ?? ""}
                      onChange={(e) => setAns(q._id, e.target.value)}
                    />
                    {showCheck && (
                      <div className="small text-secondary mt-2">
                        Accepted answers: {normalizeFibList(q).join(", ") || "—"}
                      </div>
                    )}
                  </div>
                )}

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

      {/* Footer actions */}
      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <Link
          to={`/Kambaz/Courses/${cid}/Quizzes/${qid}${isPreview ? "/edit" : ""}`}
          className="btn btn-light border"
        >
          {isPreview ? "Back to Editor" : "Back to Quiz"}
        </Link>

        <div className="d-flex gap-2">
          {/* Paging only during attempt (not preview, not result) */}
          {oneAtATime && !resultMode && !isPreview && currentIndex > 0 && (
            <Button variant="secondary" onClick={goPrev}>
              Previous
            </Button>
          )}
          {oneAtATime && !resultMode && !isPreview && currentIndex < questions.length - 1 && (
            <Button variant="secondary" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </Button>
          )}

          {/* Submit button only during real attempt (and only on last item for 1-at-a-time) */}
          {!isPreview &&
            !resultMode &&
            (!oneAtATime || currentIndex === questions.length - 1) && (
              <Button variant="danger" disabled={submitting} onClick={submit} title="Submit your attempt">
                {submitting ? "Submitting…" : "Submit Quiz"}
              </Button>
            )}

          {/* After submit: allow retake if any attempts remain */}
          {!isPreview &&
            resultMode &&
            (attemptsInfo.remaining > 0 ? (
              <Button
                variant="danger"
                onClick={() => {
                  setAnswers({});
                  setLastAttempt(null);
                  setCurrentIndex(0);
                  orderRef.current = {}; // clear old order
                  setWarn("");
                  setShuffleEpoch((e) => e + 1); // force new shuffle set
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