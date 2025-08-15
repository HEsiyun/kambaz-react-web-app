// src/Kambaz/Courses/Quizzes/QuestionsTab.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import type { RootState, AppDispatch } from "../../store";
import { questionThunks } from "./questionsReducer";
import QuestionCard from "./QuestionCard";
import axios from "axios";

/** Types aligned with UI (client) */
type Choice = { _id: string; text: string; isCorrect?: boolean };
export type Question = {
  _id: string;                 // 'tmp-xxx' for local drafts
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;
  choices?: Choice[];          // MC
  answer?: boolean;            // TF (client field)
  answers?: string[];          // FIB (client field)
};

const HTTP_SERVER =
  (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";
const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const isTemp = (id: string) => id.startsWith("tmp-");

/** Map client draft -> server payload (field names the API expects) */
const toServerPayload = (q: Question): any => {
  const base = {
    quiz: q.quiz,
    type: q.type,
    title: q.title,
    points: Number(q.points) || 0,
    prompt: q.prompt,
  };

  if (q.type === "MC") {
    return {
      ...base,
      choices: (q.choices ?? []).map((c) => ({
        _id: c._id,
        text: (c.text ?? "").trim(),
        isCorrect: !!c.isCorrect,
      })),
    };
  }

  if (q.type === "TF") {
    return {
      ...base,
      correctBoolean: !!q.answer,
    };
  }

  // FIB
  return {
    ...base,
    acceptableAnswers: (q.answers ?? [])
      .map((s) => (s ?? "").trim())
      .filter((s) => s.length > 0),
  };
};

export default function QuestionsTab() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: serverQuestions, loading } = useSelector(
    (s: RootState) => s.questionsReducer
  ) as { items: Question[]; loading: boolean };

  /** Quiz metadata */
  const [quiz, setQuiz] = useState<{ published?: boolean } | null>(null);

  /** Local drafts for NEW questions only (not yet saved to server) */
  const [drafts, setDrafts] = useState<Question[]>([]);

  /** Loading states for buttons */
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (qid) {
      dispatch(questionThunks.fetchByQuiz(qid));
      api.get(`/api/quizzes/${qid}`).then((res) => setQuiz(res.data));
    }
    setDrafts([]);
  }, [qid, dispatch]);

  /** Add a NEW question as a local draft */
  const addNew = () => {
    if (!qid) return;
    setDrafts((ds) => [
      ...ds,
      {
        _id: `tmp-${uid()}`,
        quiz: qid,
        type: "MC",
        title: "New Question",
        points: 1,
        prompt: "<p></p>",
        choices: [
          { _id: uid(), text: "Option 1", isCorrect: true },
          { _id: uid(), text: "Option 2" },
        ],
      },
    ]);
  };

  /** Cancel: discard drafts and go back to Quiz Details editor */
  const bottomCancel = () => {
    setDrafts([]);
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`);
  };

  /** Persist ALL local drafts as creates */
  const saveDrafts = async () => {
    if (!qid || drafts.length === 0) return;
    await Promise.all(
      drafts.map((d) =>
        dispatch(
          questionThunks.createQuestion(toServerPayload(d))
        )
      )
    );
    setDrafts([]);
    dispatch(questionThunks.fetchByQuiz(qid));
  };

  /** Save only */
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDrafts();
    } finally {
      setSaving(false);
    }
  };

  /** Save & Publish */
  const handleSaveAndPublish = async () => {
    setPublishing(true);
    try {
      await saveDrafts();
      await api.put(`/api/quizzes/${qid}`, { published: true });
      setQuiz((q) => ({ ...q, published: true }));
    } finally {
      setPublishing(false);
    }
  };

  /** When an individual card saves */
  const handleCardSave = (q: Question) => {
    if (isTemp(q._id)) {
      setDrafts((ds) => ds.map((d) => (d._id === q._id ? q : d)));
    } else {
      dispatch(questionThunks.updateQuestion({ _id: q._id, ...toServerPayload(q) } as any));
    }
  };

  /** When an individual card deletes */
  const handleCardDelete = (id: string) => {
    if (isTemp(id)) {
      setDrafts((ds) => ds.filter((d) => d._id !== id));
    } else {
      dispatch(questionThunks.deleteQuestion(id));
    }
  };

  /** Keep local draft in sync while editing */
  const handleDraftChange = (draft: Question | null, id: string) => {
    if (!isTemp(id) || !draft) return;
    setDrafts((ds) => ds.map((d) => (d._id === id ? { ...d, ...draft } : d)));
  };

  const rows: Question[] = [...drafts, ...(serverQuestions || [])];
  const hasDrafts = drafts.length > 0;

  const totalPoints = useMemo(() => {
    const serverPts = (serverQuestions || []).reduce(
      (a, q) => a + (Number((q as any).points) || 0),
      0
    );
    const draftPts = drafts.reduce((a, q) => a + (Number(q.points) || 0), 0);
    return serverPts + draftPts;
  }, [serverQuestions, drafts]);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0">Questions</h5>
        <div className="ms-3 text-secondary">Points: {totalPoints}</div>
        <Button className="ms-auto" variant="danger" size="sm" onClick={addNew}>
          New Question
        </Button>
      </div>

      {loading && <div className="text-secondary">Loading questions…</div>}

      {/* List */}
      <ul className="list-group">
        {rows.map((q) => (
          <QuestionCard
            key={q._id}
            q={q}
            onSave={handleCardSave}
            onDelete={handleCardDelete}
            onDraftChange={(d) => handleDraftChange(d as Question | null, q._id)}
          />
        ))}
      </ul>

      {!loading && rows.length === 0 && (
        <div className="text-center py-5">
          <Button variant="light" className="border px-4 py-2" onClick={addNew}>
            + New Question
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <Button
          variant="light"
          className="border"
          onClick={bottomCancel}
          disabled={saving || publishing}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={saving || publishing || !hasDrafts}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="danger"
          onClick={handleSaveAndPublish}
          disabled={
            publishing ||
            saving ||
            (quiz?.published && !hasDrafts)
          }
        >
          {publishing ? "Publishing…" : (quiz?.published && !hasDrafts ? "Published" : "Save & Publish")}
        </Button>
      </div>
    </div>
  );
}