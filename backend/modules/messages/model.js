const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatThread",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
    },
    attachments: [
      {
        type: { type: String, enum: ["file", "location"] },
        filename: String,
        fileSize: Number,
        mimeType: String,
        latitude: Number,
        longitude: Number,
        landmark: String,
        areaName: String,
        fullAddress: String,
      },
    ],
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
