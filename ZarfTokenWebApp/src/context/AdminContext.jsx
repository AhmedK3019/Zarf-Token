import { createContext, useState, useCallback } from "react";
import api from "../services/api";
const AdminContext = createContext(null);

const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const createAdmin = useCallback(async (adminData) => {
    const res = await api.post("/admin/createAdmin", adminData);
    localStorage.setItem("token", res.data.token);
    setAdmin(res.data.admin);
  }, []);
  const loginAdmin = useCallback(async (adminData) => {
    const res = await api.post("/admin/login", adminData);
    localStorage.setItem("token", res.data.token);
    setAdmin(res.data.admin);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem("token");
    setAdmin(null);
    window.location.href = "/login";
  }, []);

  return (
    <AdminContext.Provider
      value={{ createAdmin, loginAdmin, logoutAdmin, admin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext, AdminProvider };
