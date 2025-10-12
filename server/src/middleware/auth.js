import jwt from "jsonwebtoken";

/**
 * Token-only middleware: reads Authorization header, verifies JWT,
 * and attaches decoded payload to req.user. If token absent or invalid,
 * req.user is set to null and request proceeds (non-blocking).
 */
const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  let token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    // If header wasn't in `Bearer <token>` form, try taking the last space-separated part
    const parts = authHeader.split(/\s+/).filter(Boolean);
    token = parts.length ? parts[parts.length - 1] : null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // normalize common fields for convenience
    req.user = decoded;
    req.userId = decoded.userId || decoded.id || decoded._id || null;
    req.userRole = decoded.role || decoded.accountType || null;
  } catch (err) {
    console.error("JWT verification error:", err.message);
    req.user = null;
  }

  return next();
};

export default authMiddleware;
