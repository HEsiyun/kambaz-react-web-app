// src/Kambaz/Courses/Quizzes/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Dropdown,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import type { AppDispatch, RootState } from "../../store";
import { quizThunks, type Quiz } from "./reducer";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import axios from "axios";

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

function availabilityLabel(q: Quiz, now = new Date()) {
  const from = q.availableFrom ? new Date(q.availableFrom) : undefined;
  const until = q.availableUntil ? new Date(q.availableUntil) : undefined;

  if (from && now < from) return `Not available until ${fmt(q.availableFrom)}`;
  if (until && now > until) return "Closed";
  return "Available";
}

export default function Quizzes() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { list, loading, error } = useSelector(
    (s: RootState) => s.quizzesReducer
  );
  const currentUser = useSelector(
    (s: RootState) =>
      s.accountReducer.currentUser as { _id?: string; role?: string } | null
  );
  const isFaculty = currentUser?.role === "FACULTY";

  // ---- extra data maps (loaded lazily) ----
  const [pointsByQuiz, setPoints] = useState<Record<string, number>>({});
  const [countByQuiz, setCount] = useState<Record<string, number>>({});
  const [scoreByQuiz, setScore] = useState<Record<string, number>>({}); // last attempt

  // Base URL for server calls
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

  // Load quizzes for this course
  useEffect(() => {
    if (cid) dispatch(quizThunks.fetchQuizzes(cid));
  }, [cid, dispatch]);

  // 🔒 Students should only see published quizzes
  const visibleList = useMemo(
    () => (isFaculty ? list : list.filter((q) => q.published === true)),
    [list, isFaculty]
  );

  // Load extra per-quiz bits (points, question count, last score) — only for *visible* quizzes
  useEffect(() => {
    if (!visibleList.length) return;

    visibleList.forEach(async (q) => {
      // points
      if (pointsByQuiz[q._id] == null) {
        try {
          const { data } = await api.get<{ total: number }>(
            `/api/quizzes/${q._id}/points`
          );
          setPoints((m) => ({ ...m, [q._id]: data.total ?? 0 }));
        } catch {}
      }

      // question count
      if (countByQuiz[q._id] == null) {
        try {
          const { data } = await api.get<any[]>(
            `/api/quizzes/${q._id}/questions`
          );
          setCount((m) => ({
            ...m,
            [q._id]: Array.isArray(data) ? data.length : 0,
          }));
        } catch {}
      }

      // last score (optional endpoint) — students only
      if (!isFaculty && scoreByQuiz[q._id] == null) {
        try {
          const { data } = await api.get<{ score: number }>(
            `/api/quizzes/${q._id}/last-score`
          );
          if (typeof data?.score === "number") {
            setScore((m) => ({ ...m, [q._id]: data.score }));
          }
        } catch {
          // ignore if endpoint not implemented yet
        }
      }
    });
  }, [visibleList, api, isFaculty, pointsByQuiz, countByQuiz, scoreByQuiz]);

  // ---- SORT BY "Available until" (ascending). Items without it go last. ----
  const sortedList = useMemo(() => {
    const keyUntil = (q: Quiz) =>
      q.availableUntil
        ? new Date(q.availableUntil).getTime()
        : Number.POSITIVE_INFINITY;
    const keyFrom = (q: Quiz) =>
      q.availableFrom
        ? new Date(q.availableFrom).getTime()
        : Number.POSITIVE_INFINITY;

    return [...visibleList].sort((a, b) => {
      const ua = keyUntil(a);
      const ub = keyUntil(b);
      if (ua !== ub) return ua - ub; // earlier "until" first

      // tie-breaker: earlier "from" first
      const fa = keyFrom(a);
      const fb = keyFrom(b);
      if (fa !== fb) return fa - fb;

      // final tie-breaker: title
      const at = (a.title ?? "").toLowerCase();
      const bt = (b.title ?? "").toLowerCase();
      return at.localeCompare(bt);
    });
  }, [visibleList]);

  const add = async () => {
    if (!cid || creating) return;
    try {
      setCreating(true);
      const action: any = await dispatch(
        quizThunks.createQuizThunk({
          cid,
          data: { title: "New Quiz", description: "", published: false },
        })
      );
      const created = action?.payload ?? action;
      if (created && created._id) {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${created._id}/edit`);
      }
    } finally {
      setCreating(false);
    }
  };
  const [creating, setCreating] = useState(false);

  const goEdit = (q: Quiz) =>
    navigate(`/Kambaz/Courses/${q.course}/Quizzes/${q._id}/edit`);

  const remove = (qid: string) => dispatch(quizThunks.deleteQuizThunk(qid));

  const togglePublish = (q: Quiz) =>
    dispatch(
      quizThunks.publishQuizThunk({ qid: q._id, published: !q.published })
    );

  return (
    <div className="p-3">
      <div className="d-flex align-items-center mb-3">
        <h3 className="mb-0">Quizzes</h3>
        {isFaculty && (
          <Button
            size="sm"
            className="ms-auto"
            variant="danger"
            onClick={add}
            disabled={creating}
          >
            <FaPlus className="me-2" />
            {creating ? "Creating…" : "Quiz"}
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-secondary">
          <Spinner size="sm" className="me-2" />
          Loading…
        </div>
      )}
      {error && <div className="text-danger">Error: {error}</div>}

      {!loading && sortedList.length === 0 && (
        <div className="text-secondary">
          {isFaculty ? "No quizzes yet. Click + Quiz to create one." : "No published quizzes yet."}
        </div>
      )}

      <ul className="list-group">
        {sortedList.map((q) => {
          const avail = availabilityLabel(q);
          // Show Available until instead of due date
          const until = q.availableUntil
            ? `Available until: ${fmt(q.availableUntil)}`
            : undefined;

          const pts =
            pointsByQuiz[q._id] != null ? `${pointsByQuiz[q._id]} pts` : undefined;
          const qs =
            countByQuiz[q._id] != null ? `${countByQuiz[q._id]} Questions` : undefined;
          const lastScore =
            !isFaculty && scoreByQuiz[q._id] != null
              ? `Score: ${scoreByQuiz[q._id]}`
              : undefined;

          const bits = [avail, until, pts, qs, lastScore].filter(Boolean);

          return (
            <li
              key={q._id}
              className="list-group-item d-flex align-items-start border-0 border-start border-primary border-4 mb-2"
            >
              {/* LEFT: title + meta */}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold">
                    <Link
                      to={`/Kambaz/Courses/${q.course}/Quizzes/${q._id}`}
                      className="text-decoration-none"
                    >
                      {q.title}
                    </Link>
                  </span>
                </div>

                <div className="small text-secondary">
                  {bits.map((b, i) => (
                    <span key={i}>
                      {b}
                      {i < bits.length - 1 ? " | " : ""}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT: publish icon + 3-dot menu (faculty only) */}
              {isFaculty && (
                <>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{q.published ? "Published" : "Unpublished"}</Tooltip>
                    }
                  >
                    <span className="me-2 mt-1">
                      {q.published ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaRegCircle className="text-secondary" />
                      )}
                    </span>
                  </OverlayTrigger>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      size="sm"
                      className="border-0"
                      id={`quiz-menu-${q._id}`}
                      aria-label="Quiz actions"
                    >
                      <BsThreeDotsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => goEdit(q)}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => togglePublish(q)}>
                        {q.published ? "Unpublish" : "Publish"}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => remove(q._id)}
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}