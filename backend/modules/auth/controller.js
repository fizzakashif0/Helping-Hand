const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthUser = require("./model");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

  return jwt.sign(
    { sub: String(user._id), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function toPublicUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone,
    role: userDoc.role,
    // Frontend compatibility: it currently reads avatarUrl
    avatarUrl: userDoc.profilePicture,
  };
}

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await AuthUser.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await AuthUser.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role,
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await AuthUser.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.isBlocked) return res.status(403).json({ message: "Account is blocked" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await AuthUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

