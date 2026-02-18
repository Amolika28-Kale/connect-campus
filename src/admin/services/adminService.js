import API from "../../api/axios";

/* ================= AUTH ================= */

export const adminLoginAPI = (email, password) => {
  return API.post("/admin/login", { email, password });
};

export const getDashboardStatsAPI = () => {
  return API.get("/admin/dashboard");
};

export const getUsersAPI = (params) => {
  return API.get("/admin/users", { params });
};

export const approveUserAPI = (id) => {
  return API.put(`/admin/users/approve/${id}`);
};

export const rejectUserAPI = (id) => {
  return API.put(`/admin/users/reject/${id}`);
};

export const banUserAPI = (id) => {
  return API.put(`/admin/users/ban/${id}`);
};

export const deleteUserAPI = (id) => {
  return API.delete(`/admin/users/${id}`);
};

export const getReportsAPI = () => {
  return API.get("/admin/reports");
};

export const getSuspiciousChatsAPI = () => {
  return API.get("/admin/chats/suspicious");
};

export const getCollegesAPI = () => {
  return API.get("/admin/colleges");
};

// Add to adminService.js

export const addCollegeAPI = (collegeData) => {
  return API.post("/admin/colleges", collegeData);
};

export const updateCollegeAPI = (id, collegeData) => {
  return API.put(`/admin/colleges/${id}`, collegeData);
};

export const deleteCollegeAPI = (id) => {
  return API.delete(`/admin/colleges/${id}`);
};

export const takeReportActionAPI = (id, actionData) => {
  return API.put(`/admin/reports/action/${id}`, actionData);
};