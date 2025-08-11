import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "./questionsClient";
export type { Question } from "./questionsClient";

/* ----------------- THUNKS ----------------- */
export const fetchByQuiz = createAsyncThunk<api.Question[], string>(
  "questions/fetchByQuiz",
  async (quizId) => api.findByQuiz(quizId)
);

export const createQuestion = createAsyncThunk<
  api.Question,
  Omit<api.Question, "_id">
>("questions/create", async (payload) => api.createQuestion(payload));

export const updateQuestion = createAsyncThunk<api.Question, api.Question>(
  "questions/update",
  async (q) => api.updateQuestion(q)
);

export const deleteQuestion = createAsyncThunk<string, string>(
  "questions/delete",
  async (questionId) => {
    await api.deleteQuestion(questionId);
    return questionId;
  }
);

/* --------------- SLICE -------------------- */
type State = { items: api.Question[]; loading: boolean; error: string | null };
const initialState: State = { items: [], loading: false, error: null };

const slice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchByQuiz.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchByQuiz.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload;
    });
    b.addCase(fetchByQuiz.rejected, (s, a) => {
      s.loading = false;
      s.error = String(a.error.message || "Failed to load questions");
    });

    b.addCase(createQuestion.fulfilled, (s, a) => {
      s.items.push(a.payload);
    });

    b.addCase(updateQuestion.fulfilled, (s, a) => {
      s.items = s.items.map((q) => (q._id === a.payload._id ? a.payload : q));
    });

    b.addCase(deleteQuestion.fulfilled, (s, a) => {
      s.items = s.items.filter((q) => q._id !== a.payload);
    });
  },
});

export default slice.reducer;

export const questionThunks = {
  fetchByQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};