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
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState(null);
  // prevent scheduling multiple redirects (avoids reload loops)
  const redirectScheduledRef = useRef(false);
  // track whether this tab ever had an authenticated user
  const hasUserEverRef = useRef(false);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/allUsers/login", { email, password });
    // store token for persistence
    if (res?.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    setUser(res.data.user);
    setLoading(false);
    hasUserEverRef.current = true;
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    // keep logoutReason visible until dismissed
  }, []);

  // Manually refresh the user from the server (e.g., after wallet changes)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      if (res?.data?.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (e) {
      // Silent failure; caller can decide what to do
      return false;
    }
  }, []);

  // hydrate from token on startup
  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Ask server for authoritative user info (server reads Authorization header)
      try {
        const res = await api.get("/auth/me");
        if (res?.data?.user) {
          setUser(res.data.user);
          hasUserEverRef.current = true;
        } else {
          setUser(null);
        }
      } catch (err) {
        // user not logged in or token invalid/expired
        setUser(null);
      } finally {
        setLoading(false);
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
      // only show logout reason if this tab ever had a logged-in user
      if (!hasUserEverRef.current) {
        // still clear token if present but don't show message or redirect
        logout();
        return;
      }
      setLogoutReason(reason);
      logout();
      // redirect to login after short delay to allow user to read message
      if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
        // cross-tab lock to avoid multiple tabs all redirecting at the same time
        if (!localStorage.getItem("__auth_redirecting__")) {
          localStorage.setItem("__auth_redirecting__", "1");
          redirectScheduledRef.current = true;
          try {
            // use replace to avoid adding an extra history entry which can cause a reload
            redirectTimer = setTimeout(
              () => window.location.replace("/"),
              1500
            );
          } catch (e) {
            // ignore if window not available
            localStorage.removeItem("__auth_redirecting__");
            redirectScheduledRef.current = false;
          }
        }
      }
    };

    const onStorage = (e) => {
      if (e.key === "__auth_logout__") {
        const reason =
          localStorage.getItem("__auth_logout_reason__") || "Session expired";
        if (!hasUserEverRef.current) {
          logout();
          return;
        }
        setLogoutReason(reason);
        logout();
        if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
          if (!localStorage.getItem("__auth_redirecting__")) {
            localStorage.setItem("__auth_redirecting__", "1");
            redirectScheduledRef.current = true;
            try {
              redirectTimer = setTimeout(
                () => window.location.replace("/"),
                1500
              );
            } catch (e) {
              localStorage.removeItem("__auth_redirecting__");
            }
          }
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
                // clear cross-tab redirect lock so other tabs can redirect later if needed
                try {
                  localStorage.removeItem("__auth_redirecting__");
                } catch (e) {}
              }
            } catch (err) {
              setLogoutReason("Session invalid; please sign in again");
              logout();
              if (shouldRedirectToLogin() && !redirectScheduledRef.current) {
                if (!localStorage.getItem("__auth_redirecting__")) {
                  localStorage.setItem("__auth_redirecting__", "1");
                  redirectScheduledRef.current = true;
                  try {
                    redirectTimer = setTimeout(
                      () => window.location.replace("/"),
                      1500
                    );
                  } catch (e) {
                    localStorage.removeItem("__auth_redirecting__");
                  }
                }
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
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        logoutReason,
        dismissLogout,
      }}
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
