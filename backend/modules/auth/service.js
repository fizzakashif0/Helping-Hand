const User = require('./model');
const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const generateToken = require('../../utils/generateToken');
const sendOtpEmail = require('../../utils/sendOtp');

function toPublicUser(userDoc) {
  if (!userDoc) return null;
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone,
    profilePicture: userDoc.profilePicture,
    bio: userDoc.bio,
    address: userDoc.address,
    city: userDoc.city,
    location: userDoc.location,
    isVerified: userDoc.isVerified,
    isBlocked: userDoc.isBlocked,
    authProvider: userDoc.authProvider,
    googleId: userDoc.googleId,
    onlineStatus: userDoc.onlineStatus,
    ratingAvg: userDoc.ratingAvg,
    totalDonations: userDoc.totalDonations,
    totalReceived: userDoc.totalReceived,
    totalReceived: userDoc.totalReceived,
    ngoProfile: userDoc.ngoProfile,
  };
}

function makeRequiresRoleSelection(user) {
  return !user?.role;
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);

  // role must default to null for onboarding
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: null,
    authProvider: 'local',
  });

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: makeRequiresRoleSelection(user),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (user.isBlocked) {
    const err = new Error('Account is blocked');
    err.statusCode = 403;
    throw err;
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: makeRequiresRoleSelection(user),
  };
}

function generate6DigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function forgotPassword({ email }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // avoid leaking which emails exist; still return success
    return { success: true };
  }

  const otp = generate6DigitOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // If nodemailer is configured, send; else return OTP for testing
  const mailResult = await sendOtpEmail({ toEmail: user.email, otp });

  if (mailResult?.sent) {
    return { success: true };
  }

  return { success: true, otp, otpExpiry };
}

async function verifyOtp({ email, otp }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.otp || !user.otpExpiry) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  const isExpired = user.otpExpiry.getTime() < Date.now();
  if (isExpired) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  if (String(user.otp) !== String(otp)) {
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  return { success: true };
}

async function resetPassword({ email, otp, newPassword }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.otp || !user.otpExpiry) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  const isExpired = user.otpExpiry.getTime() < Date.now();
  if (isExpired) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  if (String(user.otp) !== String(otp)) {
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  user.password = await hashPassword(newPassword);
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return { success: true };
}

async function googleLogin({ googleId, email, name, profilePicture }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      profilePicture,
      role: null,
      isVerified: false,
      isBlocked: false,
      authProvider: 'google',
      googleId,
      password: await hashPassword(String(googleId)), // ensure required field exists
    });
  } else {
    // ensure provider fields are set
    user.authProvider = 'google';
    user.googleId = googleId;
    if (name && !user.name) user.name = String(name).trim();
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
  }

  if (user.isBlocked) {
    const err = new Error('Account is blocked');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: makeRequiresRoleSelection(user),
  };
}
async function registerNGO({ name, email, password, orgName, registrationNumber, orgType, missionStatement, phone, address, website }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: 'NGO',
    authProvider: 'local',
    ngoProfile: {
      orgName,
      registrationNumber,
      orgType,
      missionStatement,
      phone,
      address,
      website,
      verificationStatus: 'pending',
    },
  });

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: false,
    verificationStatus: 'pending',
  };
}

async function loginNGO({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Must actually be an NGO account
  if (user.role !== 'NGO') {
    const err = new Error('No NGO account found with these credentials');
    err.statusCode = 403;
    throw err;
  }

  if (user.isBlocked) {
    const err = new Error('Account is blocked');
    err.statusCode = 403;
    throw err;
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: false,
    verificationStatus: user.ngoProfile?.verificationStatus || 'pending',
  };
}
async function loginAdmin({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== 'admin') {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: false,
  };
}
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  registerNGO,   
  loginNGO,   
  loginAdmin,
};
