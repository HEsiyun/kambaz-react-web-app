import { useEffect, useMemo, useState } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
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
  // MC
  choices?: Choice[];
  // TF
  answer?: boolean;
  // FIB
  answers?: string[];
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

/* ---------- Component ---------- */
export default function TakeQuiz() {
  const { cid, qid } = useParams();
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

  // Load quiz + questions + last attempt
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

        const [last, allMine] = await Promise.all([
          getMyLastAttempt(qid!, currentUser?._id),
          listMyAttempts(qid!, currentUser?._id).catch(() => [] as any[]),
        ]);
        if (!alive) return;
        setLastAttempt(last ?? null);
        setAttemptsUsed(allMine?.length ?? (last ? 1 : 0));
      } catch {
        if (alive) setQuiz(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [qid, currentUser?._id]);

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

  const isCorrect = (q: Question, val: any) => {
    if (q.type === "MC") {
      const correct = (q.choices ?? []).find((c) => c.isCorrect);
      return val === correct?._id || val === correct?.text;
    }
    if (q.type === "TF") {
      return Boolean(val) === Boolean(q.answer);
    }
    const accepted = normalizeFibList(q).map((s) => s.toLowerCase().trim());
    return accepted.includes(String(val ?? "").toLowerCase().trim());
  };

  const currentAnswers = lastAttempt?.answersByQid ?? answers;

  const submit = async () => {
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

  const oneAtATime = quiz.settings?.oneQuestionAtATime;
  const visibleQuestions = oneAtATime ? [questions[currentIndex]] : questions;

  return (
    <div className="p-3" style={{ maxWidth: 900 }}>
      <h4 className="mb-3">{quiz.title}</h4>

      {!!lastAttempt && (
        <Alert variant="light" className="border d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Last attempt</div>
            <div className="text-secondary small">
              {fmt(lastAttempt.createdAt)} • Score: <b>{lastAttempt.score}</b>
            </div>
          </div>
          {attemptsInfo.remaining > 0 ? (
            <div className="text-secondary small">
              Attempts used: {attemptsUsed}/{attemptsInfo.allowed} • Remaining:{" "}
              {attemptsInfo.remaining}
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
          const ans = currentAnswers[q._id];
          const showCheck = !!lastAttempt;
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
                {q.prompt && <div dangerouslySetInnerHTML={{ __html: q.prompt }} />}

                {q.type === "MC" && (
                  <div className="mt-2 d-flex flex-column gap-2">
                    {(q.choices ?? []).map((c) => (
                      <Form.Check
                        key={c._id}
                        disabled={viewOnly || !!lastAttempt}
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
                    <Form.Check
                      disabled={viewOnly || !!lastAttempt}
                      type="radio"
                      name={`q-${q._id}`}
                      label="True"
                      checked={ans === true}
                      onChange={() => setAns(q._id, true)}
                    />
                    <Form.Check
                      disabled={viewOnly || !!lastAttempt}
                      type="radio"
                      name={`q-${q._id}`}
                      label="False"
                      checked={ans === false}
                      onChange={() => setAns(q._id, false)}
                    />
                  </div>
                )}

                {q.type === "FIB" && (
                  <div className="mt-2" style={{ maxWidth: 360 }}>
                    <Form.Control
                      disabled={viewOnly || !!lastAttempt}
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

      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
        <Link
          to={`/Kambaz/Courses/${cid}/Quizzes/${qid}`}
          className="btn btn-light border"
        >
          Back to Quiz
        </Link>

        <div className="d-flex gap-2">
          {oneAtATime && currentIndex > 0 && (
            <Button variant="secondary" onClick={() => setCurrentIndex((i) => i - 1)}>
              Previous
            </Button>
          )}
          {oneAtATime && currentIndex < questions.length - 1 && (
            <Button variant="secondary" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </Button>
          )}
          {(!oneAtATime || currentIndex === questions.length - 1) &&
            (attemptsInfo.remaining === 0 && !!lastAttempt ? (
              <div className="text-secondary">No attempts remaining.</div>
            ) : !!lastAttempt ? (
              <Button
                variant="danger"
                onClick={() => {
                  setAnswers({});
                  setLastAttempt(null);
                  setCurrentIndex(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Retake Quiz
              </Button>
            ) : (
              <Button
                variant="danger"
                disabled={submitting}
                onClick={submit}
                title="Submit your attempt"
              >
                {submitting ? "Submitting…" : "Submit Quiz"}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}