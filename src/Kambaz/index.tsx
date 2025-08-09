// src/Kambaz/index.tsx
import KambazNavigation from "./Navigation";
import { Routes, Route, Navigate } from "react-router-dom";
import Account from "./Account";
import Dashboard from "./Dashboard";
import Courses from "./Courses";
import ProtectedRoute from "./Account/ProtectedRoute";
import "./styles.css";

import { useSelector } from "react-redux";
import Session from "./Account/Session";
import { useEffect, useState } from "react";
import * as courseClient from "./Courses/client";
import * as userClient from "./Account/client";

export default function Kambaz() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const [courses, setCourses] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [course, setCourse] = useState<any>(null);

  // Fetch only the current user's courses
  const findCoursesForUser = async () => {
    try {
      if (!currentUser?._id) {
        setCourses([]);
        return;
      }
      const mine = await userClient.findCoursesForUser(currentUser._id);
      setCourses((mine || []).filter(Boolean));
    } catch (error) {
      console.error(error);
      setCourses([]);
    }
  };

  // Fetch all courses and mark the ones the user is enrolled in
  const fetchCourses = async () => {
    try {
      const [allCoursesRaw, enrolledRaw] = await Promise.all([
        courseClient.fetchAllCourses(),
        currentUser?._id ? userClient.findCoursesForUser(currentUser._id) : [],
      ]);

      const allCourses = (allCoursesRaw || []).filter(Boolean);
      const myIds = new Set(
        (enrolledRaw || []).filter(Boolean).map((c: any) => c._id)
      );

      const merged = allCourses.map((c: any) =>
        myIds.has(c._id) ? { ...c, enrolled: true } : c
      );
      setCourses(merged);
    } catch (error) {
      console.error(error);
      setCourses([]);
    }
  };

  // Toggle enrollment for a course and update local state
  const updateEnrollment = async (courseId: string, enrolled: boolean) => {
    if (!currentUser?._id) return;

    if (enrolled) {
      await userClient.enrollIntoCourse(currentUser._id, courseId);
    } else {
      await userClient.unenrollFromCourse(currentUser._id, courseId);
    }

    setCourses((prev) =>
      prev.map((c) => (c && c._id === courseId ? { ...c, enrolled } : c))
    );
  };

  // Decide which list to load
  useEffect(() => {
    if (!currentUser?._id) {
      setCourses([]);
      return;
    }
    if (enrolling) {
      fetchCourses();
    } else {
      findCoursesForUser();
    }
    // depend only on the primitive id to avoid extra re-renders
  }, [currentUser?._id, enrolling]);

  // CRUD (null-safe, functional updates)
  const addNewCourse = async (c: any) => {
    const created = await userClient.createCourse(c);
    if (!created) return null;
  
    setCourses(prev => {
      // avoid duplicates if someone clicks twice
      const exists = prev.some(x => x?._id === created._id);
      if (exists) return prev;
  
      // If we are showing All Courses, mark the new one as enrolled for the author
      return enrolling ? [...prev, { ...created, enrolled: true }]
                       : [...prev, created];
    });
  
    return created;
  };
  const deleteCourse = async (courseId: string) => {
    await courseClient.deleteCourse(courseId);
    setCourses((prev) => prev.filter((x) => x?._id !== courseId));
  };

  const updateCourse = async (c: any) => {
    await courseClient.updateCourse(c);
    setCourses((prev) =>
      prev.map((x) => (x?._id === c._id ? { ...x, ...c } : x))
    );
  };

  return (
    <Session>
      <div id="wd-kambaz">
        <KambazNavigation />
        <div className="wd-main-content-offset p-3">
          <Routes>
            <Route path="/" element={<Navigate to="Dashboard" />} />
            <Route path="Account/*" element={<Account />} />
            <Route
              path="Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    courses={courses}
                    course={course}
                    setCourse={setCourse}
                    addNewCourse={addNewCourse}
                    deleteCourse={deleteCourse}
                    updateCourse={updateCourse}
                    enrolling={enrolling}
                    setEnrolling={setEnrolling}
                    updateEnrollment={updateEnrollment}
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
            <Route path="Inbox" element={<h1>Inbox</h1>} />
          </Routes>
        </div>
      </div>
    </Session>
  );
}