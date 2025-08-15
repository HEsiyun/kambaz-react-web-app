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

// Convert server doc (which has items[]) into the shape the UI expects
const toClientAttempt = (doc: any): Attempt => {
  const pairs =
    Array.isArray(doc?.items)
      ? doc.items.map((it: any) => {
          let value: any;
          if (it.type === "MC") value = it.choiceId;
          else if (it.type === "TF") value = it.booleanAnswer;
          else {
            // FIB: prefer array if available
            value = Array.isArray(it.textAnswers) ? it.textAnswers : [it.textAnswer ?? ""];
          }
          return [it.question, value];
        })
      : [];

  return {
    _id: doc._id,
    quiz: doc.quiz,
    user: doc.user,
    score: Number(doc.score || 0),
    createdAt: String(doc.createdAt || doc.submittedAt || new Date().toISOString()),
    answersByQid: doc.answersByQid ?? Object.fromEntries(pairs),
  };
};

export const submitAttempt = async (
  qid: string,
  payload: { answersByQid: Record<string, any>; user?: string }
) => {
  const { data } = await api.post(`/api/quizzes/${qid}/attempts`, payload);
  return toClientAttempt(data);
};

export const getMyLastAttempt = async (qid: string, userId?: string) => {
  try {
    const { data } = await api.get(`/api/quizzes/${qid}/attempts/me/last`, {
      params: userId ? { user: userId } : undefined,
    });
    return data ? toClientAttempt(data) : null;
  } catch (err: any) {
    if (err?.response?.status === 401) return null;
    throw err;
  }
};

export const listMyAttempts = async (qid: string, userId?: string) => {
  const { data } = await api.get(`/api/quizzes/${qid}/attempts/me`, {
    params: userId ? { user: userId } : undefined,
  });
  return Array.isArray(data) ? data.map(toClientAttempt) : [];
};