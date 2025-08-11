// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import * as api from "./questionsClient";

// export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
// export interface Question {
//   _id: string;
//   quiz: string;
//   type: QuestionType;
//   title: string;
//   points: number;
//   prompt: string;     // HTML from editor
//   choices?: { id: string; text: string; isCorrect?: boolean }[];
//   correct?: boolean;
//   blanks?: string[];
// }

// export const fetchByQuiz = createAsyncThunk<Question[], string>(
//   "questions/fetchByQuiz",
//   api.findByQuiz
// );

// export const createQuestion = createAsyncThunk<Question, Omit<Question, "_id">>(
//   "questions/create",
//   api.createQuestion
// );

// export const updateQuestion = createAsyncThunk<Question, Question>(
//   "questions/update",
//   api.updateQuestion
// );

// export const deleteQuestion = createAsyncThunk<string, string>(
//   "questions/delete",
//   async (qid) => { await api.deleteQuestion(qid); return qid; }
// );

// type State = { items: Question[]; loading: boolean; error: string | null };
// const initialState: State = { items: [], loading: false, error: null };

// const slice = createSlice({
//   name: "questions",
//   initialState,
//   reducers: {},
//   extraReducers: (b) => {
//     b.addCase(fetchByQuiz.pending,   (s)=>{ s.loading = true; s.error = null; })
//      .addCase(fetchByQuiz.fulfilled, (s,a)=>{ s.loading = false; s.items = a.payload ?? []; })
//      .addCase(fetchByQuiz.rejected,  (s,a)=>{ s.loading = false; s.error = String(a.error.message); })

//      .addCase(createQuestion.fulfilled, (s,a)=>{ s.items.push(a.payload); })
//      .addCase(updateQuestion.fulfilled, (s,a)=>{ s.items = s.items.map(q=> q._id===a.payload._id ? a.payload : q); })
//      .addCase(deleteQuestion.fulfilled, (s,a)=>{ s.items = s.items.filter(q=> q._id !== a.payload); });
//   }
// });

// export default slice.reducer;
// export const questionsThunks = { fetchByQuiz, createQuestion, updateQuestion, deleteQuestion };