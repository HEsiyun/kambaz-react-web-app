// src/Kambaz/Courses/Quizzes/QuestionsTab.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import type { RootState, AppDispatch } from "../../store";
import { questionThunks } from "./questionsReducer";
import QuestionCard from "./QuestionCard";

/** Types aligned with server */
type Choice = { _id: string; text: string; isCorrect?: boolean };
export type Question = {
  _id: string;                 // 'tmp-xxx' for local drafts
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;
  choices?: Choice[];
  answer?: boolean;
  answers?: string[];
};

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const isTemp = (id: string) => id.startsWith("tmp-");

export default function QuestionsTab() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: serverQuestions, loading } = useSelector(
    (s: RootState) => s.questionsReducer
  ) as { items: Question[]; loading: boolean };

  /** Local drafts for NEW questions only (not yet saved to server) */
  const [drafts, setDrafts] = useState<Question[]>([]);

  useEffect(() => {
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
    setDrafts([]); // reset drafts if quiz changes
  }, [qid, dispatch]);

  /** Add a NEW question as a local draft (no API yet) */
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

  /** Footer Cancel: discard drafts and go back to Quiz Details editor */
  const bottomCancel = () => {
    setDrafts([]);
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`);
  };

  /** Persist ALL local drafts as creates, then refresh */
  const saveDrafts = async () => {
    if (!qid || drafts.length === 0) return;
    await Promise.all(
      drafts.map((d) =>
        dispatch(
          questionThunks.createQuestion({
            quiz: qid,
            type: d.type,
            title: d.title,
            points: d.points,
            prompt: d.prompt,
            choices: d.choices,
            answer: d.answer,
            answers: d.answers,
          } as any)
        )
      )
    );
    setDrafts([]);
    dispatch(questionThunks.fetchByQuiz(qid));
  };

  /** When an individual card saves */
  const handleCardSave = (q: Question) => {
    if (isTemp(q._id)) {
      // update the local draft only (not persisted until global Save)
      setDrafts((ds) => ds.map((d) => (d._id === q._id ? q : d)));
    } else {
      // existing question -> save immediately to server
      dispatch(questionThunks.updateQuestion(q));
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

  /** Keep local draft in sync while user edits */
  const handleDraftChange = (draft: Question | null, id: string) => {
    if (!isTemp(id) || !draft) return;
    setDrafts((ds) => ds.map((d) => (d._id === id ? { ...d, ...draft } : d)));
  };

  const rows: Question[] = [...drafts, ...(serverQuestions || [])];
  const hasDrafts = drafts.length > 0;

  const totalPoints = useMemo(() => {
    const serverPts = (serverQuestions || []).reduce(
      (a, q) => a + (Number(q.points) || 0),
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

        {/* Always show New Question at the top */}
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
            // only sync drafts for temp items
            onDraftChange={(d) => handleDraftChange(d as Question | null, q._id)}
          />
        ))}
      </ul>

      {/* Empty-state center CTA when nothing at all */}
      {!loading && rows.length === 0 && (
        <div className="text-center py-5">
          <Button variant="light" className="border px-4 py-2" onClick={addNew}>
            + New Question
          </Button>
        </div>
      )}

      {/* Footer: the ONLY global Save/Cancel */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <Button variant="light" className="border" onClick={bottomCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={saveDrafts} disabled={!hasDrafts}>
          Save
        </Button>
      </div>
    </div>
  );
}