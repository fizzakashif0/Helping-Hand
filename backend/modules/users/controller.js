const User = require("../auth/model");

function safeUserProjection() {
  // Exclude sensitive / internal OTP fields
  return "-password -otp -otpExpiry";
}

function getLoggedInUserId(req) {
  return req.user?.id || req.user?._id;
}

exports.getMyProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select(safeUserProjection());
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      name,
      bio,
      phone,
      address,
      city,
      location,
    } = req.body || {};

    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (city !== undefined) update.city = city;
    if (location !== undefined) update.location = location;

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select(safeUserProjection());

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.uploadProfilePicture = async (_req, res) => {
  // Multer upload is intentionally deferred until frontend integration is confirmed.
  return res.status(501).json({ message: "Profile picture upload not implemented yet" });
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name profilePicture role city ratingAvg totalDonations bio"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      profile: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


