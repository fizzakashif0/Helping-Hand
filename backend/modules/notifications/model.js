const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationRequest",
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
