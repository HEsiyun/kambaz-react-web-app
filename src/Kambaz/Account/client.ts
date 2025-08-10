// src/Kambaz/Account/client.ts
import axios from "axios";

// Always send cookies (session) with cross-site requests
const axiosWithCredentials = axios.create({ withCredentials: true });

// Base server URL (prod from env, fallback to local for dev)
export const HTTP_SERVER =
  import.meta.env.VITE_HTTP_SERVER ?? "http://localhost:4000";

export const USERS_API = `${HTTP_SERVER}/api/users`;

/* ---------- Auth / Session ---------- */
export const signin = async (credentials: any) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/signin`,
    credentials
  );
  return data;
};

export const signup = async (user: any) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/signup`,
    user
  );
  return data;
};

export const profile = async () => {
  const { data } = await axiosWithCredentials.post(`${USERS_API}/profile`);
  return data;
};

export const signout = async () => {
  const { data } = await axiosWithCredentials.post(`${USERS_API}/signout`);
  return data;
};

/* ---------- Users CRUD / Queries ---------- */
export const updateUser = async (user: any) => {
  const { data } = await axiosWithCredentials.put(
    `${USERS_API}/${user._id}`,
    user
  );
  return data;
};

export const findAllUsers = async () => {
  const { data } = await axiosWithCredentials.get(USERS_API);
  return data;
};

export const findUsersByRole = async (role: string) => {
  const { data } = await axiosWithCredentials.get(
    `${USERS_API}?role=${encodeURIComponent(role)}`
  );
  return data;
};

export const findUsersByPartialName = async (name: string) => {
  const { data } = await axiosWithCredentials.get(
    `${USERS_API}?name=${encodeURIComponent(name)}`
  );
  return data;
};

export const findUserById = async (id: string) => {
  const { data } = await axiosWithCredentials.get(`${USERS_API}/${id}`);
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await axiosWithCredentials.delete(
    `${USERS_API}/${userId}`
  );
  return data;
};

export const createUser = async (user: any) => {
  const { data } = await axiosWithCredentials.post(`${USERS_API}`, user);
  return data;
};

/* ---------- Courses for a user ---------- */
// Uses server route: GET /api/users/:uid/courses with uid="current"
export const findMyCourses = async () => {
  const { data } = await axiosWithCredentials.get(
    `${USERS_API}/current/courses`
  );
  return data;
};

// Same route, explicit user id
export const findCoursesForUser = async (userId: string) => {
  const { data } = await axiosWithCredentials.get(
    `${USERS_API}/${userId}/courses`
  );
  return data;
};

// Creator adds a new course; server auto-enrolls the author
export const createCourse = async (course: any) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/current/courses`,
    course
  );
  return data;
};

/* ---------- Enrollment ---------- */
export const enrollIntoCourse = async (userId: string, courseId: string) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};

export const unenrollFromCourse = async (userId: string, courseId: string) => {
  const { data } = await axiosWithCredentials.delete(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};