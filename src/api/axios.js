import axios from "axios";

// Get base URL from environment variable, fallback to Render URL
const baseURL = import.meta.env.VITE_API_URL || "https://campus-backend-3axn.onrender.com/api";

console.log("🌐 API Base URL:", baseURL);

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

API.interceptors.request.use((config) => {
  // Check which route we're calling
  const isAdminRoute = config.url.startsWith('/admin');
  
  // Get the appropriate token
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // For admin routes, use admin token; for user routes, use user token
  const token = isAdminRoute ? adminToken : userToken;
  
  console.log(`📡 ${config.method?.toUpperCase()} ${config.url} - Using ${isAdminRoute ? 'admin' : 'user'} token:`, !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ensure all URLs use HTTPS
  if (config.url && config.url.startsWith('http://')) {
    config.url = config.url.replace('http://', 'https://');
  }
  
  return config;
});

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });

      // Handle 401 Unauthorized - token expired
      if (error.response.status === 401) {
        console.log("🔴 Unauthorized! Token might be expired");
        
        // Check if it's an admin route
        const isAdminRoute = error.config?.url?.startsWith('/admin');
        
        // Clear only the relevant token
        if (isAdminRoute) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        }
        
        // Don't redirect immediately - let the app handle it
        // You can emit an event or let components handle the redirect
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('❌ Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default API;