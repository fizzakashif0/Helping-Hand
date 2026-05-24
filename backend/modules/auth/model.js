const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String }, // bcrypt hashed
    phone: { type: String },
    role: {
      type: String,
      enum: ["donor", "recipient", "NGO", "admin"],
      default: "donor",
    },
    profilePicture: { type: String },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    otp: { type: String },
    otpExpiry: { type: Date },

    bio: { type: String },
    address: { type: String },
    city: { type: String },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    ratingAvg: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Avoid collision with modules/users/model.js (which compiles model as "User")
module.exports = mongoose.models.AuthUser || mongoose.model("AuthUser", userSchema);

