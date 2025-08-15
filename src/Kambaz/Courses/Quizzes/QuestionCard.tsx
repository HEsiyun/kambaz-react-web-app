import { useEffect, useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { BsTrash, BsPlus } from "react-icons/bs";

/* ---------- Types (aligned with your UI model) ---------- */
type Choice = { _id: string; text: string; isCorrect?: boolean };

/** Extended Question type:
 * - Keeps legacy `answers?: string[]` for 1-blank quizzes
 * - Adds optional `blanks?: { id: string; answers: string[] }[]` for multi-blank authoring
 */
export type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt: string;      // HTML
  choices?: Choice[];  // MC
  answer?: boolean;    // TF (client name)
  answers?: string[];  // FIB (legacy single-blank)
  blanks?: { id: string; answers: string[] }[]; // FIB (multi-blank authoring)
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

/** Normalize incoming question into an editable draft for the selected type */
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
    return { ...q, choices: base, answer: undefined, answers: undefined, blanks: undefined };
  }
  if (q.type === "TF") {
    return { ...q, answer: q.answer ?? false, choices: undefined, answers: undefined, blanks: undefined };
  }
  // FIB
  // Prefer multi-blank if present (server could have acceptableAnswersByBlank)
  const serverMulti: string[][] | undefined = (q as any).acceptableAnswersByBlank;
  const blanks =
    q.blanks ??
    (serverMulti
      ? serverMulti.map((a) => ({ id: rid(), answers: a }))
      : [{ id: rid(), answers: (q.answers ?? [""]).map((s) => (s ?? "").trim()) }]);

  // Guarantee at least one blank and at least one (possibly empty) answer per blank
  const safe = blanks.length ? blanks : [{ id: rid(), answers: [""] }];
  const safeBlanks = safe.map((b) => ({
    id: b.id || rid(),
    answers: (b.answers && b.answers.length ? b.answers : [""]).map((s) => (s ?? "")),
  }));

  return {
    ...q,
    blanks: safeBlanks,
    choices: undefined,
    answer: undefined,
    // keep legacy `answers` in sync with first blank for compatibility
    answers: safeBlanks[0].answers,
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

  /* ---------- FIB helpers (multi-blank) ---------- */
  const addBlank = () => {
    const blanks = draft.blanks ?? [];
    setDraft({ ...draft, blanks: [...blanks, { id: rid(), answers: [""] }] });
  };

  const removeBlank = (idx: number) => {
    const blanks = draft.blanks ?? [];
    if (blanks.length <= 1) return; // keep at least one
    const next = blanks.filter((_, i) => i !== idx);
    setDraft({
      ...draft,
      blanks: next.length ? next : [{ id: rid(), answers: [""] }],
      answers: (next[0]?.answers ?? [""]),
    });
  };

  const updateBlankAnswer = (bIndex: number, aIndex: number, value: string) => {
    const blanks = draft.blanks ?? [];
    blanks[bIndex].answers[aIndex] = value;
    setDraft({ ...draft, blanks: [...blanks], answers: blanks[0]?.answers });
  };

  const addAnswerToBlank = (bIndex: number) => {
    const blanks = draft.blanks ?? [];
    blanks[bIndex].answers = [...blanks[bIndex].answers, ""];
    setDraft({ ...draft, blanks: [...blanks], answers: blanks[0]?.answers });
  };

  const removeAnswerFromBlank = (bIndex: number, aIndex: number) => {
    const blanks = draft.blanks ?? [];
    const answers = blanks[bIndex].answers;
    if (answers.length <= 1) return;
    blanks[bIndex].answers = answers.filter((_, i) => i !== aIndex);
    setDraft({ ...draft, blanks: [...blanks], answers: blanks[0]?.answers });
  };

  /* ---------- Body by type ---------- */
  const body = useMemo(() => {
    if (!editing) {
      // Read multi-blank if available; else fallback to legacy list
      const byBlank: string[][] =
        (q as any).acceptableAnswersByBlank ??
        q.blanks?.map((b) => b.answers) ??
        (q.answers ? [q.answers] : []);

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
              {byBlank.length === 0 ? (
                <>Accepted answers: —</>
              ) : (
                <ul className="mb-0">
                  {byBlank.map((arr, idx) => (
                    <li key={idx}>
                      Blank {idx + 1}: {arr.filter(Boolean).join(", ") || "—"}
                    </li>
                  ))}
                </ul>
              )}
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

    // ===== FIB (multi-blank editor) =====
    const blanks = draft.blanks ?? [{ id: rid(), answers: [""] }];
    return (
      <>
        <Form.Group className="mb-2">
          <Form.Label>Question:</Form.Label>
          <RichTextEditor
            value={draft.prompt || "<p></p>"}
            onChange={(html) => setDraft({ ...draft, prompt: html })}
            placeholder="Ask a question. Use underscores ____ in the text where blanks will appear."
          />
        </Form.Group>

        <div className="d-flex align-items-center mt-3 mb-2">
          <div className="fw-semibold">Blanks & accepted answers</div>
          <Button
            size="sm"
            variant="outline-secondary"
            className="ms-auto"
            onClick={addBlank}
          >
            + Add blank
          </Button>
        </div>

        <div className="d-flex flex-column gap-3">
          {blanks.map((b, bIndex) => (
            <div key={b.id} className="p-2 border rounded bg-white">
              <div className="d-flex align-items-center mb-2">
                <div className="fw-semibold">Blank {bIndex + 1}</div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-auto"
                  disabled={blanks.length <= 1}
                  onClick={() => removeBlank(bIndex)}
                >
                  Remove blank
                </Button>
              </div>

              {(b.answers ?? [""]).map((ans, aIndex) => (
                <InputGroup className="mb-2" key={`${b.id}-${aIndex}`}>
                  <Form.Control
                    placeholder={`Accepted answer ${aIndex + 1}`}
                    value={ans}
                    onChange={(e) => updateBlankAnswer(bIndex, aIndex, e.target.value)}
                    onBlur={() => {
                      // trim empties but keep at least one
                      const trimmed = (draft.blanks ?? []).map((bb, i) =>
                        i !== bIndex
                          ? bb
                          : {
                              ...bb,
                              answers: bb.answers
                                .map((s) => (s ?? "").trim())
                                .filter((s, _, arr) => s.length > 0 || arr.length === 1),
                            }
                      );
                      setDraft({ ...draft, blanks: trimmed, answers: trimmed[0]?.answers });
                    }}
                  />
                  <Button
                    variant="outline-danger"
                    disabled={(b.answers ?? [""]).length <= 1}
                    onClick={() => removeAnswerFromBlank(bIndex, aIndex)}
                  >
                    Remove
                  </Button>
                </InputGroup>
              ))}

              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => addAnswerToBlank(bIndex)}
              >
                + Add answer to blank {bIndex + 1}
              </Button>
            </div>
          ))}
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

        {/* WIDER, non-shrinking Points field */}
        <InputGroup
          className="ms-2 flex-shrink-0"
          style={{ minWidth: 220, width: 240, maxWidth: "35vw" }}
        >
          <InputGroup.Text>Points</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
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
          style={{ width: 180 }}
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
                  // Clean up blanks: trim whitespace and ensure invariants
                  const blanks = (draft.blanks ?? [{ id: rid(), answers: [""] }]).map((b) => ({
                    ...b,
                    answers: (b.answers ?? [])
                      .map((s) => (s ?? "").trim())
                      .filter((s, _i, arr) => s.length > 0 || arr.length === 1),
                  }));
                  const cleaned: Question = {
                    ...draft,
                    blanks,
                    answers: blanks[0]?.answers ?? [""], // keep legacy in sync
                  };
                  onSave(cleaned);
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