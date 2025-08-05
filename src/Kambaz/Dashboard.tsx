// kambaz/Dashboard.tsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, FormControl } from "react-bootstrap";

import type { RootState, AppDispatch } from "./store";
import { enrollmentThunks } from "./Courses/Enrollments/reducer";
import * as courseClient from "./Courses/client";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
type DashboardProps = {
  addNewCourse: (c: any) => Promise<any>;   // MUST return the created object
  deleteCourse: (cid: string) => Promise<void>;
  updateCourse: (c: any) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function Dashboard({
  addNewCourse,
  deleteCourse,
  updateCourse,
}: DashboardProps) {
  const dispatch     = useDispatch<AppDispatch>();
  const currentUser  = useSelector((s: RootState) => s.accountReducer.currentUser) as { _id?: string; username?: string; role?: string } | null;
  const enrollments  = useSelector((s:RootState)=>s.enrollmentsReducer) as {
    _id: string; user: string; course: string;
  }[];

  const myCourseIds  = new Set(enrollments.map(e=>e.course));
  const isFaculty    = currentUser?.role === "FACULTY";

  /* 🍥 fetch enrollments on login/logout --------------------------- */
  useEffect(()=>{
    if(currentUser?._id){
      dispatch(enrollmentThunks.fetchEnrollments(currentUser._id));
    }
  },[currentUser,dispatch]);

  /* 🍥 local state ------------------------------------------------- */
  const [showAll,    setShowAll]    = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courseForm, setCourseForm] = useState({ _id:"", name:"", description:"" });

  /* fetch catalog once -------------------------------------------- */
  useEffect(()=>{
    courseClient.fetchAllCourses().then(setAllCourses).catch(console.error);
  },[]);

  /* helper to push a new course into catalog ---------------------- */
  const pushCourseIntoCatalog = (c:any)=>
    setAllCourses(old=>old.some(x=>x._id===c._id)?old:[...old,c]);

  /* derived list -------------------------------------------------- */
  const displayedCourses = showAll
    ? allCourses                                   // All-courses view
    : allCourses.filter(c => myCourseIds.has(c._id)); // My-courses view

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="p-4" id="wd-dashboard">
      {/* Header ---------------------------------------------------- */}
      <div className="d-flex align-items-center justify-content-between">
        <h1 id="wd-dashboard-title">Dashboard {currentUser?.username}</h1>
        <Button
          variant={showAll ? "secondary" : "success"}
          className="mb-2"
          onClick={() => setShowAll(prev=>!prev)}
        >
          {showAll ? "Back to My Courses" : "Enroll (All Courses)"}
        </Button>
      </div>
      <hr />

      {/* Faculty create/update ------------------------------------- */}
      {isFaculty && (
        <>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              onClick={async ()=>{
                if(!courseForm.name) return;
                const created = await addNewCourse(courseForm);
                pushCourseIntoCatalog(created);

                /* refresh enrollments so the card shows in My view */
                if(currentUser?._id){
                  dispatch(enrollmentThunks.fetchEnrollments(currentUser._id));
                }
                setCourseForm({ _id:"", name:"", description:"" });
              }}
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              disabled={!courseForm._id}
              onClick={async ()=>{
                await updateCourse(courseForm);
                setAllCourses(old=>old.map(c=>c._id===courseForm._id?courseForm:c));
                setCourseForm({ _id:"", name:"", description:"" });
              }}
            >
              Update
            </button>
          </h5>
          <FormControl
            className="mb-2"
            placeholder="Course Name"
            value={courseForm.name}
            onChange={e=>setCourseForm({...courseForm,name:e.target.value})}
          />
          <FormControl
            as="textarea"
            rows={3}
            className="mb-2"
            placeholder="Course Description"
            value={courseForm.description}
            onChange={e=>setCourseForm({...courseForm,description:e.target.value})}
          />
          <hr/>
        </>
      )}

      {/* Grid title ------------------------------------------------ */}
      <h2>
        {showAll
          ? `All Courses (${displayedCourses.length})`
          : `Courses (${displayedCourses.length})`}
      </h2>
      <hr/>

      {/* Course cards --------------------------------------------- */}
      <div className="row row-cols-1 row-cols-md-5 g-4">
        {displayedCourses.map(c=>{
          const enrolled      = myCourseIds.has(c._id);
          const enrollmentRec = enrollments.find(e=>e.course===c._id);

          return (
            <div key={c._id} className="col" style={{width:300}}>
              <div className="card h-100 shadow-sm">
                <img src={c.image||"/images/reactjs.jpg"}
                     className="card-img-top" height={160}
                     style={{objectFit:"cover"}} alt="Course"/>
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <div className="fs-5 fw-bold mb-2">{c.name}</div>
                    <div className="text-secondary mb-3"
                         style={{height:100,fontSize:"1rem",
                                 overflow:"hidden",textOverflow:"ellipsis"}}>
                      {c.description}
                    </div>
                  </div>

                  {/* buttons */}
                  <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                    {(enrolled||isFaculty) && (
                      <Link to={`/Kambaz/Courses/${c._id}/Home`} className="text-decoration-none">
                        <button className="btn btn-primary" style={{minWidth:100}}>Go</button>
                      </Link>
                    )}

                    {isFaculty && (
                      <>
                        <button className="btn btn-warning" style={{minWidth:100}}
                                onClick={e=>{e.preventDefault();setCourseForm(c);}}>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{minWidth:100}}
                                onClick={async e=>{
                                  e.preventDefault();
                                  await deleteCourse(c._id);
                                  setAllCourses(old=>old.filter(x=>x._id!==c._id));
                                }}>
                          Delete
                        </button>
                      </>
                    )}

                    {enrolled ? (
                      <button className="btn btn-outline-danger" style={{minWidth:100}}
                              onClick={()=>enrollmentRec &&
                                dispatch(enrollmentThunks.unenrollThunk(enrollmentRec._id))}>
                        Unenroll
                      </button>
                    ) : (
                      <button className="btn btn-success" style={{minWidth:100}}
                              onClick={()=>currentUser?._id &&
                                dispatch(enrollmentThunks.enrollThunk({
                                  user: currentUser._id,
                                  course: c._id,
                                }))}>
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}