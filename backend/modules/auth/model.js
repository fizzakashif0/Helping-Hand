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
    ngoProfile: {
  orgName:             { type: String },
  registrationNumber:  { type: String },
  orgType: {
    type: String,
    enum: ['food_bank', 'shelter', 'medical', 'education', 'general', 'other'],
  },
  missionStatement: { type: String },
  phone:            { type: String },
  address:          { type: String },
  website:          { type: String },
  documents: [
    {
      name:       String,   // e.g. "Certificate of Incorporation"
      url:        String,   // file URL after upload
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  verificationStatus: {
    type:    String,
    enum:    ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String },
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:      { type: Date },
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

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpiry: {
      type: Date,
      select: false,
    },

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

