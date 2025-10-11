import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/auth";
import NotFound from "../pages/NotFoundPage";

/**
 * ProtectedRoute
 * - allowedRoles: optional array of roles (e.g. ['Admin','Vendor'])
 * If user is not authenticated -> redirect to landing (/)
 * If user role not in allowedRoles -> redirect to landing (/)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthUser();

  // If there is a token in localStorage but user state hasn't hydrated yet,
  // avoid redirecting on refresh — allow the route and let UserContext
  // rehydrate the user in background.
  const token = typeof window !== "undefined" && localStorage.getItem("token");
  if (!user && token) {
    // user will be rehydrated; allow access for now
    return children;
  }

  // not logged in (no token, no user)
  if (!user) return <Navigate to="/" replace />;

  // if roles are specified and user role is present and not allowed
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (user.role && !allowedRoles.includes(user.role)) {
      return <NotFound />; // or redirect to a "Not Authorized" page
    }
  }

  return children;
}
