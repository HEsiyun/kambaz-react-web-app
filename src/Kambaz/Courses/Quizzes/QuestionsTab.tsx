// src/Kambaz/Courses/Quizzes/QuestionsTab.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import type { RootState, AppDispatch } from "../../store";
import { questionThunks } from "./questionsReducer";
import QuestionCard from "./QuestionCard";

/** Keep types aligned with your server & questionsClient */
type Choice = { _id: string; text: string; isCorrect?: boolean };
export type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;         // HTML
  choices?: Choice[];     // MC
  answer?: boolean;       // TF
  answers?: string[];     // FIB
};

export default function QuestionsTab() {
  const { cid, qid } = useParams(); // route: /Kambaz/Courses/:cid/Quizzes/:qid/questions (or /edit taps into this tab)
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: questions, loading } = useSelector(
    (s: RootState) => s.questionsReducer
  ) as { items: Question[]; loading: boolean };

  /** Track drafts across cards to enable page-level Save/Cancel */
  const draftsRef = useRef<Map<string, Question>>(new Map());
  const [resetSignal, setResetSignal] = useState(0);
  const [pageDirty, setPageDirty] = useState(false);

  useEffect(() => {
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
  }, [qid, dispatch]);

  /** Called by each QuestionCard on edit start/stop or content change */
  const registerDraft = (id: string, draft: Question | null) => {
    const cache = draftsRef.current;
    if (draft) cache.set(id, draft);
    else cache.delete(id);
    setPageDirty(cache.size > 0);
  };

  /** Header Cancel: discard local edits, stay on this page */
  const handleHeaderCancel = () => {
    draftsRef.current.clear();
    setPageDirty(false);
    setResetSignal((n) => n + 1); // tells cards to exit edit mode
    if (qid) dispatch(questionThunks.fetchByQuiz(qid)); // reload pristine data
  };

  /** Save all pending drafts (no publish) */
  const handleSaveAll = async () => {
    const updates = Array.from(draftsRef.current.values());
    if (updates.length > 0) {
      await Promise.all(updates.map((q) => dispatch(questionThunks.updateQuestion(q))));
    }
    draftsRef.current.clear();
    setPageDirty(false);
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
    setResetSignal((n) => n + 1);
  };

  /** Bottom Cancel: discard local edits and navigate back to quiz edit screen */
  const handleBottomCancel = async () => {
    // same discard behavior as header
    draftsRef.current.clear();
    setPageDirty(false);
    setResetSignal((n) => n + 1);
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
    // then navigate back to the quiz's Details Editor page
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`);
  };

  const totalPoints = useMemo(
    () => (questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

  const addNew = () => {
    if (!qid) return;
    const base = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

    dispatch(
      questionThunks.createQuestion({
        quiz: qid,
        type: "MC",
        title: "New Question",
        points: 1,
        prompt: "<p></p>",
        choices: [
          { _id: base + "-1", text: "Option 1", isCorrect: true },
          { _id: base + "-2", text: "Option 2" },
        ],
      })
    );
  };

  const hasQuestions = (questions?.length ?? 0) > 0;

  return (
    <div className="p-3">
      {/* Header row */}
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0">Questions</h5>
        <div className="ms-3 text-secondary">Points: {totalPoints}</div>

        {!pageDirty ? (
          <Button className="ms-auto" variant="danger" size="sm" onClick={addNew}>
            New Question
          </Button>
        ) : (
          <div className="ms-auto d-flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleHeaderCancel}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleSaveAll}>
              Save
            </Button>
          </div>
        )}
      </div>

      {loading && <div className="text-secondary">Loading questions…</div>}

      {/* When there are questions: render list */}
      {hasQuestions && (
        <ul className="list-group">
          {questions.map((q) => (
            <QuestionCard
              key={q._id}
              q={q}
              onSave={(updated) => dispatch(questionThunks.updateQuestion(updated))}
              onDelete={(id) => dispatch(questionThunks.deleteQuestion(id))}
              resetSignal={resetSignal}                       // asks cards to exit edit
              onDraftChange={(draft) => registerDraft(q._id, draft)} // track page dirty
            />
          ))}
        </ul>
      )}

      {/* When there are NO questions: mimic Canvas-like empty state */}
      {!loading && !hasQuestions && (
        <div className="text-center py-5">
          <Button variant="light" className="border px-4 py-2" onClick={addNew}>
            + New Question
          </Button>
        </div>
      )}

      {/* Footer controls (always visible once not loading) */}
      {!loading && (
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Button variant="light" className="border" onClick={handleBottomCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSaveAll} disabled={!pageDirty}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}