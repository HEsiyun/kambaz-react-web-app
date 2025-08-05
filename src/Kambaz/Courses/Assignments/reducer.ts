// Kambaz/Courses/Assignments/reducer.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./client";

export interface Assignment {
  _id: string;
  course: string;
  title: string;
  description?: string;
  points: number;
  dueDate?: string;
  availableDate?: string;
  untilDate?: string;
}

export const fetchAssignments = createAsyncThunk<Assignment[], string | undefined>(
  "assignments/fetch",
  async (cid) => (cid ? api.findAssignmentsByCourse(cid) : api.findAllAssignments())
);

export const createAssignmentThunk = createAsyncThunk<Assignment, Partial<Assignment>>(
  "assignments/create",
  api.createAssignment,
);

export const updateAssignmentThunk = createAsyncThunk<Assignment, Assignment>(
  "assignments/update",
  api.updateAssignment,
);

export const deleteAssignmentThunk = createAsyncThunk<string, string>(
  "assignments/delete",
  async (aid) => { await api.deleteAssignment(aid); return aid; }
);

type SliceState = { assignments: Assignment[]; loading: boolean; error: string | null };

const slice = createSlice({
  name: "assignments",
  initialState: { assignments: [], loading: false, error: null } as SliceState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchAssignments.pending,     (s) => { s.loading = true;  })
      .addCase(fetchAssignments.fulfilled,   (s,a)=>{ s.loading=false; s.assignments=a.payload; })
      .addCase(fetchAssignments.rejected,    (s,a)=>{ s.loading=false; s.error = String(a.error.message); })

      /* CREATE */
      .addCase(createAssignmentThunk.fulfilled,(s,a)=>{ s.assignments.push(a.payload); })

      /* UPDATE */
      .addCase(updateAssignmentThunk.fulfilled,(s,a)=>{
        s.assignments = s.assignments.map(x => x._id === a.payload._id ? a.payload : x);
      })

      /* DELETE */
      .addCase(deleteAssignmentThunk.fulfilled,(s,a)=>{
        s.assignments = s.assignments.filter(x => x._id !== a.payload);
      });
  },
});

export default slice.reducer;
export const assignmentThunks = {
  fetchAssignments,
  createAssignmentThunk,
  updateAssignmentThunk,
  deleteAssignmentThunk,
};