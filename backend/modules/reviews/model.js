const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationTransaction",
      required: true,
      index: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    role: {
      type: String,
      enum: ["donor", "recipient"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
    },
    sentiment: {
      type: String,
    },
    toxScore: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = {
  Feedback: mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema),
  Review: mongoose.models.Review || mongoose.model("Review", reviewSchema),
};
