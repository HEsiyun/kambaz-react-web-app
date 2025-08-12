// Faculty preview
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Nav, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

/** Server-side shapes (read-only here) */
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
  correctBoolean?: boolean;
  // FIB
  acceptableAnswers?: string[];
  caseInsensitive?: boolean;
  trimInput?: boolean;
};

type Quiz = { _id: string; course: string; title: string };

type Answers = {
  [questionId: string]:
    | { kind: "MC"; choiceId?: string }
    | { kind: "TF"; value?: boolean }
    | { kind: "FIB"; value: string };
};

export default function QuizPreview() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const HTTP_SERVER =
    (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";
  const api = useMemo(
    () =>
      axios.create({
        baseURL: HTTP_SERVER,
        withCredentials: true,
      }),
    [HTTP_SERVER]
  );

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);

  // local attempt (never saved)
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // load quiz + questions
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [qres, qsres] = await Promise.all([
          api.get<Quiz>(`/api/quizzes/${qid}`),
          api.get<Question[]>(`/api/quizzes/${qid}/questions`),
        ]);
        if (!alive) return;

        setQuiz(qres.data);
        setQuestions(qsres.data ?? []);
        // initialize empty answers
        const init: Answers = {};
        (qsres.data ?? []).forEach((q) => {
          if (q.type === "MC") init[q._id] = { kind: "MC" };
          else if (q.type === "TF") init[q._id] = { kind: "TF" };
          else init[q._id] = { kind: "FIB", value: "" };
        });
        setAnswers(init);
        setIdx(0);
        setSubmitted(false);
        setScore(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, qid]);

  const totalPoints = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.points) || 0), 0),
    [questions]
  );

  const current = questions[idx];

  const setMC = (qid: string, choiceId: string) =>
    setAnswers((a) => ({ ...a, [qid]: { kind: "MC", choiceId } }));
  const setTF = (qid: string, value: boolean) =>
    setAnswers((a) => ({ ...a, [qid]: { kind: "TF", value } }));
  const setFIB = (qid: string, value: string) =>
    setAnswers((a) => ({ ...a, [qid]: { kind: "FIB", value } }));

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(questions.length - 1, i + 1));

  /** evaluate correctness for one question */
  const isCorrect = (q: Question, a: Answers[keyof Answers] | undefined): boolean => {
    if (!a) return false;
    if (q.type === "MC") {
      const choice = q.choices?.find((c) => c._id === (a as any).choiceId);
      return !!choice?.isCorrect;
    }
    if (q.type === "TF") {
      return (a as any).value === !!q.correctBoolean;
    }
    // FIB
    const user = (a as any).value ?? "";
    const bank = q.acceptableAnswers ?? [];
    const ci = q.caseInsensitive ?? true;
    const trim = q.trimInput ?? true;

    const norm = (s: string) => {
      let t = s;
      if (trim) t = t.trim();
      if (ci) t = t.toLowerCase();
      return t;
    };

    const u = norm(user);
    return bank.some((ans) => norm(ans) === u);
  };

  const submit = () => {
    let pts = 0;
    questions.forEach((q) => {
      if (isCorrect(q, answers[q._id])) pts += Number(q.points) || 0;
    });
    setScore(pts);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="p-3 text-secondary">
        <Spinner size="sm" className="me-2" />
        Loading preview…
      </div>
    );
  }

  if (!quiz) {
    return <div className="p-3 text-danger">Quiz not found.</div>;
  }

  return (
    <div className="p-3" style={{ maxWidth: 940 }}>
      {/* Tabs to match editor/questions pages */}
      <Nav variant="tabs" className="mb-3">
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/Kambaz/Courses/${cid}/Quizzes/${qid}`}
          >
            Details
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`}
          >
            Questions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as="span" className="active">Preview</Nav.Link>
        </Nav.Item>
      </Nav>

      <h3 className="mb-2">{quiz.title}</h3>

      <Alert variant="warning" className="py-2">
        This is a preview of the published version of the quiz.
      </Alert>

      {/* Question panel */}
      {current && (
        <div className="border rounded mb-3">
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <div className="fw-semibold">Question {idx + 1}</div>
            <div className="text-secondary">{current.points} pts</div>
          </div>

          <div className="p-3">
            {/* prompt */}
            <div
              className="mb-3"
              dangerouslySetInnerHTML={{ __html: current.prompt || "" }}
            />

            {/* answer control */}
            {current.type === "MC" && (
              <div className="d-flex flex-column gap-2">
                {current.choices?.map((c) => {
                  const picked = (answers[current._id] as any)?.choiceId === c._id;
                  const correct = submitted && c.isCorrect;
                  const wrongPick = submitted && picked && !c.isCorrect;
                  return (
                    <Form.Check
                      key={c._id}
                      type="radio"
                      name={`mc-${current._id}`}
                      label={c.text}
                      checked={picked}
                      onChange={() => setMC(current._id, c._id)}
                      className={
                        correct ? "text-success" : wrongPick ? "text-danger" : ""
                      }
                      disabled={submitted}
                    />
                  );
                })}
              </div>
            )}

            {current.type === "TF" && (
              <div className="d-flex flex-column gap-2">
                <Form.Check
                  type="radio"
                  name={`tf-${current._id}`}
                  label="True"
                  checked={(answers[current._id] as any)?.value === true}
                  onChange={() => setTF(current._id, true)}
                  disabled={submitted}
                />
                <Form.Check
                  type="radio"
                  name={`tf-${current._id}`}
                  label="False"
                  checked={(answers[current._id] as any)?.value === false}
                  onChange={() => setTF(current._id, false)}
                  disabled={submitted}
                />
              </div>
            )}

            {current.type === "FIB" && (
              <Form.Control
                placeholder="Your answer"
                value={(answers[current._id] as any)?.value ?? ""}
                onChange={(e) => setFIB(current._id, e.target.value)}
                disabled={submitted}
              />
            )}

            {/* correctness after submit */}
            {submitted && (
              <div className="mt-3 small">
                {isCorrect(current, answers[current._id]) ? (
                  <span className="text-success">Correct</span>
                ) : (
                  <span className="text-danger">
                    Incorrect
                    {current.type === "TF" && (
                      <>
                        {" "}
                        — correct answer:{" "}
                        <b>{current.correctBoolean ? "True" : "False"}</b>
                      </>
                    )}
                    {current.type === "FIB" && (
                      <>
                        {" "}
                        — accepted answers:{" "}
                        <b>{(current.acceptableAnswers ?? []).join(", ") || "—"}</b>
                      </>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* nav */}
          <div className="d-flex justify-content-between p-3 border-top">
            <Button variant="light" className="border" onClick={goPrev} disabled={idx === 0}>
              Previous
            </Button>
            <Button variant="light" className="border" onClick={goNext} disabled={idx >= questions.length - 1}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Button
          variant="light"
          className="border"
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)}
        >
          Keep Editing This Quiz
        </Button>

        <div className="d-flex gap-2">
          {submitted && (
            <div className="align-self-center text-secondary me-2">
              Score: <b>{score}</b> / {totalPoints}
            </div>
          )}
          <Button variant="secondary" onClick={submit} disabled={submitted || questions.length === 0}>
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Quick nav list like Canvas */}
      <div className="mt-3">
        <div className="fw-semibold mb-2">Questions</div>
        <ol className="mb-0">
          {questions.map((q, i) => (
            <li key={q._id}>
              <Button
                variant="link"
                className="p-0"
                onClick={() => setIdx(i)}
              >
                Question {i + 1}
              </Button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}