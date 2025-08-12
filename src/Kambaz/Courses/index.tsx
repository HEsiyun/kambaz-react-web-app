import { useSelector } from "react-redux";
import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import CoursePeople from "./People";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import { FaAlignJustify } from "react-icons/fa";
import Quizzes from "./Quizzes";
import QuizDetails from "./Quizzes/Details";
import QuizEditor from "./Quizzes/Editor";
import QuestionsTab from "./Quizzes/QuestionsTab";
import QuizPreview from "./Quizzes/Preview";
import TakeQuiz from "./Quizzes/Take";

export default function Courses() {
  const { cid } = useParams();
  const { courses, enrollments } = useSelector((state: any) => state.coursesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  // Protect route: Only allow access if user is enrolled in this course
  const isEnrolled = enrollments?.some(
    (enr: any) =>
      String(enr.user) === String(currentUser?._id) &&
      String(enr.course) === String(cid)
  );

  const course = courses.find((course: any) => course._id === cid);
  const { pathname } = useLocation();

  if (!isEnrolled) {
    return <Navigate to="/Kambaz/Dashboard" replace />;
  }

  return (
    <div id="wd-courses">
      <h2 className="text-danger">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        {course?.name} &gt; {pathname.split("/")[4]}
      </h2>
      <hr />
      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="Home" />} />
            <Route path="Home" element={<Home />} />
            <Route path="Modules" element={<Modules />} />
            <Route path="Piazza" element={<h2>Piazza</h2>} />
            <Route path="Zoom" element={<h2>Zoom</h2>} />

            <Route path="Assignments" element={<Assignments />} />
            <Route path="Assignments/new" element={<AssignmentEditor />} />
            <Route path="Assignments/:aid" element={<AssignmentEditor />} />

            {/* QUIZZES */}
            <Route path="Quizzes" element={<Quizzes />} />                     {/* list */}
            <Route path="Quizzes/:qid" element={<QuizDetails />} />            {/* details */}
            <Route path="Quizzes/:qid/edit" element={<QuizEditor />} />        {/* details editor */}
            <Route path="Quizzes/:qid/questions" element={<QuestionsTab />} /> {/* questions editor */}
            <Route path="Quizzes/:qid/preview" element={<QuizPreview />} />    {/* ✅ preview */}
            <Route path="Quizzes/:qid/take" element={<TakeQuiz />} />

            <Route path="Grades" element={<h2>Grades</h2>} />
            <Route path="People" element={<CoursePeople />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}