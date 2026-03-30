const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["food", "clothes", "blood", "money"],
    required: true
  },

  description: String,

  quantity: Number,

  images: [String],

  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  status: {
    type: String,
    enum: ["available", "completed"],
    default: "available"
  },

  expiryTime: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);