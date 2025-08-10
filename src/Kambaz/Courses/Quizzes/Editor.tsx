// // Details editor (tab 1)
// // Kambaz/Courses/Quizzes/Editor.tsx
// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { Form, Row, Col, Button, Tabs, Tab } from "react-bootstrap";
// import * as api from "./client";

// export default function QuizEditor() {
//   const { qid, cid } = useParams();
//   const navigate = useNavigate();
//   const [quiz, setQuiz] = useState<api.Quiz | null>(null);

//   useEffect(() => {
//     if (!qid) return;
//     (async () => setQuiz(await api.getQuiz(qid)))();
//   }, [qid]);

//   if (!quiz) return <div className="p-3">Loading…</div>;

//   const change = (patch: Partial<api.Quiz>) => setQuiz(prev => prev ? { ...prev, ...patch } : prev);
//   const changeSettings = (patch: Partial<api.Quiz["settings"]>) =>
//     setQuiz(prev => prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev);

//   const save = async (publish = false) => {
//     await api.updateQuiz(quiz._id, quiz);
//     if (publish) await api.setPublished(quiz._id, true);
//     navigate(`/Kambaz/Courses/${cid}/Quizzes${publish ? "" : `/${quiz._id}`}`);
//   };

//   return (
//     <div className="p-3">
//       <Tabs defaultActiveKey="details" className="mb-3">
//         <Tab eventKey="details" title="Details">
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Title</Form.Label>
//               <Form.Control value={quiz.title} onChange={e=>change({ title: e.target.value })}/>
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control as="textarea" rows={3} value={quiz.description ?? ""}
//                             onChange={e=>change({ description: e.target.value })}/>
//             </Form.Group>

//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Label>Quiz Type</Form.Label>
//                 <Form.Select value={quiz.type ?? "GRADED_QUIZ"}
//                              onChange={e=>change({ type: e.target.value as any })}>
//                   <option value="GRADED_QUIZ">Graded Quiz</option>
//                   <option value="PRACTICE_QUIZ">Practice Quiz</option>
//                   <option value="GRADED_SURVEY">Graded Survey</option>
//                   <option value="UNGRADED_SURVEY">Ungraded Survey</option>
//                 </Form.Select>
//               </Col>
//               <Col md={4}>
//                 <Form.Label>Time Limit (min)</Form.Label>
//                 <Form.Control type="number" value={quiz.settings?.timeLimitMin ?? 20}
//                               onChange={e=>changeSettings({ timeLimitMin: +e.target.value })}/>
//               </Col>
//               <Col md={4}>
//                 <Form.Label>Attempts Allowed</Form.Label>
//                 <Form.Control type="number" value={quiz.settings?.attemptsAllowed ?? 1}
//                               onChange={e=>changeSettings({ attemptsAllowed: +e.target.value })}/>
//                 <Form.Check className="mt-2" type="switch" label="Multiple Attempts"
//                             checked={!!quiz.settings?.multipleAttempts}
//                             onChange={e=>changeSettings({ multipleAttempts: e.target.checked })}/>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Check type="switch" label="Shuffle Answers"
//                             checked={!!quiz.settings?.shuffleAnswers}
//                             onChange={e=>changeSettings({ shuffleAnswers: e.target.checked })}/>
//                 <Form.Check type="switch" label="One Question at a time"
//                             checked={!!quiz.settings?.oneQuestionAtATime}
//                             onChange={e=>changeSettings({ oneQuestionAtATime: e.target.checked })}/>
//               </Col>
//               <Col md={4}>
//                 <Form.Label>Available from</Form.Label>
//                 <Form.Control type="datetime-local"
//                               value={quiz.availableFrom?.slice(0,16) || ""}
//                               onChange={e=>change({ availableFrom: e.target.value })}/>
//               </Col>
//               <Col md={4}>
//                 <Form.Label>Until</Form.Label>
//                 <Form.Control type="datetime-local"
//                               value={quiz.availableUntil?.slice(0,16) || ""}
//                               onChange={e=>change({ availableUntil: e.target.value })}/>
//               </Col>
//             </Row>

//             <Row className="mb-4">
//               <Col md={4}>
//                 <Form.Label>Due</Form.Label>
//                 <Form.Control type="datetime-local"
//                               value={quiz.dueDate?.slice(0,16) || ""}
//                               onChange={e=>change({ dueDate: e.target.value })}/>
//               </Col>
//               <Col md={8}>
//                 <Form.Label>Access Code</Form.Label>
//                 <Form.Control value={quiz.settings?.accessCode ?? ""}
//                               onChange={e=>changeSettings({ accessCode: e.target.value })}/>
//               </Col>
//             </Row>

//             <div className="d-flex gap-2">
//               <Button variant="light" className="border" as={Link as unknown as React.ElementType} to={`/Kambaz/Courses/${cid}/Quizzes`}>Cancel</Button>
//               <Button variant="secondary" onClick={()=>save(false)}>Save</Button>
//               <Button variant="danger" onClick={()=>save(true)}>Save & Publish</Button>
//             </div>
//           </Form>
//         </Tab>

//         <Tab eventKey="questions" title="Questions">
//           {/* We’ll implement the Questions editor next */}
//           <div className="text-secondary fst-italic p-3">
//             Questions editor coming next…
//           </div>
//         </Tab>
//       </Tabs>
//     </div>
//   );
// }