import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";

/* ✅ Admin Imports */
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminRoute from "./admin/AdminRoute";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import Reports from "./admin/pages/Reports";
import SuspiciousChats from "./admin/pages/SuspiciousChats";
import Colleges from "./admin/pages/Colleges";

/* ✅ User Pages Imports */
import Layout from "./components/Layout";
import Discovery from "./pages/Discovery";
import Messages from "./pages/Messages";
import Matches from "./pages/Matches";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat"; // 👈 Import Chat page

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            {/* ================= REDIRECT ROOT ================= */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ================= USER PROTECTED ROUTES ================= */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat/:matchId" element={<Chat />} /> {/* 👈 Chat route inside Layout */}
            </Route>

            {/* ================= ADMIN PUBLIC ROUTES ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= ADMIN PROTECTED ROUTES ================= */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />
              <Route path="chats" element={<SuspiciousChats />} />
              <Route path="colleges" element={<Colleges />} />
            </Route>

            {/* ================= 404 NOT FOUND ================= */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <h1 className="text-6xl font-bold mb-4">404</h1>
                  <p className="text-xl mb-6">Page not found</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-pink-500 rounded-lg hover:bg-pink-600 transition"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;