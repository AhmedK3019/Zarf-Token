import { createContext, useState, useCallback, useContext } from "react";
import api from "../services/api";
const AdminContext = createContext(null);

const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const loginAdmin = useCallback(async (adminData) => {
    const res = await api.post("/allUsers/login", adminData);
    localStorage.setItem("token", res.data.token);
    setAdmin(res.data.admin);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem("token");
    setAdmin(null);
    window.location.href = "/";
  }, []);

  return (
    <AdminContext.Provider value={{ loginAdmin, logoutAdmin, admin }}>
      {children}
    </AdminContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAuth must be used within <AdminProvider>");
  return ctx;
}
