const User = require('../auth/model');

function sanitizeUser(userDoc) {
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
    ratingAvg: userDoc.ratingAvg,
    totalDonations: userDoc.totalDonations,
    totalReceived: userDoc.totalReceived,
    authProvider: userDoc.authProvider,
    googleId: userDoc.googleId,
    onlineStatus: userDoc.onlineStatus,
  };
}

async function selectRole({ userId, role }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(user);
}

async function updateProfile({ userId, data }) {
  const allowed = ['phone', 'bio', 'address', 'city', 'profilePicture', 'location'];
  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(user);
}

async function getProfile({ userId }) {
  const user = await User.findById(userId).select('-password -otp -otpExpiry');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
}

module.exports = { selectRole, updateProfile, getProfile };

