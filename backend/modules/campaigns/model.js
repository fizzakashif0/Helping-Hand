const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(value) {
            return Array.isArray(value) && value.length === 2;
          },
          message: "Location coordinates must be [longitude, latitude].",
        },
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "upcoming", "completed"],
      default: "upcoming",
      index: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);
