const mongoose = require("mongoose");

// Clear existing model cache if it exists
if (mongoose.models.Donation) {
  delete mongoose.models.Donation;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Donation) {
  delete mongoose.modelSchemas.Donation;
}

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

  postType: {
    type: String,
    enum: ["donation", "request"],
    default: "donation"
  },

  description: String,

  quantityText: {
    type: String,
    default: "Not specified"
  },

  images: [String],

  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  status: {
    type: String,
    enum: ["pending", "available", "completed"],
    default: "pending"
  },

  expiryTime: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);