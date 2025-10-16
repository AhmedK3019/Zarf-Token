import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: detect 401 (invalid/expired token) and notify app
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      if (status === 401) {
        // prefer server-provided message
        const reason =
          error?.response?.data?.message ||
          error?.response?.data ||
          "Unauthorized";

        try {
          localStorage.removeItem("token");
        } catch (e) {}

        // notify in-page listeners
        try {
          window.dispatchEvent(
            new CustomEvent("auth:logout", { detail: { reason } })
          );
        } catch (e) {
          // fallback: write to localStorage to trigger cross-tab listeners
          try {
            localStorage.setItem("__auth_logout__", String(Date.now()));
            localStorage.setItem("__auth_logout_reason__", String(reason));
          } catch (e2) {}
        }
      }
    } catch (e) {
      // swallow
    }
    return Promise.reject(error);
  }
);

export default api;
