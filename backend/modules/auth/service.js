const crypto = require('crypto');
const validator = require('validator');
const User = require('./model');
const NGO = require('../ngos/model');
const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const generateToken = require('../../utils/generateToken');
const sendOtpEmail = require('../../utils/sendOtp');
const sendVerificationEmail = require('../../utils/sendVerificationEmail');
const verifyGoogleIdToken = require('../../utils/verifyGoogleToken');

const EMAIL_VERIFICATION_HOURS = 24;

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
    ngoProfile: userDoc.ngoProfile,
  };
}

function makeRequiresRoleSelection(user) {
  return !user?.role;
}

function createEmailVerificationFields() {
  return {
    emailVerificationToken: crypto.randomBytes(32).toString('hex'),
    emailVerificationExpiry: new Date(Date.now() + EMAIL_VERIFICATION_HOURS * 60 * 60 * 1000),
  };
}

function assertValidEmail(email) {
  if (!validator.isEmail(email)) {
    const err = new Error('Invalid email format');
    err.statusCode = 400;
    throw err;
  }
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  assertValidEmail(normalizedEmail);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const verification = createEmailVerificationFields();

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: null,
    authProvider: 'local',
    isVerified: false,
    ...verification,
  });

  const mailResult = await sendVerificationEmail({
    toEmail: user.email,
    name: user.name,
    verificationToken: verification.emailVerificationToken,
  });

  console.log(
    `[auth] Verification email for ${user.email}: sent=${mailResult.sent}`,
    mailResult.sent ? '' : `(dev link: ${mailResult.verifyUrl})`
  );

  return {
    user: toPublicUser(user),
    message: 'Registration successful',
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid email address');
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
    const err = new Error('Incorrect password');
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
    return { success: true };
  }

  const otp = generate6DigitOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

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

async function verifyEmail(token) {
  if (!token) {
    const err = new Error('Invalid or expired verification link');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({
    emailVerificationToken: String(token),
    emailVerificationExpiry: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    const err = new Error('Invalid or expired verification link');
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return {
    success: true,
    message: 'Email verified successfully. You can now log in.',
  };
}

async function resendVerificationEmail({ email }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  assertValidEmail(normalizedEmail);

  const user = await User.findOne({
    email: normalizedEmail,
    authProvider: 'local',
    isVerified: false,
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    return {
      success: true,
      message: 'If an unverified account exists for this email, a verification link has been sent.',
    };
  }

  const verification = createEmailVerificationFields();
  user.emailVerificationToken = verification.emailVerificationToken;
  user.emailVerificationExpiry = verification.emailVerificationExpiry;
  await user.save();

  const mailResult = await sendVerificationEmail({
    toEmail: user.email,
    name: user.name,
    verificationToken: verification.emailVerificationToken,
  });

  console.log(`[auth] Resent verification email for ${user.email}: sent=${mailResult.sent}`);

  return {
    success: true,
    message: 'If an unverified account exists for this email, a verification link has been sent.',
    ...(mailResult.sent ? {} : { verificationUrl: mailResult.verifyUrl }),
  };
}

async function googleLogin({ idToken, googleId, email, name, profilePicture }) {
  if (idToken) {
    const payload = await verifyGoogleIdToken(idToken);
    googleId = payload.sub;
    email = payload.email;
    name = payload.name || name;
    profilePicture = payload.picture || profilePicture;
  }

  if (!googleId || !email || !name) {
    const err = new Error('Google sign-in failed. Missing account information.');
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      profilePicture,
      role: null,
      isVerified: true,
      isBlocked: false,
      authProvider: 'google',
      googleId,
      password: await hashPassword(String(googleId)),
    });
  } else {
    user.authProvider = 'google';
    user.googleId = googleId;
    user.isVerified = true;
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

// ─── NGO AUTH ────────────────────────────────────────────────────────────────
async function registerNGO({ name, email, password, orgName, registrationNumber, orgType, missionStatement, phone, address, website }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  assertValidEmail(normalizedEmail);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);

  // 1. Create the User with role NGO
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: 'NGO',
    authProvider: 'local',
    isVerified: true,
  });

  // 2. Create NGO document — with rollback if it fails
  let ngo;
  try {
    ngo = await NGO.create({
      userId: user._id,
      organizationName: orgName,
      ...(registrationNumber ? { registrationId: registrationNumber } : {}),
      orgType,
      missionStatement,
      phone,
      address,
      website,
      verificationStatus: 'pending',
    });
  } catch (ngoErr) {
    // Roll back User to avoid orphan records
    await User.findByIdAndDelete(user._id);
    const err = new Error('Failed to create NGO profile: ' + ngoErr.message);
    err.statusCode = 500;
    throw err;
  }

  // 3. Mirror ngoId + verificationStatus onto User for quick reads
  user.ngoProfile = {
    ngoId: ngo._id,
    orgName,
    registrationNumber,
    orgType,
    missionStatement,
    phone,
    address,
    website,
    verificationStatus: 'pending',
  };
  await user.save();

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

  // Read verificationStatus from NGO collection (source of truth)
  const ngo = await NGO.findOne({ userId: user._id }).select('verificationStatus');
  const verificationStatus = ngo?.verificationStatus || user.ngoProfile?.verificationStatus || 'pending';

  // Keep User mirror in sync if it drifted (e.g. admin approved but User wasn't updated)
  if (ngo && user.ngoProfile?.verificationStatus !== ngo.verificationStatus) {
    await User.updateOne(
      { _id: user._id },
      { 'ngoProfile.verificationStatus': ngo.verificationStatus }
    );
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: false,
    verificationStatus,
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
  verifyEmail,
  resendVerificationEmail,
  registerNGO,
  loginNGO,
  loginAdmin,
};