// // src/Kambaz/Quizzes/questionsClient.ts
// import axios from "axios";

// const HTTP_SERVER =
//   (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";

// const api = axios.create({
//   baseURL: HTTP_SERVER,
//   withCredentials: true,
// });

// // Shapes match your server schema
// export type QuestionType = "MC" | "TF" | "FIB";

// export type MCChoice = { _id: string; text: string; isCorrect: boolean };

// export type Question = {
//   _id: string;
//   quiz: string;               // qid
//   type: QuestionType;
//   title: string;
//   points: number;
//   prompt?: string;            // HTML from WYSIWYG
//   choices?: MCChoice[];       // for MC
//   correctTF?: boolean;        // for TF
//   answers?: string[];         // for FIB
// };

// export const listQuestions = async (qid: string): Promise<Question[]> =>
//   (await api.get(`/api/quizzes/${qid}/questions`)).data;

// export const createQuestion = async (qid: string, payload: Partial<Question>) =>
//   (await api.post(`/api/quizzes/${qid}/questions`, payload)).data;

// export const updateQuestion = async (qqid: string, payload: Partial<Question>) =>
//   (await api.put(`/api/questions/${qqid}`, payload)).data;

// export const removeQuestion = async (qqid: string) =>
//   (await api.delete(`/api/questions/${qqid}`)).data;

// export function findByQuiz<T, U>(arg0: string, findByQuiz: any) {
//     throw new Error("Function not implemented.");
// }
