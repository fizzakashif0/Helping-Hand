// Simple auth middleware that extracts user ID from request
// Supports: Authorization header (Bearer), userId in body/query, or req.user object

const authMiddleware = (req, res, next) => {
  try {
    let userId;

    // Try to get from Authorization header (Bearer token format)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.substring(7); // Remove "Bearer " prefix
    }

    // Fallback to userId in request body or query
    if (!userId) {
      userId = req.body.userId || req.query.userId;
    }

    // Fallback to req.user if it exists (from JWT middleware)
    if (!userId && req.user) {
      userId = req.user.id || req.user._id;
    }

    if (!userId) {
      return res.status(401).json({ error: "Authentication required. Please provide userId or Authorization header" });
    }

    // Attach to req for use in routes
    req.userId = userId;
    if (!req.user) {
      req.user = { id: userId };
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = authMiddleware;
