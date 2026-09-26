const jwt = require("jsonwebtoken");

// Protects a route: requires a valid "Authorization: Bearer <token>"
// header. On success, attaches the owner's id to req.ownerId so
// route handlers can check ownership (e.g. before editing a listing).
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.ownerId = payload.ownerId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };