// src/Kambaz/Courses/Quizzes/questionsClient.ts
import axios from "axios";

const HTTP_SERVER =
  (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";

const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

export type Choice = { _id?: string; text: string; isCorrect?: boolean };

export type Question = {
  _id: string;
  quiz: string;
  type: "MC" | "TF" | "FIB";
  title: string;
  points: number;
  prompt?: string;
  // MC
  choices?: Choice[];
  // TF
  answer?: boolean;            // client name (server: correctBoolean)
  // FIB (legacy single-blank)
  answers?: string[];          // server: acceptableAnswers
  // FIB (multi-blank authoring)
  blanks?: { id?: string; answers: string[] }[];
  // server may return:
  acceptableAnswersByBlank?: string[][];
};

export const findByQuiz = async (qid: string): Promise<Question[]> =>
  (await api.get(`/api/quizzes/${qid}/questions`)).data;

export const createQuestion = async (
  payload: Omit<Question, "_id">
): Promise<Question> =>
  (await api.post(`/api/quizzes/${payload.quiz}/questions`, payload)).data;

export const updateQuestion = async (q: Question): Promise<Question> =>
  (await api.put(`/api/questions/${q._id}`, q)).data;

export const deleteQuestion = async (qid: string): Promise<void> => {
  await api.delete(`/api/questions/${qid}`);
};