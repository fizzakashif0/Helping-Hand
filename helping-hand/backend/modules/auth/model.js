const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    phone: String,
    role: {
      type: String,
      enum: ["donor", "recipient", "NGO", "admin"],
      default: "donor",
    },
    profilePicture: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    otp: String,
    otpExpiry: Date,

    bio: String,
    address: String,
    city: String,
    location: { lat: Number, lng: Number },

    ratingAvg: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

