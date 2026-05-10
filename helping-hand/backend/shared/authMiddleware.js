const jwt = require("jsonwebtoken");

const User = require("../modules/auth/model");

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.substring("Bearer ".length);
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id || decoded.sub;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(403).json({ message: "Forbidden" });

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

module.exports = { verifyToken, requireRole };

