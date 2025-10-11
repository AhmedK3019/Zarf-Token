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
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/allUsers/login", { email, password });
    // store token for persistence
    if (res?.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // hydrate from token on startup (best-effort, client-side decode)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const restored = {};
        if (payload.role) restored.role = payload.role;
        if (payload.name) restored.name = payload.name;
        if (payload.id) restored._id = payload.id;
        setUser((prev) => ({ ...(prev || {}), ...restored }));
      }
    } catch (err) {
      // ignore
    }
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
