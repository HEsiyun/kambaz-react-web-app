import { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Nav, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams, Routes, Route } from "react-router-dom";
import axios from "axios";


type QuizSettings = {
  shuffleAnswers?: boolean;
  timeLimitMin?: number;
  multipleAttempts?: boolean;
  attemptsAllowed?: number;
  showCorrectAfter?: "NEVER" | "IMMEDIATELY" | "AFTER_DUE";
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
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  settings?: QuizSettings;
  published?: boolean;
};

export default function QuizEditor() {
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
  const [saving, setSaving] = useState(false);
  const [points, setPoints] = useState<number>(0);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<NonNullable<Quiz["type"]>>("GRADED_QUIZ");
  const [group, setGroup] =
    useState<NonNullable<Quiz["assignmentGroup"]>>("Quizzes");

  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [timeLimitMin, setTimeLimitMin] = useState(20);
  const [multipleAttempts, setMultipleAttempts] = useState(false);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [showCorrectAfter, setShowCorrectAfter] =
    useState<QuizSettings["showCorrectAfter"]>("NEVER");
  const [accessCode, setAccessCode] = useState("");

  const [oneQuestionAtATime, setOneQuestionAtATime] = useState(true);
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [lockAfterAnswering, setLockAfterAnswering] = useState(false);

  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [dueDate, setDueDate] = useState("");

  // load quiz + points
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [{ data: quiz }, { data: pts }] = await Promise.all([
          api.get(`/api/quizzes/${qid}`),
          api.get(`/api/quizzes/${qid}/points`), // { total: number }
        ]);
        if (!alive) return;

        setTitle(quiz.title ?? "");
        setDescription(quiz.description ?? "");
        setType(quiz.type ?? "GRADED_QUIZ");
        setGroup(quiz.assignmentGroup ?? "Quizzes");

        setShuffleAnswers(quiz.settings?.shuffleAnswers ?? true);
        setTimeLimitMin(quiz.settings?.timeLimitMin ?? 20);
        setMultipleAttempts(quiz.settings?.multipleAttempts ?? false);
        setAttemptsAllowed(quiz.settings?.attemptsAllowed ?? 1);
        setShowCorrectAfter(quiz.settings?.showCorrectAfter ?? "NEVER");
        setAccessCode(quiz.settings?.accessCode ?? "");

        setOneQuestionAtATime(quiz.settings?.oneQuestionAtATime ?? true);
        setWebcamRequired(quiz.settings?.webcamRequired ?? false);
        setLockAfterAnswering(quiz.settings?.lockAfterAnswering ?? false);

        setAvailableFrom(quiz.availableFrom?.substring(0, 10) ?? "");
        setAvailableUntil(quiz.availableUntil?.substring(0, 10) ?? "");
        setDueDate(quiz.dueDate?.substring(0, 10) ?? "");

        setPoints(pts?.total ?? 0);
      } catch (e) {
        // optional: toast error
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, qid]);

  const payload = (): Partial<Quiz> => ({
    title,
    description,
    type,
    assignmentGroup: group,
    availableFrom: availableFrom || undefined,
    availableUntil: availableUntil || undefined,
    dueDate: dueDate || undefined,
    settings: {
      shuffleAnswers,
      timeLimitMin: Number(timeLimitMin) || 0,
      multipleAttempts,
      attemptsAllowed: Number(attemptsAllowed) || 1,
      showCorrectAfter,
      accessCode,
      oneQuestionAtATime,
      webcamRequired,
      lockAfterAnswering,
    },
  });

  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/api/quizzes/${qid}`, payload());
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`); // back to details
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    try {
      setSaving(true);
      await api.put(`/api/quizzes/${qid}`, payload());
      await api.put(`/api/quizzes/${qid}/publish`, { published: true });
      navigate(`/Kambaz/Courses/${cid}/Quizzes`); // back to list
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 text-secondary">
        <Spinner size="sm" className="me-2" />
        Loading…
      </div>
    );
  }

  return (
    <div className="p-3" style={{ maxWidth: 900 }}>
      {/* Tabs */}
      <Nav variant="tabs" defaultActiveKey="details" className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="details" as="span" className="active">
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
      </Nav>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Edit Quiz</h4>
        <div className="text-secondary">Points: <b>{points}</b></div>
      </div>

      <Form>
        {/* Title + Description */}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Unnamed Quiz"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the quiz (WYSIWYG placeholder)"
          />
        </Form.Group>

        {/* Left/Right columns */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Quiz Type</Form.Label>
              <Form.Select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as NonNullable<Quiz["type"]>)
                }
              >
                <option value="GRADED_QUIZ">Graded Quiz</option>
                <option value="PRACTICE_QUIZ">Practice Quiz</option>
                <option value="GRADED_SURVEY">Graded Survey</option>
                <option value="UNGRADED_SURVEY">Ungraded Survey</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assignment Group</Form.Label>
              <Form.Select
                value={group}
                onChange={(e) =>
                  setGroup(e.target.value as NonNullable<Quiz["assignmentGroup"]>)
                }
              >
                <option>Quizzes</option>
                <option>Exams</option>
                <option>Assignments</option>
                <option>Project</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="qs-shuffle"
                label="Shuffle Answers"
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Label>Time Limit (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={timeLimitMin}
                  onChange={(e) => setTimeLimitMin(+e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label>Show Correct Answers</Form.Label>
                <Form.Select
                  value={showCorrectAfter}
                  onChange={(e) =>
                    setShowCorrectAfter(
                      e.target.value as QuizSettings["showCorrectAfter"]
                    )
                  }
                >
                  <option value="NEVER">Never</option>
                  <option value="IMMEDIATELY">Immediately</option>
                  <option value="AFTER_DUE">After Due Date</option>
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Access Code</Form.Label>
              <Form.Control
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Optional"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="qs-multi"
                label="Multiple Attempts"
                checked={multipleAttempts}
                onChange={(e) => setMultipleAttempts(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>How Many Attempts</Form.Label>
              <Form.Control
                type="number"
                min={1}
                disabled={!multipleAttempts}
                value={attemptsAllowed}
                onChange={(e) => setAttemptsAllowed(+e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="qs-one"
                label="One Question at a Time"
                checked={oneQuestionAtATime}
                onChange={(e) => setOneQuestionAtATime(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="qs-webcam"
                label="Webcam Required"
                checked={webcamRequired}
                onChange={(e) => setWebcamRequired(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="qs-lock"
                label="Lock Questions After Answering"
                checked={lockAfterAnswering}
                onChange={(e) => setLockAfterAnswering(e.target.checked)}
              />
            </Form.Group>

            {/* Dates */}
            <Row className="mb-3">
              <Col>
                <Form.Label>Due date</Form.Label>
                <Form.Control
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label>Available from</Form.Label>
                <Form.Control
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label>Until</Form.Label>
                <Form.Control
                  type="date"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="light"
            className="border"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="secondary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="danger" onClick={saveAndPublish} disabled={saving}>
            {saving ? "Publishing…" : "Save & Publish"}
          </Button>
        </div>
      </Form>
    </div>
  );
}