import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./client";

export interface Enrollment {
  _id: string;
  user: string;
  course: string;
}

/*----------------------  THUNKS  ----------------------------------*/
export const fetchEnrollments = createAsyncThunk<Enrollment[], string>(
  "enrollments/fetchByUser",
  api.findMyEnrollments
);

export const enrollThunk = createAsyncThunk<Enrollment,
  { user: string; course: string }>("enrollments/enroll", ({ user, course }) =>
  api.enroll(user, course)
);

export const unenrollThunk = createAsyncThunk<string, string>(
  "enrollments/unenroll",
  async (eid) => {
    await api.unenroll(eid);
    return eid;                // reducer only needs the id
  }
);

/*----------------------  SLICE   ----------------------------------*/
const slice = createSlice({
  name: "enrollments",
  initialState: [] as Enrollment[],
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchEnrollments.fulfilled, (_, action) => action.payload)
      .addCase(enrollThunk.fulfilled, (state, { payload }) => {
        state.push(payload);
      })
      .addCase(unenrollThunk.fulfilled, (state, { payload }) =>
        state.filter((e) => e._id !== payload)
      ),
});

export default slice.reducer;
export const enrollmentThunks = { fetchEnrollments, enrollThunk, unenrollThunk };