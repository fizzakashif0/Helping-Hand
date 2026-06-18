const mongoose = require("mongoose");

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
    required: true,
  },

  type: {
    type: String,
    enum: ["food", "clothes", "blood", "money"],
    required: true,
  },

  postType: {
    type: String,
    enum: ["donation", "request"],
    default: "donation",
  },

  description: String,

  quantityText: {
    type: String,
    default: "Not specified",
  },

  images: [String],

  location: {
    /** Short label shown to recipients (with distance only) */
    landmark: String,
    /** Broader area (district / city line) — stored, not sent on public API */
    areaName: String,
    /** Optional full address for internal / donor use */
    fullAddress: String,
    /** Legacy / compatibility */
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
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

  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  status: {
    type: String,
    enum: ["pending", "available", "matched", "completed"],
    default: "available",
  },

  expiryTime: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

donationSchema.index({ locationGeo: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Donation", donationSchema);
