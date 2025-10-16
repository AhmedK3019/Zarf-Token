import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [logoutReason, setLogoutReason] = useState(null);
  // prevent scheduling multiple redirects (avoids reload loops)
  const redirectScheduledRef = useRef(false);

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
    // keep logoutReason visible until dismissed
  }, []);

  // hydrate from token on startup (best-effort, client-side decode)
  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const restored = {};
            if (payload.role) restored.role = payload.role;
            if (payload.name) restored.name = payload.name;
            if (payload.id) restored._id = payload.id;
            setUser((prev) => ({ ...(prev || {}), ...restored }));
            return;
          }
        } catch (err) {
          // fallthrough to server-side /me check
          console.error("Token parse error:", err);
        }
      }

      // Ask server for authoritative user info (server reads Authorization header)
      try {
        const res = await api.get("/auth/me");
        if (res?.data?.user) setUser(res.data.user);
      } catch (err) {
        // user not logged in or token invalid/expired
        setUser(null);
      }
    };
    hydrate();
  }, []);

  // Listen for logout broadcasts (from api interceptor) and storage fallback
  useEffect(() => {
    let redirectTimer = null;
    const shouldRedirectToLogin = () => {
      try {
        const p = window.location.pathname || "";
        // If already on landing/login/signup paths, avoid redirecting to prevent reload loops
        if (p === "/" || p.includes("login") || p.includes("signup"))
          return false;
      } catch (e) {
        // if window not available, don't redirect here
        return false;
      }
      return true;
    };
    const onAuthLogout = (e) => {
      const reason =
        e?.detail?.reason ||
        localStorage.getItem("__auth_logout_reason__") ||
        "Session expired";
      setLogoutReason(reason);
      logout();
      // redirect to login after short delay to allow user to read message
      if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
        redirectScheduledRef.current = true;
        try {
          redirectTimer = setTimeout(() => (window.location.href = "/"), 1500);
        } catch (e) {
          // ignore if window not available
        }
      }
    };

    const onStorage = (e) => {
      if (e.key === "__auth_logout__") {
        const reason =
          localStorage.getItem("__auth_logout_reason__") || "Session expired";
        setLogoutReason(reason);
        logout();
        if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
          redirectScheduledRef.current = true;
          try {
            redirectTimer = setTimeout(
              () => (window.location.href = "/"),
              1500
            );
          } catch (e) {}
        }
      }
      // If token removed in another tab
      if (e.key === "token") {
        const newToken = localStorage.getItem("token");
        if (!newToken) {
          setLogoutReason("Signed out in another tab");
          logout();
          if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
            redirectScheduledRef.current = true;
            try {
              redirectTimer = setTimeout(
                () => (window.location.href = "/"),
                1500
              );
            } catch (e) {}
          }
        } else {
          // token replaced in another tab -> attempt to re-hydrate
          (async () => {
            try {
              const res = await api.get("/auth/me");
              if (res?.data?.user) {
                setUser(res.data.user);
                // cancel any scheduled redirect because the session was restored
                if (redirectTimer) {
                  clearTimeout(redirectTimer);
                  redirectTimer = null;
                }
                redirectScheduledRef.current = false;
              }
            } catch (err) {
              setLogoutReason("Session invalid; please sign in again");
              logout();
              if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
                redirectScheduledRef.current = true;
                try {
                  redirectTimer = setTimeout(
                    () => (window.location.href = "/"),
                    1500
                  );
                } catch (e) {}
              }
            }
          })();
        }
      }
    };

    window.addEventListener("auth:logout", onAuthLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:logout", onAuthLogout);
      window.removeEventListener("storage", onStorage);
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [logout]);

  const dismissLogout = useCallback(() => setLogoutReason(null), []);

  return (
    <UserContext.Provider
      value={{ user, login, logout, logoutReason, dismissLogout }}
    >
      {logoutReason ? (
        <div
          style={{
            background: "#fff4e5",
            border: "1px solid #ffd8a8",
            color: "#663c00",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Signed out</strong>
            <div style={{ fontSize: 13 }}>{String(logoutReason)}</div>
          </div>
          <div>
            <button
              onClick={dismissLogout}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#663c00",
                fontWeight: 600,
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      {children}
    </UserContext.Provider>
  );
}
export function useAuthUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAuthUser must be used within <AdminProvider>");
  return ctx;
}
