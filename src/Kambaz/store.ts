// Kambaz/store.ts
import { configureStore } from "@reduxjs/toolkit";
import modulesReducer     from "./Courses/Modules/reducer";
import accountReducer     from "./Account/reducer";
import assignmentsReducer from "./Courses/Assignments/reducer";
import coursesReducer     from "./Courses/reducer";
import enrollmentsReducer from "./Courses/Enrollments/reducer";

const store = configureStore({
  reducer: {
    modulesReducer,
    accountReducer,
    assignmentsReducer,
    coursesReducer,
    enrollmentsReducer,
  },
});


export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;