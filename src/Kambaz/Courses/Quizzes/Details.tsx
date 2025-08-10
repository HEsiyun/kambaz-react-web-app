// // Faculty details screen
// // Kambaz/Courses/Quizzes/Details.tsx
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { Card, Button, Row, Col, Badge } from "react-bootstrap";
// import * as api from "./client";

// export default function QuizDetails() {
//   const { cid, qid } = useParams();
//   const [quiz, setQuiz] = useState<api.Quiz | null>(null);
//   const [points, setPoints] = useState<number>(0);

//   useEffect(() => {
//     if (!qid) return;
//     (async () => {
//       setQuiz(await api.getQuiz(qid));
//       const p = await api.getPoints(qid);
//       setPoints(p.total ?? 0);
//     })();
//   }, [qid]);

//   if (!quiz) return <div className="p-3">Loading…</div>;

//   return (
//     <div className="p-3">
//       <Card>
//         <Card.Body>
//           <Card.Title className="d-flex align-items-center">
//             {quiz.title}
//             <Badge bg={quiz.published ? "success":"secondary"} className="ms-2">
//               {quiz.published ? "Published" : "Unpublished"}
//             </Badge>
//           </Card.Title>
//           <Card.Text className="text-secondary">{quiz.description}</Card.Text>

//           <Row className="mb-3">
//             <Col md={4}><b>Points:</b> {points}</Col>
//             <Col md={4}><b>Type:</b> {quiz.type?.replace("_"," ")}</Col>
//             <Col md={4}><b>Time limit:</b> {quiz.settings?.timeLimitMin} min</Col>
//           </Row>

//           <Row className="mb-2">
//             <Col md={4}><b>Available from:</b> {quiz.availableFrom ? new Date(quiz.availableFrom).toLocaleString() : "-"}</Col>
//             <Col md={4}><b>Until:</b> {quiz.availableUntil ? new Date(quiz.availableUntil).toLocaleString() : "-"}</Col>
//             <Col md={4}><b>Due:</b> {quiz.dueDate ? new Date(quiz.dueDate).toLocaleString() : "-"}</Col>
//           </Row>

//           <div className="d-flex gap-2">
//             <Link to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`}>
//               <Button variant="secondary">Edit</Button>
//             </Link>
//             <Link to={`/Kambaz/Courses/${cid}/Quizzes`}>
//               <Button variant="light" className="border">Back to list</Button>
//             </Link>
//           </div>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }