import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import {
  addCourse,
  deleteCourse,
  updateCourse,
  enrollUser,
  unenrollUser,
} from "./Courses/reducer";
import { Link } from "react-router-dom";
import { FormControl, Button } from "react-bootstrap";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { courses, enrollments } = useSelector((state: any) => state.coursesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [showAll, setShowAll] = useState(false);
  const [course, setCourse] = useState({
    _id: "",
    name: "",
    description: "",
  });

  const isFaculty = currentUser?.role === "FACULTY";

  // IDs of courses current user is enrolled in
  const enrolledCourseIds = (enrollments ?? [])
    .filter((enr: any) => String(enr.user) === String(currentUser?._id))
    .map((enr: any) => enr.course);

  // Which courses to show
  const displayedCourses = showAll
    ? courses
    : courses.filter((course: { _id: any }) =>
        enrolledCourseIds.includes(course._id)
      );

  // Helper: is user enrolled?
  const isEnrolled = (cid: any) => enrolledCourseIds.includes(cid);

  // Enroll/Unenroll actions
  const handleEnroll = (cid: any) =>
    dispatch(enrollUser({ user: String(currentUser._id), course: String(cid) }));
  const handleUnenroll = (cid: any) =>
    dispatch(unenrollUser({ user: String(currentUser._id), course: String(cid) }));

  // Edit prefill
  const handleEdit = (c: any) => setCourse(c);

  return (
    <div className="p-4" id="wd-dashboard">
      <div className="d-flex align-items-center justify-content-between">
        <h1 id="wd-dashboard-title">Dashboard {currentUser?.username}</h1>
        <Button
          variant="primary"
          className="mb-2"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show My Courses" : "Enrollments"}
        </Button>
      </div>
      <hr />

      {/* Only FACULTY can Add/Update */}
      {isFaculty && (
        <>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              onClick={() => {
                dispatch(addCourse({ ...course, creatorId: currentUser?._id }));
                setCourse({ _id: "", name: "", description: "" });
              }}
              id="wd-add-new-course-click"
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              onClick={() => {
                dispatch(updateCourse(course));
                setCourse({ _id: "", name: "", description: "" });
              }}
              id="wd-update-course-click"
              disabled={!course._id}
            >
              Update
            </button>
          </h5>
          <FormControl
            value={course.name}
            className="mb-2"
            onChange={(e) => setCourse({ ...course, name: e.target.value })}
            placeholder="Course Name"
          />
          <FormControl
            as="textarea"
            value={course.description}
            rows={3}
            className="mb-2"
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            placeholder="Course Description"
          />
          <hr />
        </>
      )}

      <h2 id="wd-dashboard-published">
        {showAll
          ? `All Courses (${courses.length})`
          : `Published Courses (${displayedCourses.length})`}
      </h2>
      <hr />
      <div className="row" id="wd-dashboard-courses">
        <div className="row row-cols-1 row-cols-md-5 g-4">
          {displayedCourses.map((c: any) => (
            <div key={c._id} className="col" style={{ width: "300px" }}>
              <div className="card h-100 shadow-sm">
                <img
                  src={c.image || "/images/reactjs.jpg"}
                  className="card-img-top"
                  width="100%"
                  height={160}
                  alt="Course"
                  style={{ objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="fs-5 fw-bold mb-2">{c.name}</div>
                    <div
                      className="text-secondary mb-3"
                      style={{
                        height: "100px",
                        fontSize: "1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.description}
                    </div>
                  </div>
                  {/* BUTTONS */}
                  <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                    {isEnrolled(c._id) && (
                      <Link
                        to={`/Kambaz/Courses/${c._id}/Home`}
                        className="wd-dashboard-course-link text-decoration-none"
                      >
                        <button
                          className="btn btn-primary"
                          id="wd-go-course-click"
                          style={{ minWidth: 100 }}
                        >
                          Go
                        </button>
                      </Link>
                    )}
                    {isEnrolled(c._id) ? (
                      <button
                        className="btn btn-danger"
                        style={{ minWidth: 100 }}
                        onClick={() => handleUnenroll(c._id)}
                      >
                        Unenroll
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        style={{ minWidth: 100 }}
                        onClick={() => handleEnroll(c._id)}
                      >
                        Enroll
                      </button>
                    )}
                    {isFaculty && (
                      <>
                        <button
                          id="wd-edit-course-click"
                          className="btn btn-warning"
                          style={{ minWidth: 100 }}
                          onClick={(event) => {
                            event.preventDefault();
                            handleEdit(c);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            dispatch(deleteCourse(String(c._id)));
                          }}
                          className="btn btn-danger"
                          style={{ minWidth: 100 }}
                          id="wd-delete-course-click"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}