// src/Kambaz/Courses/Quizzes/QuestionCard.tsx
import { useEffect, useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { BsTrash, BsPlus } from "react-icons/bs";

/* ---------- Types (aligned with your UI model) ---------- */
type Choice = { _id: string; text: string; isCorrect?: boolean };

export type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;      // HTML
  choices?: Choice[];  // MC
  answer?: boolean;    // TF (client name)
  answers?: string[];  // FIB (client name)
  // tolerant fallback fields if API returns server names
  // (we don't declare them in the type, but we'll read via any-safety)
};

export type QuestionCardProps = {
  q: Question;
  onSave: (q: Question) => void;
  onDelete: (id: string) => void;
  onDraftChange?: (draft: Question | null) => void;
  resetSignal?: number;
};

/* ---------- Tiny Tiptap ---------- */
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    editorProps: { attributes: { class: "form-control p-2 min-vh-25" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (value !== html) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded">
      <div className="d-flex flex-wrap gap-2 p-2 border-bottom bg-light">
        <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleBold().run()}
                aria-pressed={editor.isActive("bold")}><b>B</b></Button>
        <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-pressed={editor.isActive("italic")}><i>I</i></Button>
        <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-pressed={editor.isActive("bulletList")}>• List</Button>
        <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-pressed={editor.isActive("orderedList")}>1. List</Button>
        <span className="ms-auto text-secondary small">{placeholder}</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

/* ---------- Helpers ---------- */
const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function normalizeForType(q: Question): Question {
  if (q.type === "MC") {
    const base =
      q.choices && q.choices.length >= 2
        ? q.choices
        : [
            { _id: rid(), text: "Option 1", isCorrect: true },
            { _id: rid(), text: "Option 2" },
          ];
    if (!base.some((c) => c.isCorrect)) base[0].isCorrect = true;
    return { ...q, choices: base, answer: undefined, answers: undefined };
  }
  if (q.type === "TF") {
    return { ...q, answer: q.answer ?? false, choices: undefined, answers: undefined };
  }
  // FIB
  const cleaned = (q.answers ?? [""]).map((s) => (s ?? "").trim());
  return {
    ...q,
    answers: cleaned.length ? cleaned : [""],
    choices: undefined,
    answer: undefined,
  };
}

/* ================== Component ================== */
export default function QuestionCard({
  q,
  onSave,
  onDelete,
  onDraftChange,
  resetSignal,
}: QuestionCardProps) {
  const [editing, setEditing] = useState(!q._id);
  const [draft, setDraft] = useState<Question>(normalizeForType(q));

  useEffect(() => {
    setEditing(false);
    setDraft(normalizeForType(q));
    onDraftChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q._id, resetSignal]);

  useEffect(() => {
    if (editing) onDraftChange?.(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft]);

  useEffect(() => {
    setDraft((d) => normalizeForType(d));
  }, [draft.type]);

  /* ---------- MC helpers ---------- */
  const setCorrect = (choiceId: string) => {
    if (!draft.choices) return;
    setDraft({
      ...draft,
      choices: draft.choices.map((c) => ({ ...c, isCorrect: c._id === choiceId })),
    });
  };

  const updateChoiceText = (choiceId: string, text: string) => {
    if (!draft.choices) return;
    setDraft({
      ...draft,
      choices: draft.choices.map((c) => (c._id === choiceId ? { ...c, text } : c)),
    });
  };

  const removeChoice = (choiceId: string) => {
    if (!draft.choices) return;
    const next = draft.choices.filter((c) => c._id !== choiceId);
    if (next.length >= 2 && !next.some((c) => c.isCorrect)) next[0].isCorrect = true;
    setDraft({ ...draft, choices: next.length >= 2 ? next : draft.choices });
  };

  const addChoice = () => {
    const next = [...(draft.choices ?? []), { _id: rid(), text: "" }];
    setDraft({ ...draft, choices: next });
  };

  /* ---------- Body by type ---------- */
  const body = useMemo(() => {
    if (!editing) {
      // tolerate server field names on read (global save path)
      const fibViewAnswers =
        (q.answers && q.answers.length ? q.answers : (q as any).acceptableAnswers) ?? [];

      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: q.prompt || "" }} />
          {q.type === "MC" && q.choices && q.choices.length > 0 && (
            <ul className="mt-2 mb-0">
              {q.choices.map((c) => (
                <li key={c._id}>
                  {c.text} {c.isCorrect ? "✓" : ""}
                </li>
              ))}
            </ul>
          )}
          {q.type === "TF" && (
            <div className="text-secondary small mt-2">
              Correct: {q.answer ? "True" : "False"}
            </div>
          )}
          {q.type === "FIB" && (
            <div className="text-secondary small mt-2">
              Accepted answers: {fibViewAnswers.filter(Boolean).join(", ") || "—"}
            </div>
          )}
        </>
      );
    }

    if (draft.type === "MC") {
      const choices = draft.choices ?? [];
      return (
        <>
          <div className="text-secondary small mb-2">
            Enter your question and multiple answers, then select the one correct answer.
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold">Question:</Form.Label>
            <RichTextEditor
              value={draft.prompt || "<p></p>"}
              onChange={(html) => setDraft({ ...draft, prompt: html })}
              placeholder="Multiple choice question text…"
            />
          </Form.Group>

          <div className="fw-semibold mt-3 mb-2">Answers:</div>

          <div className="d-flex flex-column gap-2">
            {choices.map((c, idx) => {
              const radioName = `mc-correct-${draft._id || "new"}`;
              const label = c.isCorrect ? "Correct Answer" : "Possible Answer";
              return (
                <div key={c._id} className="p-2 border rounded bg-white">
                  <div className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="radio"
                      name={radioName}
                      className="me-2"
                      checked={!!c.isCorrect}
                      onChange={() => setCorrect(c._id)}
                    />
                    <span className={c.isCorrect ? "text-success fw-semibold" : "text-secondary"}>
                      {label}
                    </span>
                    <div className="ms-auto d-flex align-items-center gap-2">
                      <span className="text-secondary small">Choice {idx + 1}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateChoiceText(c._id, "")}
                        title="Clear"
                      >
                        <BsPlus style={{ transform: "rotate(45deg)" }} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeChoice(c._id)}
                        disabled={choices.length <= 2}
                        title="Delete choice"
                      >
                        <BsTrash />
                      </Button>
                    </div>
                  </div>

                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder="Answer text…"
                    value={c.text}
                    onChange={(e) => updateChoiceText(c._id, e.target.value)}
                  />
                </div>
              );
            })}

            <div className="mt-1">
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={addChoice}
                className="d-inline-flex align-items-center"
              >
                <BsPlus className="me-1" /> Add Another Answer
              </Button>
            </div>
          </div>
        </>
      );
    }

    if (draft.type === "TF") {
      return (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Question:</Form.Label>
            <RichTextEditor
              value={draft.prompt || "<p></p>"}
              onChange={(html) => setDraft({ ...draft, prompt: html })}
              placeholder="True/False statement…"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Correct answer</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                name={`tf-${draft._id || "new"}`}
                label="True"
                checked={draft.answer === true}
                onChange={() => setDraft({ ...draft, answer: true })}
              />
              <Form.Check
                type="radio"
                name={`tf-${draft._id || "new"}`}
                label="False"
                checked={draft.answer === false}
                onChange={() => setDraft({ ...draft, answer: false })}
              />
            </div>
          </Form.Group>
        </>
      );
    }

    // FIB
    const answers = draft.answers ?? [""];
    return (
      <>
        <Form.Group className="mb-2">
          <Form.Label>Question:</Form.Label>
          <RichTextEditor
            value={draft.prompt || "<p></p>"}
            onChange={(html) => setDraft({ ...draft, prompt: html })}
            placeholder="Ask a question with a blank the student fills…"
          />
        </Form.Group>

        <Form.Label className="mt-3">Accepted answers</Form.Label>
        <div className="d-flex flex-column gap-2">
          {answers.map((ans, idx) => (
            <InputGroup key={idx}>
              <Form.Control
                placeholder={`Answer ${idx + 1}`}
                value={ans}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    answers: answers.map((x, i) => (i === idx ? e.target.value : x)),
                  })
                }
                onBlur={() =>
                  setDraft((d) => ({
                    ...d,
                    answers: (d.answers ?? [])
                      .map((s) => (s ?? "").trim())
                      .filter((s, _i, arr) => s.length > 0 || arr.length === 1),
                  }))
                }
              />
              <Button
                variant="outline-danger"
                onClick={() =>
                  setDraft({ ...draft, answers: answers.filter((_, i) => i !== idx) })
                }
                disabled={answers.length <= 1}
              >
                Remove
              </Button>
            </InputGroup>
          ))}
          <div>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setDraft({ ...draft, answers: [...answers, ""] })}
            >
              + Add answer
            </Button>
          </div>
        </div>
      </>
    );
  }, [editing, draft, q]);

  /* ---------- Render ---------- */
  return (
    <li className="list-group-item mb-3">
      {/* Header row */}
      <div className="d-flex align-items-center">
        {!editing ? (
          <h6 className="mb-0">{q.title}</h6>
        ) : (
          <Form.Control
            className="me-2"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Question title"
          />
        )}

        <InputGroup style={{ width: 140 }} className="ms-2">
          <InputGroup.Text>Points</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            value={editing ? draft.points : q.points}
            onChange={(e) =>
              editing ? setDraft({ ...draft, points: Number(e.target.value) || 0 }) : undefined
            }
          />
        </InputGroup>

        <Form.Select
          value={editing ? draft.type : q.type}
          onChange={(e) =>
            editing ? setDraft({ ...draft, type: e.target.value as Question["type"] }) : undefined
          }
          className="ms-2"
          style={{ width: 170 }}
          disabled={!editing}
        >
          <option value="MC">Multiple Choice</option>
          <option value="TF">True / False</option>
          <option value="FIB">Fill in the Blank</option>
        </Form.Select>

        <div className="ms-auto d-flex gap-2">
          {!editing ? (
            <>
              <Button
                variant="light"
                className="border"
                onClick={() => {
                  setEditing(true);
                  onDraftChange?.(normalizeForType(q));
                }}
              >
                Edit
              </Button>
              <Button variant="outline-danger" onClick={() => onDelete(q._id)}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setDraft(normalizeForType(q)); // revert
                  onDraftChange?.(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const cleaned =
                    draft.type === "FIB"
                      ? {
                          ...draft,
                          answers: (draft.answers ?? [])
                            .map((s) => (s ?? "").trim())
                            .filter((s) => s.length > 0),
                        }
                      : draft;
                  onSave(normalizeForType(cleaned));
                  setEditing(false);
                  onDraftChange?.(null);
                }}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-3">{body}</div>
    </li>
  );
}