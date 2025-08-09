// src/Kambaz/Dashboard.tsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FormControl } from "react-bootstrap";
import type { RootState, AppDispatch } from "./store";
import { enrollmentThunks } from "./Courses/Enrollments/reducer";

type DashboardProps = {
  // passed from Kambaz
  courses: any[];
  course: any | null;
  setCourse: (c: any | null) => void;

  // existing
  addNewCourse: (c: any) => Promise<any>;
  deleteCourse: (cid: string) => Promise<void>;
  updateCourse: (c: any) => Promise<void>;
  enrolling: boolean;
  setEnrolling: (enrolling: boolean) => void;
  updateEnrollment: (courseId: string, enrolled: boolean) => void
};

export default function Dashboard({
  courses,
  course: _unusedCourse,
  setCourse,
  addNewCourse,
  deleteCourse,
  updateCourse,
  enrolling,
  setEnrolling,
  updateEnrollment
}: DashboardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(
    (s: RootState) => s.accountReducer.currentUser
  ) as { _id?: string; username?: string; role?: string } | null;


  useEffect(() => {
    if (currentUser?._id) {
      dispatch(enrollmentThunks.fetchEnrollments(currentUser._id));
    }
  }, [currentUser, dispatch]);

  const isFaculty = currentUser?.role === "FACULTY";

  const [courseForm, setCourseForm] = useState({
    _id: "",
    name: "",
    description: "",
  });

  return (
    <div className="p-4" id="wd-dashboard">
      <h1 id="wd-dashboard-title" className="mb-3">
        Dashboard
        <button
          onClick={() => setEnrolling(!enrolling)}
          className="float-end btn btn-primary"
        >
          {enrolling ? "My Courses" : "All Courses"}
        </button>
      </h1>
      <hr />

      {isFaculty && (
        <>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              onClick={async () => {
                if (!courseForm.name) return;
                await addNewCourse(courseForm);
                setCourseForm({ _id: "", name: "", description: "" });
              }}
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              disabled={!courseForm._id}
              onClick={async () => {
                await updateCourse(courseForm);
                setCourseForm({ _id: "", name: "", description: "" });
              }}
            >
              Update
            </button>
          </h5>
          <FormControl
            className="mb-2"
            placeholder="Course Name"
            value={courseForm.name}
            onChange={(e) =>
              setCourseForm({ ...courseForm, name: e.target.value })
            }
          />
          <FormControl
            as="textarea"
            rows={3}
            className="mb-2"
            placeholder="Course Description"
            value={courseForm.description}
            onChange={(e) =>
              setCourseForm({ ...courseForm, description: e.target.value })
            }
          />
          <hr />
        </>
      )}

      {/* Course cards (null-safe) */}
      <div id="wd-dashboard-courses" className="row">
        <div className="row row-cols-1 row-cols-md-5 g-4">
          {(courses ?? [])
            .filter((c): c is any => !!c && typeof c === "object")
            .map((c) => {
              const id = c?._id ?? c?.id;
              if (!id) return null;

              // When "enrolling" is ON, show toggle and respect the enrolled flag
              const enrolled = enrolling ? !!c?.enrolled : true;

              return (
                <div key={id} className="col" style={{ width: 300 }}>
                  <div className="card h-100 shadow-sm">
                    <img
                      src={c.image || "/images/reactjs.jpg"}
                      className="card-img-top"
                      height={160}
                      style={{ objectFit: "cover" }}
                      alt="Course"
                    />
                    <div className="card-body">
                      <h5 className="wd-dashboard-course-title card-title">
                      {enrolling && (
                        <button onClick={(event) => {
                          event.preventDefault();
                          updateEnrollment(c._id, !c.enrolled);
                          }}
                          className={`btn ${ c.enrolled ? "btn-danger" : "btn-success" } float-end`} >
                          {c.enrolled ? "Unenroll" : "Enroll"}
                          </button>
                        )}
                        {c.name}
                      </h5>

                      <p
                        className="text-secondary"
                        style={{ height: 100, overflow: "hidden" }}
                      >
                        {c.description}
                      </p>

                      {(enrolled || isFaculty) && (
                        <Link
                          to={`/Kambaz/Courses/${id}/Home`}
                          className="text-decoration-none"
                        >
                          <button
                            className="btn btn-primary"
                            style={{ minWidth: 100 }}
                          >
                            Go
                          </button>
                        </Link>
                      )}

                      {isFaculty && (
                        <>
                          <button
                            className="btn btn-warning"
                            style={{ minWidth: 100 }}
                            onClick={(e) => {
                              e.preventDefault();
                              setCourse(c);
                              setCourseForm(c);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ minWidth: 100 }}
                            onClick={async (e) => {
                              e.preventDefault();
                              await deleteCourse(id);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
