// Kambaz/Courses/Assignments/client.ts
import axios from "axios";

const HTTP_SERVER = import.meta.env.VITE_HTTP_SERVER ?? "http://localhost:4000";
const ASSIGN_API = `${HTTP_SERVER}/api/assignments`;

/*------------------------------------------------------------------*/
/*  READ                                                            */
/*------------------------------------------------------------------*/
export const findAllAssignments = async () =>
  (await axios.get(ASSIGN_API)).data;
export const findAssignmentsByCourse = async (cid: string) =>
  (await axios.get(`${ASSIGN_API}?course=${cid}`)).data;
export const findAssignmentById = async (aid: string) =>
  (await axios.get(`${ASSIGN_API}/${aid}`)).data;

/*------------------------------------------------------------------*/
/*  CREATE / UPDATE / DELETE                                        */
/*------------------------------------------------------------------*/
export const createAssignment = async (a: Omit<any, "_id">) =>
  (await axios.post(ASSIGN_API, a)).data;
export const updateAssignment = async (a: any) =>
  (await axios.put(`${ASSIGN_API}/${a._id}`, a)).data;
export const deleteAssignment = async (aid: string) =>
  (await axios.delete(`${ASSIGN_API}/${aid}`)).data;
