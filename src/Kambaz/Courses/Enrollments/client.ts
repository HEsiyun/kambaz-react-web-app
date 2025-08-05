import axios from "axios";

const HTTP_SERVER  = import.meta.env.VITE_HTTP_SERVER ?? "http://localhost:4000";
const ENROLL_API   = `${HTTP_SERVER}/api/enrollments`;

/*------------------------------------------------------------------*/
/*  READ                                                            */
/*------------------------------------------------------------------*/
export const findMyEnrollments    = async (uid: string) =>
  (await axios.get(`${ENROLL_API}?user=${uid}`)).data;
export const findEnrollmentsByCid = async (cid: string) =>
  (await axios.get(`${ENROLL_API}?course=${cid}`)).data;

/*------------------------------------------------------------------*/
/*  CREATE / DELETE                                                 */
/*------------------------------------------------------------------*/
export const enroll   = async (user: string, course: string) =>
  (await axios.post(ENROLL_API, { user, course })).data;
export const unenroll = async (eid: string) =>
  (await axios.delete(`${ENROLL_API}/${eid}`)).data;