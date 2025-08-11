// // src/Kambaz/Courses/Quizzes/QuestionsTab.tsx
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { Button, Dropdown, Form, InputGroup } from "react-bootstrap";
// import type { RootState, AppDispatch } from "../../store";

// // ⬇️ Adjust this import path/names to match your project
// import { questionsThunks } from "./questionsReducer";

// // ------- Tiptap (React 19 compatible) -------
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";

// // ------- Types (align with your backend) ----
// type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";

// type Choice = { id: string; text: string; isCorrect?: boolean };

// type Question = {
//   _id: string;
//   quiz: string;
//   type: QuestionType;
//   title: string;
//   points: number;
//   prompt: string;              // HTML from Tiptap
//   // MCQ
//   choices?: Choice[];
//   // True/False
//   correct?: boolean;
//   // Fill in blank
//   blanks?: string[];
// };

// // ------- Small utils -------
// const uid = () => Math.random().toString(36).slice(2);

// const sumPoints = (qs: Question[]) =>
//   qs.reduce((acc, q) => acc + (Number.isFinite(q.points) ? q.points : 0), 0);

// // ------- Tiny Tiptap wrapper (controlled) -------
// function RichTextEditor({
//   value,
//   onChange,
//   placeholder,
// }: {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
// }) {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: value || "",
//     editorProps: {
//       attributes: {
//         class:
//           "form-control p-2 min-vh-25",
//       },
//     },
//     onUpdate: ({ editor }) => onChange(editor.getHTML()),
//   });

//   // keep editor in sync if parent value changes externally (e.g., select different question)
//   useEffect(() => {
//     if (!editor) return;
//     const html = editor.getHTML();
//     if (value !== html) editor.commands.setContent(value || "", false);
//   }, [value, editor]);

//   // super minimal toolbar
//   if (!editor) return null;
//   return (
//     <div className="border rounded">
//       <div className="d-flex flex-wrap gap-2 p-2 border-bottom bg-light">
//         <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
//           <b>B</b>
//         </Button>
//         <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
//           <i>I</i>
//         </Button>
//         <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
//           • List
//         </Button>
//         <Button size="sm" variant="light" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
//           1. List
//         </Button>
//         <span className="ms-auto text-secondary small">{placeholder}</span>
//       </div>
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

// // ------- Question Cards -------
// function MCQEditor({
//   q,
//   onChange,
// }: {
//   q: Question;
//   onChange: (updates: Partial<Question>) => void;
// }) {
//   const choices = q.choices ?? [{ id: uid(), text: "" }, { id: uid(), text: "" }];

//   return (
//     <>
//       <Form.Group className="mb-2">
//         <Form.Label>Prompt</Form.Label>
//         <RichTextEditor
//           value={q.prompt || "<p></p>"}
//           onChange={(html) => onChange({ prompt: html })}
//           placeholder="Multiple choice question text…"
//         />
//       </Form.Group>

//       <Form.Label className="mt-3">Choices</Form.Label>
//       <div className="d-flex flex-column gap-2">
//         {choices.map((c, idx) => (
//           <InputGroup key={c.id}>
//             <InputGroup.Checkbox
//               checked={!!c.isCorrect}
//               onChange={(e) =>
//                 onChange({
//                   choices: choices.map((x) =>
//                     x.id === c.id ? { ...x, isCorrect: e.currentTarget.checked } : x
//                   ),
//                 })
//               }
//               title="Mark as correct"
//             />
//             <Form.Control
//               placeholder={`Choice ${idx + 1}`}
//               value={c.text}
//               onChange={(e) =>
//                 onChange({
//                   choices: choices.map((x) =>
//                     x.id === c.id ? { ...x, text: e.target.value } : x
//                   ),
//                 })
//               }
//             />
//             <Button
//               variant="outline-danger"
//               onClick={() =>
//                 onChange({ choices: choices.filter((x) => x.id !== c.id) })
//               }
//               disabled={choices.length <= 2}
//             >
//               Remove
//             </Button>
//           </InputGroup>
//         ))}
//         <div>
//           <Button
//             size="sm"
//             variant="outline-secondary"
//             onClick={() => onChange({ choices: [...choices, { id: uid(), text: "" }] })}
//           >
//             + Add choice
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

