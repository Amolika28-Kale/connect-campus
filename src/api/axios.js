// api/axios.js
import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
    baseURL: "https://campus-backend-3axn.onrender.com/api",

});

API.interceptors.request.use((config) => {
  // Check which route we're calling
  const isAdminRoute = config.url.startsWith('/admin');
  
  // Get the appropriate token
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // For admin routes, use admin token; for user routes, use user token
  const token = isAdminRoute ? adminToken : userToken;
  
  console.log(`📡 ${config.url} - Using ${isAdminRoute ? 'admin' : 'user'} token:`, !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default API;