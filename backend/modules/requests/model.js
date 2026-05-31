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
    /** Short label shown to recipients (with distance only) */
    landmark: String,
    /** Broader area (district / city line) — stored, not sent on public API */
    areaName: String,
    /** Optional full address for internal use */
    fullAddress: String,
    /** Legacy / compatibility */
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  /** GeoJSON for MongoDB 2dsphere queries — not exposed on public API */
  locationGeo: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
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

// Index for geospatial queries
requestSchema.index({ locationGeo: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Request", requestSchema);
