const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  postType: {
    type: String,
    enum: ["donation", "request"],
    default: "request"
  },

  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donation"
  },

  type: {
    type: String,
    enum: ["food", "clothes", "blood", "money"],
    required: true
  },

  message: String,

  quantityText: {
    type: String,
    default: "Not specified"
  },

  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  urgency: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Request", requestSchema);
