const jwt = require('jsonwebtoken');

function getAuthHeader(req) {
  return req.headers?.authorization;
}

function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function verifyToken(req, res, next) {
  try {
    const token = extractBearerToken(getAuthHeader(req));
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is not set' });
    }

    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || null,
    };

    return next();
  } catch (err) {
    const message = err?.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';

    return res.status(401).json({ message });
  }
}

function requireRole(...roles) {
  const allowed = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = req.user.role;
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = { verifyToken, requireRole };

