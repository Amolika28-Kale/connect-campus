import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminAuthContext } from "./context/AdminAuthContext";

const AdminRoute = ({ children }) => {
  const { admin } = useContext(AdminAuthContext);

  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminRoute;
