// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  console.log("🔒 PrivateRoute - user:", user, "loading:", loading);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;