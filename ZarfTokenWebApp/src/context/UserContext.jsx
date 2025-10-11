import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState("");
  const login = useCallback(async (email, password) => {
    console.log(email, password);
    const res = await api.post("/allUsers/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
export function useAuthUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAuthUser must be used within <AdminProvider>");
  return ctx;
}
