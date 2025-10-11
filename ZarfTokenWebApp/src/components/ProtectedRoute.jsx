import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/auth";

/**
 * ProtectedRoute
 * - allowedRoles: optional array of roles (e.g. ['Admin','Vendor'])
 * If user is not authenticated -> redirect to landing (/)
 * If user role not in allowedRoles -> redirect to landing (/)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthUser();

  // not logged in
  if (!user) return <Navigate to="/" replace />;

  // if roles are specified and user role is not allowed
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  }

  return children;
}
