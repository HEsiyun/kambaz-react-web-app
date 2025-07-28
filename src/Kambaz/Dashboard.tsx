import { Link } from "react-router-dom";
import { FormControl } from "react-bootstrap";
import { useSelector } from "react-redux"; 
import * as db from "./Database";

export default function Dashboard({
  courses,
  course,
  setCourse,
  addNewCourse,
  deleteCourse,
  updateCourse,
}: {
  courses: any[];
  course: any;
  setCourse: (course: any) => void;
  addNewCourse: () => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: () => void;
}) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { enrollments } = db;

  // Only allow editing for FACULTY
  const isFaculty = currentUser?.role === "FACULTY";

  return (
    <div className="p-4" id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard {currentUser?.username}</h1>
      <hr />

      {/* Only show new course form and buttons for FACULTY */}
      {isFaculty && (
        <>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              onClick={addNewCourse}
              id="wd-add-new-course-click"
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              onClick={updateCourse}
              id="wd-update-course-click"
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
        Published Courses ({courses.length})
      </h2>
      <hr />
      <div className="row" id="wd-dashboard-courses">
        <div className="row row-cols-1 row-cols-md-5 g-4">
          {courses
            .filter((course) =>
              enrollments.some(
                (enrollment) =>
                  enrollment.course === course._id &&
                  enrollment.user === currentUser?._id
              )
            )
            .map((c) => (
              <div key={c._id} className="col" style={{ width: "300px" }}>
                <div className="card">
                  <img
                    src={c.image || "/images/reactjs.jpg"}
                    className="card-img-top"
                    width="100%"
                    height={160}
                    alt="Course"
                  />
                  <div className="card-body">
                    <div className="wd-dashboard-course-title text-nowrap overflow-hidden">
                      {c.name}
                    </div>
                    <div
                      className="wd-dashboard-course-description overflow-hidden"
                      style={{ height: "100px" }}
                    >
                      {c.description}
                    </div>
                    {/* Go button is for everyone, but Edit/Delete only for FACULTY */}
                    <div className="d-flex justify-content-between mt-3">
                      <Link
                        to={`/Kambaz/Courses/${c._id}/Home`}
                        className="wd-dashboard-course-link text-decoration-none"
                      >
                        <button
                          className="btn btn-primary me-2"
                          id="wd-go-course-click"
                        >
                          Go
                        </button>
                      </Link>
                      {isFaculty && (
                        <>
                          <button
                            id="wd-edit-course-click"
                            className="btn btn-warning me-2 float-end"
                            onClick={(event) => {
                              event.preventDefault();
                              setCourse(c);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              deleteCourse(c._id);
                            }}
                            className="btn btn-danger float-end"
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