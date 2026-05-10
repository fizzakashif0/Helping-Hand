const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./model");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

  return jwt.sign({ id: String(user._id), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profilePicture: user.profilePicture,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    bio: user.bio,
    address: user.address,
    city: user.city,
    location: user.location,
    ratingAvg: user.ratingAvg,
    totalDonations: user.totalDonations,
    totalReceived: user.totalReceived,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role,
    });

    const token = signToken(user);

    return res.status(201).json({ token, user: safeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.isBlocked) return res.status(403).json({ message: "Account is blocked" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = String(otp);
    user.otpExpiry = otpExpiry;

    await user.save();

    // Testing: return OTP in response
    return res.json({ message: "OTP generated", otp, otpExpiry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = Date.now();
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "OTP not set" });
    }

    const isOtpMatch = String(user.otp) === String(otp);
    const isNotExpired = user.otpExpiry.getTime() > now;

    if (!isOtpMatch) return res.status(400).json({ message: "Invalid OTP" });
    if (!isNotExpired) return res.status(400).json({ message: "OTP expired" });

    return res.json({ message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "email, otp and newPassword are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "OTP not set" });
    }

    const isOtpMatch = String(user.otp) === String(otp);
    const isNotExpired = user.otpExpiry.getTime() > Date.now();

    if (!isOtpMatch) return res.status(400).json({ message: "Invalid OTP" });
    if (!isNotExpired) return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // clear otp fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

