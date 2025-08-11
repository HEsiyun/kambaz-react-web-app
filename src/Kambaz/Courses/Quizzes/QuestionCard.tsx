// src/Kambaz/Courses/Quizzes/QuestionCard.tsx
import { useEffect, useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

// ---------- Types (aligned with your server) ----------
type Choice = { _id: string; text: string; isCorrect?: boolean };

export type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;      // HTML
  choices?: Choice[];  // MC
  answer?: boolean;    // TF
  answers?: string[];  // FIB
};

// Props used by QuestionsTab
export type QuestionCardProps = {
  q: Question;
  onSave: (q: Question) => void;
  onDelete: (id: string) => void;

  // page-level Save/Cancel wiring:
  // - when editing starts/changes, pass the draft object
  // - when edit is abandoned or saved, pass null
  onDraftChange?: (draft: Question | null) => void;
  // when this number changes, exit edit mode & reset
  resetSignal?: number;
};

// ---------- Tiny Tiptap (React 19 OK) ----------
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
    editorProps: {
      attributes: {
        class: "form-control p-2 min-vh-25",
      },
    },
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
        <Button
          size="sm"
          variant="light"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}
        >
          <b>B</b>
        </Button>
        <Button
          size="sm"
          variant="light"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive("italic")}
        >
          <i>I</i>
        </Button>
        <Button
          size="sm"
          variant="light"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive("bulletList")}
        >
          • List
        </Button>
        <Button
          size="sm"
          variant="light"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive("orderedList")}
        >
          1. List
        </Button>
        <span className="ms-auto text-secondary small">{placeholder}</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// ---------- Helpers ----------
const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Ensure draft fields exist for each type
function normalizeForType(q: Question): Question {
  if (q.type === "MC") {
    const base = q.choices && q.choices.length >= 2 ? q.choices : [
      { _id: rid(), text: "Option 1", isCorrect: true },
      { _id: rid(), text: "Option 2" },
    ];
    return { ...q, choices: base, answer: undefined, answers: undefined };
  }
  if (q.type === "TF") {
    return { ...q, answer: q.answer ?? false, choices: undefined, answers: undefined };
  }
  // FIB
  return { ...q, answers: q.answers?.length ? q.answers : [""], choices: undefined, answer: undefined };
}

// ================== Component ==================
export default function QuestionCard({
  q,
  onSave,
  onDelete,
  onDraftChange,
  resetSignal,
}: QuestionCardProps) {
  const [editing, setEditing] = useState(!q._id); // new items start in edit mode
  const [draft, setDraft] = useState<Question>(normalizeForType(q));

  // keep draft in sync when parent updates q (or asks to reset)
  useEffect(() => {
    setEditing(false);
    setDraft(normalizeForType(q));
    onDraftChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q._id, resetSignal]);

  // bubble draft changes up so page-level Save/Cancel can track "dirty"
  useEffect(() => {
    if (editing) onDraftChange?.(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft]);

  // When type changes, normalize appropriate fields
  useEffect(() => {
    setDraft((d) => normalizeForType(d));
  }, [draft.type]); // intentional: uses latest state

  // ----- Body editors by type -----
  const body = useMemo(() => {
    if (!editing) {
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
              Accepted answers: {(q.answers ?? []).filter(Boolean).join(", ") || "—"}
            </div>
          )}
        </>
      );
    }

    // EDITING UI
    if (draft.type === "MC") {
      const choices = draft.choices ?? [];
      return (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Prompt</Form.Label>
            <RichTextEditor
              value={draft.prompt || "<p></p>"}
              onChange={(html) => setDraft({ ...draft, prompt: html })}
              placeholder="Multiple choice question text…"
            />
          </Form.Group>

          <Form.Label className="mt-3">Choices</Form.Label>
          <div className="d-flex flex-column gap-2">
            {choices.map((c, idx) => (
              <InputGroup key={c._id}>
                <InputGroup.Checkbox
                  checked={!!c.isCorrect}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      choices: choices.map((x) =>
                        x._id === c._id ? { ...x, isCorrect: e.currentTarget.checked } : x
                      ),
                    })
                  }
                  title="Mark as correct"
                />
                <Form.Control
                  placeholder={`Choice ${idx + 1}`}
                  value={c.text}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      choices: choices.map((x) =>
                        x._id === c._id ? { ...x, text: e.target.value } : x
                      ),
                    })
                  }
                />
                <Button
                  variant="outline-danger"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      choices: choices.filter((x) => x._id !== c._id),
                    })
                  }
                  disabled={choices.length <= 2}
                >
                  Remove
                </Button>
              </InputGroup>
            ))}
            <div>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() =>
                  setDraft({
                    ...draft,
                    choices: [...choices, { _id: rid(), text: "" }],
                  })
                }
              >
                + Add choice
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
            <Form.Label>Prompt</Form.Label>
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
          <Form.Label>Prompt</Form.Label>
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

  // ---------- Render ----------
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
              editing
                ? setDraft({ ...draft, points: Number(e.target.value) || 0 })
                : undefined
            }
          />
        </InputGroup>

        <Form.Select
          value={editing ? draft.type : q.type}
          onChange={(e) =>
            editing
              ? setDraft({ ...draft, type: e.target.value as Question["type"] })
              : undefined
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
                  // final normalization before save
                  const normalized = normalizeForType(draft);
                  onSave(normalized);
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