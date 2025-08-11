// src/Kambaz/Courses/Quizzes/Details.tsx
import { useEffect, useMemo, useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../store";

type QuizSettings = {
  shuffleAnswers?: boolean;
  timeLimitMin?: number;
  multipleAttempts?: boolean;
  attemptsAllowed?: number;
  showCorrectAfter?: string; // e.g., NEVER / IMMEDIATELY / AFTER_DUE
  accessCode?: string;
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
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector(
    (s: RootState) => s.accountReducer.currentUser as { role?: string } | null
  );
  const isFaculty = currentUser?.role === "FACULTY";

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

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [qRes, pRes] = await Promise.all([
          api.get<Quiz>(`/api/quizzes/${qid}`),
          api.get<{ total: number }>(`/api/quizzes/${qid}/points`),
        ]);
        if (!alive) return;
        setQuiz(qRes.data);
        setPoints(pRes.data?.total ?? 0);
      } catch (e) {
        // You could show a toast or redirect if desired
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, qid]);

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

  const s = quiz.settings ?? {};

  // helpers to render Yes/No and safe text
  const yesNo = (v?: boolean) => (v ? "Yes" : "No");
  const typeLabel =
    quiz.type === "PRACTICE_QUIZ"
      ? "Practice Quiz"
      : quiz.type === "GRADED_SURVEY"
      ? "Graded Survey"
      : quiz.type === "UNGRADED_SURVEY"
      ? "Ungraded Survey"
      : "Graded Quiz";

  const group = quiz.assignmentGroup ?? "Quizzes";
  const attempts =
    s.multipleAttempts ? (s.attemptsAllowed ?? 1) : 1;

  return (
    <div className="p-3">
      {/* Header actions */}
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
        ) : (
          <Button
            variant="danger"
            onClick={() =>
              navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/take`)
            }
          >
            Start Quiz
          </Button>
        )}
      </div>

      <h4 className="mb-3">{quiz.title}</h4>

      {/* Property grid */}
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
          <Col>{points ?? 0}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Assignment Group
          </Col>
          <Col>{group}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Shuffle Answers
          </Col>
          <Col>{yesNo(s.shuffleAnswers ?? true)}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Time Limit
          </Col>
          <Col>{(s.timeLimitMin ?? 20) + " Minutes"}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Multiple Attempts
          </Col>
          <Col>{yesNo(s.multipleAttempts)}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            How Many Attempts
          </Col>
          <Col>{attempts}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Show Correct Answers
          </Col>
          <Col>{(quiz.settings?.showCorrectAfter ?? "NEVER").toString()}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            Access Code
          </Col>
          <Col>{s.accessCode ? "Required" : "—"}</Col>
        </Row>

        <Row className="mb-2">
          <Col sm={4} className="text-secondary fw-semibold">
            One Question at a Time
          </Col>
          <Col>{yesNo(s.oneQuestionAtATime ?? true)}</Col>
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

        {/* Dates row like the screenshot */}
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
          <Col sm={4}>{fmt(quiz.dueDate) || "—"}</Col>
          <Col sm={4}>{fmt(quiz.availableFrom) || "—"}</Col>
          <Col sm={4}>{fmt(quiz.availableUntil) || "—"}</Col>
        </Row>
      </div>
    </div>
  );
}