// function TrueFalseEditor({
//   q,
//   onChange,
// }: {
//   q: Question;
//   onChange: (updates: Partial<Question>) => void;
// }) {
//   return (
//     <>
//       <Form.Group className="mb-2">
//         <Form.Label>Prompt</Form.Label>
//         <RichTextEditor
//           value={q.prompt || "<p></p>"}
//           onChange={(html) => onChange({ prompt: html })}
//           placeholder="True/False statement…"
//         />
//       </Form.Group>
//       <Form.Group className="mt-3">
//         <Form.Label>Correct answer</Form.Label>
//         <div className="d-flex gap-3">
//           <Form.Check
//             type="radio"
//             name={`tf-${q._id || "new"}`}
//             label="True"
//             checked={q.correct === true}
//             onChange={() => onChange({ correct: true })}
//           />
//           <Form.Check
//             type="radio"
//             name={`tf-${q._id || "new"}`}
//             label="False"
//             checked={q.correct === false}
//             onChange={() => onChange({ correct: false })}
//           />
//         </div>
//       </Form.Group>
//     </>
//   );
// }

// function FillBlankEditor({
//   q,
//   onChange,
// }: {
//   q: Question;
//   onChange: (updates: Partial<Question>) => void;
// }) {
//   const blanks = q.blanks ?? [""];
//   return (
//     <>
//       <Form.Group className="mb-2">
//         <Form.Label>Prompt</Form.Label>
//         <RichTextEditor
//           value={q.prompt || "<p></p>"}
//           onChange={(html) => onChange({ prompt: html })}
//           placeholder="Ask a question with a blank the student fills…"
//         />
//       </Form.Group>

//       <Form.Label className="mt-3">Accepted answers</Form.Label>
//       <div className="d-flex flex-column gap-2">
//         {blanks.map((b, idx) => (
//           <InputGroup key={idx}>
//             <Form.Control
//               placeholder={`Answer ${idx + 1}`}
//               value={b}
//               onChange={(e) =>
//                 onChange({
//                   blanks: blanks.map((x, i) => (i === idx ? e.target.value : x)),
//                 })
//               }
//             />
//             <Button
//               variant="outline-danger"
//               onClick={() => onChange({ blanks: blanks.filter((_, i) => i !== idx) })}
//               disabled={blanks.length <= 1}
//             >
//               Remove
//             </Button>
//           </InputGroup>
//         ))}
//         <div>
//           <Button
//             size="sm"
//             variant="outline-secondary"
//             onClick={() => onChange({ blanks: [...blanks, ""] })}
//           >
//             + Add answer
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

// function QuestionCard({
//   q,
//   onSave,
//   onDelete,
// }: {
//   q: Question;
//   onSave: (q: Question) => void;
//   onDelete: (id: string) => void;
// }) {
//   const [editing, setEditing] = useState(!q._id); // new ones start in edit
//   const [draft, setDraft] = useState<Question>({
//     ...q,
//     choices: q.choices ? [...q.choices] : undefined,
//     blanks: q.blanks ? [...q.blanks] : undefined,
//   });

//   useEffect(() => {
//     // keep draft in sync if the store updates this question
//     setDraft({
//       ...q,
//       choices: q.choices ? [...q.choices] : undefined,
//       blanks: q.blanks ? [...q.blanks] : undefined,
//     });
//   }, [q._id]); // eslint-disable-line react-hooks/exhaustive-deps

//   const editorBody = useMemo(() => {
//     switch (draft.type) {
//       case "TRUE_FALSE":
//         return <TrueFalseEditor q={draft} onChange={(u) => setDraft({ ...draft, ...u })} />;
//       case "FILL_BLANK":
//         return <FillBlankEditor q={draft} onChange={(u) => setDraft({ ...draft, ...u })} />;
//       default:
//         return <MCQEditor q={draft} onChange={(u) => setDraft({ ...draft, ...u })} />;
//     }
//   }, [draft]);

//   return (
//     <li className="list-group-item mb-3">
//       {/* Header */}
//       <div className="d-flex align-items-center">
//         {!editing ? (
//           <h6 className="mb-0">{q.title}</h6>
//         ) : (
//           <Form.Control
//             className="me-2"
//             value={draft.title}
//             onChange={(e) => setDraft({ ...draft, title: e.target.value })}
//             placeholder="Question title"
//           />
//         )}

//         <InputGroup style={{ width: 140 }} className="ms-2">
//           <InputGroup.Text>Points</InputGroup.Text>
//           <Form.Control
//             type="number"
//             value={editing ? draft.points : q.points}
//             onChange={(e) =>
//               editing
//                 ? setDraft({ ...draft, points: Number(e.target.value) || 0 })
//                 : undefined
//             }
//             min={0}
//           />
//         </InputGroup>

//         <Form.Select
//           value={editing ? draft.type : q.type}
//           onChange={(e) =>
//             editing ? setDraft({ ...draft, type: e.target.value as QuestionType }) : undefined
//           }
//           className="ms-2"
//           style={{ width: 170 }}
//           disabled={!editing}
//         >
//           <option value="MCQ">Multiple Choice</option>
//           <option value="TRUE_FALSE">True / False</option>
//           <option value="FILL_BLANK">Fill in the Blank</option>
//         </Form.Select>

