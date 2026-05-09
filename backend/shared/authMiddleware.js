/**
 * Attaches req.userId from Bearer token, body.userId, or query.userId.
 * Some read-only donation list endpoints are public (no auth).
 */

function pathWithoutQuery(req) {
  const raw = req.originalUrl || req.url || "";
  return (raw.split("?")[0] || "").replace(/\/+$/, "") || "/";
}

/**
 * Public donation reads must stay reachable without userId (web + mobile browse).
 * Use suffix checks so we still match if originalUrl differs slightly (e.g. no leading slash in edge cases).
 */
function bodyUserId(req) {
  const b = req.body;
  if (b == null || typeof b !== "object" || Array.isArray(b)) return undefined;
  return b.userId;
}

function isPublicRequest(req) {
  if (req.method === "OPTIONS") return true;

  const path = pathWithoutQuery(req);
  const alt = ((req.path || "") + "").replace(/\/+$/, "") || "/";

  if (req.method !== "GET") return false;

  const candidates = [path, alt].filter(Boolean);
  for (const p of candidates) {
    if (p === "/api/donations") return true;
    if (/\/donations\/browse$/.test(p)) return true;
    if (/\/api\/donations\/nearby\//.test(p)) return true;
    if (/\/api\/donations\/[^/]+\/public$/.test(p)) return true;
  }

  return false;
}

const authMiddleware = (req, res, next) => {
  try {
    if (isPublicRequest(req)) {
      let userId;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        userId = authHeader.substring(7);
      }
      if (!userId) {
        userId = bodyUserId(req) || req.query?.userId;
      }
      if (userId) {
        req.userId = userId;
        req.user = req.user || { id: userId };
      }
      return next();
    }

    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.substring(7);
    }
    if (!userId) {
      userId = bodyUserId(req) || req.query?.userId;
    }
    if (!userId && req.user) {
      userId = req.user.id || req.user._id;
    }

    if (!userId) {
      return res.status(401).json({
        error:
          "Authentication required. Provide userId (body/query) or Authorization: Bearer <userId>",
      });
    }

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
