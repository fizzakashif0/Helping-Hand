
const DonationRequest = require("./model");
const Donation = require("../donations/model");
const Notification = require("../notifications/model");
const mongoose = require("mongoose");
const crypto = require("crypto");

function convertToObjectId(stringId) {
  if (!stringId) return null;
  if (mongoose.Types.ObjectId.isValid(stringId)) {
    return stringId;
  }
  const hash = crypto.createHash("md5").update(String(stringId)).digest("hex").substring(0, 24);
  return hash;
}

exports.createDonationRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const recipientId = convertToObjectId(body.userId || body.recipientId);
    const { donationId, message, recipientDisplayName } = body;

    if (!donationId) {
      return res.status(400).json({ message: "donationId is required" });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (String(donation.donor) === String(recipientId)) {
      return res.status(400).json({ message: "You cannot request your own donation" });
    }

    if (!["pending", "available"].includes(donation.status)) {
      return res.status(400).json({ message: "This donation is no longer available" });
    }

    const existing = await DonationRequest.findOne({
      donation: donationId,
      recipient: recipientId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(409).json({ message: "You already have an active request for this donation" });
    }

    const dr = await DonationRequest.create({
      donation: donationId,
      donor: donation.donor,
      recipient: recipientId,
      recipientDisplayName: recipientDisplayName || "",
      message,
      status: "pending",
    });

    await Notification.create({
      receiverId: donation.donor,
      senderId: recipientId,
      type: "DONATION_REQUEST",
      title: "New donation request",
      message: `${recipientDisplayName || "A recipient"} requested your ${donation.type} donation.`,
      relatedDonationId: donation._id,
      relatedRequestId: dr._id,
      isRead: false,
    });

    res.status(201).json(dr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listForDonor = async (req, res) => {
  try {
    const donorId = convertToObjectId(req.params.donorId);
    const items = await DonationRequest.find({ donor: donorId })
      .populate("donation")
      .populate("recipient", "name phone email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listForRecipient = async (req, res) => {
  try {
    const recipientId = convertToObjectId(req.params.recipientId);
    const items = await DonationRequest.find({ recipient: recipientId })
      .populate("donation")
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDonationRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const body = req.body || {};
    const { status, userId } = body;
    const actingUserId = convertToObjectId(userId || req.userId);

    const allowed = ["accepted", "rejected", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const dr = await DonationRequest.findById(requestId);
    if (!dr) return res.status(404).json({ message: "Request not found" });

    if (String(dr.donor) !== String(actingUserId)) {
      return res.status(403).json({ message: "Only the donor can update this request" });
    }

    dr.status = status;
    await dr.save();

    const donation = await Donation.findById(dr.donation);

    if (status === "accepted" && donation) {
      await Donation.findByIdAndUpdate(donation._id, { status: "matched" });
      await DonationRequest.updateMany(
        { donation: dr.donation, _id: { $ne: dr._id }, status: "pending" },
        { status: "rejected" }
      );
    }

    const title = status === "accepted" ? "Request accepted" : "Request update";
    const message =
      status === "accepted"
        ? "A donor accepted your donation request. You can coordinate pickup next."
        : status === "rejected"
        ? "A donor declined your donation request."
        : `Your donation request was marked ${status}.`;

    await Notification.create({
      receiverId: dr.recipient,
      senderId: dr.donor,
      type: "DONATION_REQUEST_STATUS",
      title,
      message,
      relatedDonationId: dr.donation,
      relatedRequestId: dr._id,
      isRead: false,
    });

    const updated = await DonationRequest.findById(requestId)
      .populate("donation")
      .populate("recipient", "name phone email")
      .lean();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
