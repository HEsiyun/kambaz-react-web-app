import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "./client";

export interface Quiz {
  _id: string;
  course: string;
  title: string;
  description?: string;
  published: boolean;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
}

type SliceState = { list: Quiz[]; loading: boolean; error?: string | null };

export const fetchQuizzes = createAsyncThunk<Quiz[], string>(
  "quizzes/fetchByCourse",
  async (cid) => api.findQuizzesByCourse(cid)
);

export const createQuizThunk = createAsyncThunk<Quiz, { cid: string; data?: Partial<Quiz> }>(
  "quizzes/create",
  async ({ cid, data }) => api.createQuiz(cid, data ?? {})
);

export const deleteQuizThunk = createAsyncThunk<string, string>(
  "quizzes/delete",
  async (qid) => { await api.deleteQuiz(qid); return qid; }
);

export const publishQuizThunk = createAsyncThunk<{ _id: string; published: boolean }, { qid: string; published: boolean }>(
  "quizzes/publish",
  async ({ qid, published }) => { await api.publishQuiz(qid, published); return { _id: qid, published }; }
);

const slice = createSlice({
  name: "quizzes",
  initialState: { list: [], loading: false, error: null } as SliceState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchQuizzes.pending,   (s)=>{ s.loading = true; s.error = null; })
     .addCase(fetchQuizzes.fulfilled, (s,a)=>{ s.loading=false; s.list = a.payload; })
     .addCase(fetchQuizzes.rejected,  (s,a)=>{ s.loading=false; s.error = String(a.error.message); })

     .addCase(createQuizThunk.fulfilled, (s,a)=>{ s.list.unshift(a.payload); })

     .addCase(deleteQuizThunk.fulfilled, (s,a)=>{ s.list = s.list.filter(q=>q._id !== a.payload); })

     .addCase(publishQuizThunk.fulfilled,(s,a)=>{
        s.list = s.list.map(q => q._id === a.payload._id ? { ...q, published: a.payload.published } : q);
     });
  }
});

export default slice.reducer;
export const quizThunks = { fetchQuizzes, createQuizThunk, deleteQuizThunk, publishQuizThunk };