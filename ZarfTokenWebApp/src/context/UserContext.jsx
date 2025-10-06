import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const UserContext = createContext(null);

const LOCAL_KEY = "zarf_user";

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
      else localStorage.removeItem(LOCAL_KEY);
    } catch (err) {
      // ignore storage errors
    }
  }, [user]);

  // simple login helper that calls backend auth endpoint
  const login = async (credentials) => {
    // credentials: { email, password }
    // This function assumes there's an auth endpoint at /auth/login
    // If your backend uses a different route, update accordingly.
    const res = await api.post("/auth/login", credentials);
    const data = res.data;
    // expected to return { user, token } or user object
    const next = data.user || data;
    setUser(next);
    return next;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((u) => ({ ...(u || {}), ...patch }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
}

export default UserContext;
