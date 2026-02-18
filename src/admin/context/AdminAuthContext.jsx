import { createContext, useState } from "react";
import { adminLoginAPI } from "../services/adminService";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(false);
const login = async (email, password) => {
  const { data } = await adminLoginAPI(email, password);

  localStorage.setItem("adminToken", data.token);
  setAdmin({ token: data.token });
};


  const logout = () => {
    setAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
