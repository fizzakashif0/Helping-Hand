const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
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
  },

  password: {
    type: String,
    required: true,
  },

  // ─── ROLE ────────────────────────────────────────────────────────────────
  // "donor"     → regular donor/recipient user
  // "ngo"       → NGO account (may be pending approval)
  // "admin"     → platform administrator
  role: {
    type: String,
    enum: ["donor", "ngo", "admin"],
    default: "donor",
  },

  // ─── NGO-SPECIFIC FIELDS ─────────────────────────────────────────────────
  // Only populated when role === "ngo"
  ngoProfile: {
    orgName: { type: String },
    registrationNumber: { type: String },
    orgType: {
      type: String,
      enum: ["food_bank", "shelter", "medical", "education", "general", "other"],
    },
    missionStatement: { type: String },
    phone: { type: String },
    address: { type: String },
    website: { type: String },

    // Documents uploaded by the NGO for admin review
    documents: [
      {
        name: String,       // e.g. "Certificate of Incorporation"
        url: String,        // file URL after upload
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Admin reviews this status
   verificationStatus: {
  type: String,
  enum: ["pending", "verified", "rejected"],
  default: "pending",
},

    rejectionReason: { type: String },      // filled by admin on rejection
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: { type: Date },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ─── Compare password helper ──────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.models.User || mongoose.model("User", userSchema);