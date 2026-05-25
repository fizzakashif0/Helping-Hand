const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    documents: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.NGO || mongoose.model("NGO", ngoSchema);
