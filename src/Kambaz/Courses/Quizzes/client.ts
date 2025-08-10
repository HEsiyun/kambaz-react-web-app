import axios from "axios";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER ?? "http://localhost:4000";
const QUIZ_API = `${HTTP_SERVER}/api`;

export const findQuizzesByCourse = async (cid: string) =>
  (await axios.get(`${QUIZ_API}/courses/${cid}/quizzes`)).data;

export const createQuiz = async (cid: string, data: Partial<any> = {}) =>
  (await axios.post(`${QUIZ_API}/courses/${cid}/quizzes`, data)).data;

export const deleteQuiz = async (qid: string) =>
  (await axios.delete(`${QUIZ_API}/quizzes/${qid}`)).data;

export const publishQuiz = async (qid: string, published: boolean) =>
  (await axios.put(`${QUIZ_API}/quizzes/${qid}/publish`, { published })).data;

