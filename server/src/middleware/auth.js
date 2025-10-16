import jwt from "jsonwebtoken";

/**
 * Token-only middleware: reads Authorization header, verifies JWT,
 * and attaches decoded payload to req.user. If token absent or invalid,
 * req.user is set to null and request proceeds (non-blocking).
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    // no auth header: treat as anonymous, do not block
    req.user = null;
    return next();
  }

  let token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    // If header present but token missing -> respond 401 so frontend can react
    const parts = authHeader.split(/\s+/).filter(Boolean);
    token = parts.length ? parts[parts.length - 1] : null;
    if (!token) return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // normalize common fields for convenience
    req.user = decoded;
    req.userId = decoded.userId || decoded.id || decoded._id || null;
    req.userRole = decoded.role || decoded.accountType || null;
    return next();
  } catch (err) {
    // Token exists but is invalid/expired — return 401 so frontend can show message & redirect
    console.warn("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Helper to protect routes explicitly (if you want some routes to require auth)
export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  return next();
};

export default authMiddleware;
