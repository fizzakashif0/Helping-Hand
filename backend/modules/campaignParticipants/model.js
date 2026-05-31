const mongoose = require("mongoose");

const campaignParticipantSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

campaignParticipantSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

module.exports =
  mongoose.models.CampaignParticipant ||
  mongoose.model("CampaignParticipant", campaignParticipantSchema);
