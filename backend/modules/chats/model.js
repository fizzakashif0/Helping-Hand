const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: "Chat must include at least two participants.",
      },
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationTransaction",
      required: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
