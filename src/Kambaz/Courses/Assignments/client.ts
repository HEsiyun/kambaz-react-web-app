// Kambaz/Courses/Assignments/client.ts
import axios from "axios";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER ?? "http://localhost:4000";
const axiosWithCredentials = axios.create({ withCredentials: true });

const COURSES_API = `${HTTP_SERVER}/api/courses`;
const ASSIGN_API  = `${HTTP_SERVER}/api/assignments`;

/* ----------------------------- READ ----------------------------- */
export const findAllAssignments = async () =>
  (await axiosWithCredentials.get(ASSIGN_API)).data;

export const findAssignmentsByCourse = async (cid: string) =>
  (await axiosWithCredentials.get(`${COURSES_API}/${cid}/assignments`)).data;

export const findAssignmentById = async (aid: string) =>
  (await axiosWithCredentials.get(`${ASSIGN_API}/${aid}`)).data;

/* ---------------------- CREATE / UPDATE / DELETE ----------------- */
// When creating, payload must include `course` (the course id).
export const createAssignment = async (a: Omit<any, "_id"> & { course: string }) => {
  const { course, ...payload } = a;                 // post body should NOT include course; it’s in the URL
  return (await axiosWithCredentials.post(`${COURSES_API}/${course}/assignments`, payload)).data;
};

export const updateAssignment = async (a: any) =>
  (await axiosWithCredentials.put(`${ASSIGN_API}/${a._id}`, a)).data;

export const deleteAssignment = async (aid: string) =>
  (await axiosWithCredentials.delete(`${ASSIGN_API}/${aid}`)).data;