//         <div className="ms-auto d-flex gap-2">
//           {!editing ? (
//             <>
//               <Button variant="light" className="border" onClick={() => setEditing(true)}>
//                 Edit
//               </Button>
//               <Button variant="outline-danger" onClick={() => onDelete(q._id)}>
//                 Delete
//               </Button>
//             </>
//           ) : (
//             <>
//               <Button
//                 variant="secondary"
//                 onClick={() => {
//                   setEditing(false);
//                   setDraft({
//                     ...q,
//                     choices: q.choices ? [...q.choices] : undefined,
//                     blanks: q.blanks ? [...q.blanks] : undefined,
//                   });
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="danger"
//                 onClick={() => {
//                   onSave({
//                     ...draft,
//                     // ensure MCQ has at least 2 choices
//                     choices:
//                       draft.type === "MCQ"
//                         ? (draft.choices ?? []).slice(0).length >= 2
//                           ? draft.choices
//                           : [
//                               ...(draft.choices ?? []),
//                               { id: uid(), text: "" },
//                               { id: uid(), text: "" },
//                             ]
//                         : undefined,
//                     blanks: draft.type === "FILL_BLANK" ? draft.blanks ?? [""] : undefined,
//                     correct: draft.type === "TRUE_FALSE" ? !!draft.correct : undefined,
//                   });
//                   setEditing(false);
//                 }}
//               >
//                 Save
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Body */}
//       <div className="mt-3">{editing ? editorBody : <div dangerouslySetInnerHTML={{ __html: q.prompt || "" }} />}</div>

//       {/* Preview bits for MCQ / T/F / Blank when not editing */}
//       {!editing && (
//         <div className="mt-3">
//           {q.type === "MCQ" && (q.choices?.length ?? 0) > 0 && (
//             <ul className="mb-0">
//               {q.choices!.map((c) => (
//                 <li key={c.id}>
//                   {c.text} {c.isCorrect ? "✓" : ""}
//                 </li>
//               ))}
//             </ul>
//           )}
//           {q.type === "TRUE_FALSE" && (
//             <div className="text-secondary small">Correct: {q.correct ? "True" : "False"}</div>
//           )}
//           {q.type === "FILL_BLANK" && (
//             <div className="text-secondary small">
//               Accepted answers: {(q.blanks ?? []).filter(Boolean).join(", ") || "—"}
//             </div>
//           )}
//         </div>
//       )}
//     </li>
//   );
// }

// // ------- Main tab -------
// export default function QuestionsTab() {
//   const { qid } = useParams(); // /Quizzes/:qid/...
//   const dispatch = useDispatch<AppDispatch>();
//   const { items: questions, loading } = useSelector(
//     (s: RootState) => s.questionsReducer
//   ) as { items: Question[]; loading: boolean };

//   useEffect(() => {
//     if (qid) dispatch(questionsThunks.fetchByQuiz(qid));
//   }, [qid, dispatch]);

//   const total = sumPoints(questions || []);

//   const addNew = () => {
//     if (!qid) return;
//     // Default: Multiple Choice, 1 point, blank prompt
//     dispatch(
//       questionsThunks.createQuestion({
//         quiz: qid,
//         type: "MCQ",
//         title: "New Question",
//         points: 1,
//         prompt: "<p></p>",
//         choices: [
//           { id: uid(), text: "Option 1", isCorrect: true },
//           { id: uid(), text: "Option 2" },
//         ],
//       })
//     );
//   };

//   const saveQuestion = (q: Question) => {
//     dispatch(questionsThunks.updateQuestion(q));
//   };

//   const deleteQuestion = (id: string) => {
//     dispatch(questionsThunks.deleteQuestion(id));
//   };

//   return (
//     <div className="p-3">
//       <div className="d-flex align-items-center mb-3">
//         <h5 className="mb-0">Questions</h5>
//         <div className="ms-3 text-secondary">Points: {total}</div>
//         <Button className="ms-auto" variant="danger" size="sm" onClick={addNew}>
//           New Question
//         </Button>
//       </div>

//       {loading && <div className="text-secondary">Loading questions…</div>}

//       <ul className="list-group">
//         {(questions || []).map((q) => (
//           <QuestionCard key={q._id} q={q} onSave={saveQuestion} onDelete={deleteQuestion} />
//         ))}
//       </ul>

//       {(questions || []).length === 0 && !loading && (
//         <div className="text-secondary mt-3">No questions yet. Click “New Question”.</div>
//       )}
//     </div>
//   );
// }