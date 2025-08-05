import KambazNavigation from "./Navigation";
import { Routes, Route, Navigate } from "react-router-dom";
import Account          from "./Account";
import Dashboard        from "./Dashboard";
import Courses          from "./Courses";
import ProtectedRoute   from "./Account/ProtectedRoute";
import "./styles.css";

import { useSelector } from "react-redux";
import Session         from "./Account/Session";
import { useState, useEffect } from "react";
import * as userClient   from "./Account/client";
import * as courseClient from "./Courses/client";

export default function Kambaz() {
  /* ▸ local state used elsewhere (e.g. Courses screen) */
  const [courses, setCourses] = useState<any[]>([]);
  const { currentUser } = useSelector((s: any) => s.accountReducer);

  /* ▸ helper functions passed to Dashboard */
  const addNewCourse = async (course: any) => {
    const newCourse = await userClient.createCourse(course);
    setCourses([...courses, newCourse]);        // keep local cache fresh
    return newCourse;                           // IMPORTANT: return object
  };

  const deleteCourse = async (courseId: string) => {
    await courseClient.deleteCourse(courseId);
    setCourses(courses.filter(c => c._id !== courseId));
  };

  const updateCourse = async (course: any) => {
    await courseClient.updateCourse(course);
    setCourses(courses.map(c => (c._id === course._id ? course : c)));
  };

  /* ▸ initial fetch of “my” courses (used by other screens) */
  useEffect(() => {
    const fetchCourses = async () => {
      try   { setCourses(await userClient.findMyCourses()); }
      catch { setCourses([]); }
    };
    fetchCourses();
  }, [currentUser]);

  /* ▸ routes ------------------------------------------------------ */
  return (
    <Session>
      <div id="wd-kambaz">
        <KambazNavigation />
        <div className="wd-main-content-offset p-3">
          <Routes>
            <Route path="/"              element={<Navigate to="Dashboard" />} />
            <Route path="Account/*"      element={<Account />} />

            <Route
              path="Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    addNewCourse={addNewCourse}
                    deleteCourse={deleteCourse}
                    updateCourse={updateCourse}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="Courses/:cid/*"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />

            <Route path="Calendar" element={<h1>Calendar</h1>} />
            <Route path="Inbox"    element={<h1>Inbox</h1>} />
          </Routes>
        </div>
      </div>
    </Session>
  );
}