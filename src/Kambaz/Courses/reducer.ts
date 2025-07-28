import { createSlice } from "@reduxjs/toolkit";
import { courses as seedCourses, enrollments as seedEnrollments } from "../Database";
import { v4 as uuidv4 } from "uuid";

// Course and Enrollment types (optional, but helpful for TypeScript)
export interface Course {
  _id: string;
  name: string;
  description: string;
  [key: string]: any;
}
export interface Enrollment {
  _id: string;
  user: string;
  course: string;
}

// --- Initial State with courses and enrollments ---
const initialState: { courses: Course[]; enrollments: Enrollment[] } = {
  courses: seedCourses, // You can load from DB or empty []
  enrollments: seedEnrollments, // You can load from DB or empty []
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, { payload }: { payload: Course[] }) => {
      state.courses = payload;
    },
    addCourse: (state, { payload }: { payload: Course & { creatorId?: string } }) => {
      const newId = uuidv4();
      state.courses.push({ ...payload, _id: newId });
      // If a creatorId is provided, auto-enroll the user in this new course
      if (payload.creatorId) {
        state.enrollments.push({
          _id: uuidv4(),
          user: payload.creatorId,
          course: newId,
        });
      }
    },
    updateCourse: (state, { payload }: { payload: Course }) => {
      state.courses = state.courses.map((c) =>
        c._id === payload._id ? payload : c
      );
    },
    deleteCourse: (state, { payload }: { payload: string }) => {
      state.courses = state.courses.filter((c) => c._id !== payload);
      state.enrollments = state.enrollments.filter((e) => e.course !== payload);
    },
    // Optionally: Add enrollment if you allow enroll/un-enroll
    enrollUser: (state, { payload }: { payload: { user: string; course: string } }) => {
      if (!state.enrollments.some(e => e.user === payload.user && e.course === payload.course)) {
        state.enrollments.push({ _id: uuidv4(), ...payload });
      }
    },
    unenrollUser: (state, { payload }: { payload: { user: string; course: string } }) => {
      state.enrollments = state.enrollments.filter(
        (e) => !(e.user === payload.user && e.course === payload.course)
      );
    },
  },
});

export const {
  setCourses,
  addCourse,
  updateCourse,
  deleteCourse,
//   enrollUser,
//   unenrollUser,
} = coursesSlice.actions;

export default coursesSlice.reducer;