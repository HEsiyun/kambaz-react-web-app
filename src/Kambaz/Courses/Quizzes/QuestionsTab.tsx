// src/Kambaz/Courses/Quizzes/QuestionsTab.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import type { RootState, AppDispatch } from "../../store";
import { questionThunks } from "./questionsReducer"; // <<< make sure this name matches your export
import QuestionCard from "./QuestionCard";

/* ---------- Types that match your backend ---------- */
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
  const { qid } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { items: questions, loading } = useSelector(
    (s: RootState) => s.questionsReducer
  ) as { items: Question[]; loading: boolean };

  // Track drafts across cards for page-level Save/Cancel
  const draftsRef = useRef<Map<string, Question>>(new Map());
  const [resetSignal, setResetSignal] = useState(0);
  const [pageDirty, setPageDirty] = useState(false);

  useEffect(() => {
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
  }, [qid, dispatch]);

  // Called by each QuestionCard on edit start/stop or changes
  const registerDraft = (id: string, draft: Question | null) => {
    const cache = draftsRef.current;
    if (draft) cache.set(id, draft);
    else cache.delete(id);
    setPageDirty(cache.size > 0);
  };

  const handlePageCancel = () => {
    draftsRef.current.clear();
    setPageDirty(false);
    setResetSignal((n) => n + 1); // tell cards to exit edit mode
    if (qid) dispatch(questionThunks.fetchByQuiz(qid)); // reload from server
  };

  const handlePageSave = async () => {
    const updates = Array.from(draftsRef.current.values());
    await Promise.all(updates.map((q) => dispatch(questionThunks.updateQuestion(q))));
    draftsRef.current.clear();
    setPageDirty(false);
    if (qid) dispatch(questionThunks.fetchByQuiz(qid));
    setResetSignal((n) => n + 1);
  };

  const totalPoints = useMemo(
    () => (questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

  const addNew = () => {
    if (!qid) return;
    const rid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    dispatch(
      questionThunks.createQuestion({
        quiz: qid,
        type: "MC", // <-- matches backend
        title: "New Question",
        points: 1,
        prompt: "<p></p>",
        choices: [
          { _id: rid + "-1", text: "Option 1", isCorrect: true },
          { _id: rid + "-2", text: "Option 2" },
        ],
      })
    );
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <h5 className="mb-0">Questions</h5>
        <div className="ms-3 text-secondary">Points: {totalPoints}</div>

        {!pageDirty ? (
          <Button className="ms-auto" variant="danger" size="sm" onClick={addNew}>
            New Question
          </Button>
        ) : (
          <div className="ms-auto d-flex gap-2">
            <Button variant="secondary" size="sm" onClick={handlePageCancel}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handlePageSave}>
              Save
            </Button>
          </div>
        )}
      </div>

      {loading && <div className="text-secondary">Loading questions…</div>}

      <ul className="list-group">
        {(questions || []).map((q) => (
          <QuestionCard
            key={q._id}
            q={q}
            onSave={(updated) => dispatch(questionThunks.updateQuestion(updated))}
            onDelete={(id) => dispatch(questionThunks.deleteQuestion(id))}
            resetSignal={resetSignal}                 // tells cards to exit edit mode
            onDraftChange={(draft) => registerDraft(q._id, draft)} // page-level tracking
          />
        ))}
      </ul>

      {/* Bottom controls for long pages */}
      {(questions || []).length > 0 && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          {pageDirty ? (
            <>
              <Button variant="secondary" onClick={handlePageCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handlePageSave}>
                Save
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={addNew}>
              New Question
            </Button>
          )}
        </div>
      )}
    </div>
  );
}