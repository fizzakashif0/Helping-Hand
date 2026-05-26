const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email'],
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ['donor', 'recipient', 'NGO', 'admin'],
      default: null,
    },

    phone: String,

    profilePicture: String,

    bio: String,

    address: String,

    city: String,

    location: {
      lat: Number,
      lng: Number,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    otp: String,

    otpExpiry: Date,

    ratingAvg: {
      type: Number,
      default: 0,
    },

    totalDonations: {
      type: Number,
      default: 0,
    },

    totalReceived: {
      type: Number,
      default: 0,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    googleId: String,

    onlineStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

