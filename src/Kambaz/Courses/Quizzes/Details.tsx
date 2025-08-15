// src/Kambaz/Courses/Quizzes/Details.tsx
import { useEffect, useState } from "react";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../store";
import { getMyLastAttempt, listMyAttempts } from "./attemptsClient";

type QuizSettings = {
  shuffleAnswers?: boolean;
  timeLimitMin?: number;
  multipleAttempts?: boolean;
  attemptsAllowed?: number;
  oneQuestionAtATime?: boolean;
  webcamRequired?: boolean;
  lockAfterAnswering?: boolean;
};

type Quiz = {
  _id: string;
  course: string;
  title: string;
  description?: string;
  type?: "GRADED_QUIZ" | "PRACTICE_QUIZ" | "GRADED_SURVEY" | "UNGRADED_SURVEY";
  assignmentGroup?: "Quizzes" | "Exams" | "Assignments" | "Project";
  published?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  settings?: QuizSettings;
};

function fmt(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
const yesNo = (v?: boolean) => (v ? "Yes" : "No");

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector(
    (s: RootState) =>
      s.accountReducer.currentUser as { _id?: string; role?: string } | null
  );
  const isFaculty = currentUser?.role === "FACULTY";

  const HTTP_SERVER =
    (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";
  const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [points, setPoints] = useState<number>(0);

  // student-facing attempt info
  const [lastAttempt, setLastAttempt] = useState<{ score: number; createdAt: string } | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0);
  const [attemptsAllowed, setAttemptsAllowed] = useState<number>(1);
  const [multipleAttempts, setMultipleAttempts] = useState<boolean>(false);

  // Load quiz + points + (if student) attempts info
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const [qRes, pRes] = await Promise.all([
          api.get<Quiz>(`/api/quizzes/${qid}`),
          api.get<{ total: number }>(`/api/quizzes/${qid}/points`),
        ]);
        if (!alive) return;

        const q = qRes.data;
        setQuiz(q);
        setPoints(pRes.data?.total ?? 0);

        // normalize attempts policy for display
        const s = q.settings ?? {};
        const multi = !!s.multipleAttempts;
        setMultipleAttempts(multi);
        setAttemptsAllowed(multi ? Number(s.attemptsAllowed ?? 1) : 1);

        // student-only: last attempt + attempts used
        if (!isFaculty && qid) {
          try {
            const [last, all] = await Promise.all([
              getMyLastAttempt(qid, currentUser?._id),
              listMyAttempts(qid, currentUser?._id).catch(() => [] as any[]),
            ]);
            if (!alive) return;
            if (last) setLastAttempt({ score: last.score, createdAt: last.createdAt });
            setAttemptsUsed(Array.isArray(all) ? all.length : last ? 1 : 0);
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qid, currentUser?._id, isFaculty]);

  if (loading) {
    return (
      <div className="p-3 text-secondary">
        <Spinner size="sm" className="me-2" />
        Loading quiz…
      </div>
    );
  }
  if (!quiz) return <div className="p-3 text-danger">Quiz not found.</div>;

  const s = quiz.settings ?? {};
  const typeLabel =
    quiz.type === "PRACTICE_QUIZ"
      ? "Practice Quiz"
      : quiz.type === "GRADED_SURVEY"
      ? "Graded Survey"
      : quiz.type === "UNGRADED_SURVEY"
      ? "Ungraded Survey"
      : "Graded Quiz";

  const remaining =
    Math.max(0, (multipleAttempts ? attemptsAllowed : 1) - attemptsUsed);

  return (
    <div className="p-3">
      <div className="d-flex justify-content-end gap-2 mb-3">
        {isFaculty ? (
          <>
            <Button
              variant="light"
              className="border"
              onClick={() =>
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/preview`)
              }
            >
              Preview
            </Button>
            <Link
              to={`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`}
              className="btn btn-light border"
            >
              Edit
            </Link>
          </>
        ) : remaining === 0 && lastAttempt ? (
          <Button variant="secondary" disabled>
            No attempts remaining
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/take`)}
          >
            {lastAttempt ? "Retake Quiz" : "Start Quiz"}
          </Button>
        )}
      </div>

      <h4 className="mb-3">{quiz.title}</h4>

      {!isFaculty && lastAttempt && (
        <Alert variant="light" className="border d-flex justify-content-between">
          <div>
            <div className="fw-semibold">Last attempt</div>
            <div className="text-secondary small">
              {fmt(lastAttempt.createdAt)} • Score: <b>{lastAttempt.score}</b>
            </div>
          </div>
          <div className="text-secondary small">
            Attempts used: {attemptsUsed}/{multipleAttempts ? attemptsAllowed : 1} • Remaining:{" "}
            {remaining}
          </div>
        </Alert>
      )}

      {/* Properties */}
      <div className="border rounded p-3">
        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Quiz Type
          </Col>
          <Col>{typeLabel}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Points
          </Col>
          <Col>{points}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Assignment Group
          </Col>
          <Col>{quiz.assignmentGroup ?? "Quizzes"}</Col>
        </Row>

        {/* Faculty-only: show Shuffle Answers setting on details */}
        {isFaculty && (
          <Row className="mb-2">
            <Col sm={4} className="text-secondary fw-semibold">
              Shuffle Answers
            </Col>
            <Col>{yesNo(s.shuffleAnswers ?? true)}</Col>
          </Row>
        )}

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Time Limit
          </Col>
          <Col>{(s.timeLimitMin ?? 0) > 0 ? `${s.timeLimitMin} Minutes` : "None"}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Multiple Attempts
          </Col>
          <Col>
            {yesNo(multipleAttempts)} {multipleAttempts ? `(Up to ${attemptsAllowed})` : ""}
          </Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            One Question at a Time
          </Col>
          <Col>{yesNo(s.oneQuestionAtATime)}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Webcam Required
          </Col>
          <Col>{yesNo(s.webcamRequired)}</Col>
        </Row>

        <Row className="mb-4">
          <Col sm={4} className="text-secondary fw-semibold">
            Lock Questions After Answering
          </Col>
          <Col>{yesNo(s.lockAfterAnswering)}</Col>
        </Row>

        {/* Dates */}
        <Row className="border-top pt-3">
          <Col sm={4} className="text-secondary fw-semibold">
            Due
          </Col>
          <Col sm={4} className="text-secondary fw-semibold">
            Available from
          </Col>
          <Col sm={4} className="text-secondary fw-semibold">
            Until
          </Col>
        </Row>
        <Row>
          <Col sm={4}>{fmt(quiz.dueDate)}</Col>
          <Col sm={4}>{fmt(quiz.availableFrom)}</Col>
          <Col sm={4}>{fmt(quiz.availableUntil)}</Col>
        </Row>
      </div>
    </div>
  );
}