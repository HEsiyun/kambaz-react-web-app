// src/Kambaz/Courses/Quizzes/attemptsClient.ts
import axios from "axios";

const HTTP_SERVER =
  (import.meta as any).env?.VITE_HTTP_SERVER ?? "http://localhost:4000";

const api = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

export type Attempt = {
  _id: string;
  quiz: string;
  user: string;
  answersByQid: Record<string, any>;
  score: number;
  createdAt: string;
};

export const submitAttempt = async (qid: string, payload: {
  answersByQid: Record<string, any>;
  user?: string;         // dev fallback
}) => (await api.post(`/api/quizzes/${qid}/attempts`, payload)).data as Attempt;

export const getMyLastAttempt = async (qid: string, userId?: string) => {
  try {
    const { data } = await api.get(`/api/quizzes/${qid}/attempts/me/last`, {
      params: userId ? { user: userId } : undefined,
    });
    return data as Attempt | null;
  } catch (err: any) {
    // If not authenticated just treat as "no previous attempt"
    if (err?.response?.status === 401) return null;
    throw err;
  }
};

export const listMyAttempts = async (qid: string, userId?: string) => {
  const { data } = await api.get(`/api/quizzes/${qid}/attempts/me`, {
    params: userId ? { user: userId } : undefined,
  });
  return data as Attempt[];
};