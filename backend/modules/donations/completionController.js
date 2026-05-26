const Donation = require("./model");
const ChatThread = require("../chats/chatThreadModel");
const Notification = require("../notifications/model");

/**
 * Mark a donation as completed by the donor
 * Sets status to 'pending_confirmation' and notifies recipient
 */
exports.markComplete = async (req, res) => {
  try {
    const { id: donationId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Verify user is donor
    const isDonor = donation.donor.toString() === userId;
    if (!isDonor) {
      return res.status(403).json({ message: "Only donor can mark as complete" });
    }

    // Update donation status
    donation.status = "pending_confirmation";
    await donation.save();

    // Create notification for recipient
    // Find the chat thread to get recipient ID
    const thread = await ChatThread.findOne({ donationId });
    if (thread) {
      const recipientId = thread.donorId.toString() === userId ? thread.recipientId : thread.donorId;

      await Notification.create({
        receiverId: recipientId,
        message: `Donor has marked the donation as completed. Please confirm.`,
        donationId,
        type: "donation_completion",
      });
    }

    return res.status(200).json(donation);
  } catch (error) {
    console.error("Mark complete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Confirm donation completion by the recipient
 * Sets status to 'completed' and locks the chat thread
 */
exports.confirmComplete = async (req, res) => {
  try {
    const { id: donationId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find chat thread to verify user is recipient
    const thread = await ChatThread.findOne({ donationId });
    if (!thread) {
      return res.status(404).json({ message: "Chat thread not found" });
    }

    const isRecipient = thread.recipientId.toString() === userId;
    if (!isRecipient) {
      return res.status(403).json({ message: "Only recipient can confirm completion" });
    }

    // Only allow confirmation if status is pending_confirmation
    if (donation.status !== "pending_confirmation") {
      return res.status(400).json({
        message: "Donation must be in pending_confirmation status",
      });
    }

    // Update donation status
    donation.status = "completed";
    await donation.save();

    // Lock the chat thread
    thread.status = "locked";
    thread.lockedAt = new Date();
    await thread.save();

    // Notify both users via notification
    await Notification.create({
      receiverId: thread.donorId,
      message: "Donation completion confirmed. Chat is now closed.",
      donationId,
      type: "donation_completed",
    });

    await Notification.create({
      receiverId: thread.recipientId,
      message: "You confirmed the donation completion. Chat is now closed.",
      donationId,
      type: "donation_completed",
    });

    return res.status(200).json(donation);
  } catch (error) {
    console.error("Confirm complete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Dispute a donation completion
 * Sets status to 'disputed' and creates admin notification
 */
exports.disputeComplete = async (req, res) => {
  try {
    const { id: donationId } = req.params;
    const userId = req.user?.sub || req.userId;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Find chat thread to verify user belongs to this donation
    const thread = await ChatThread.findOne({ donationId });
    if (!thread) {
      return res.status(404).json({ message: "Chat thread not found" });
    }

    const isDonor = thread.donorId.toString() === userId;
    const isRecipient = thread.recipientId.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update donation status
    donation.status = "disputed";
    await donation.save();

    // Create notification for admin (use a hardcoded admin ID or fetch from config)
    const adminNotification = await Notification.create({
      receiverId: "admin", // Placeholder - implement proper admin user handling
      message: `Donation ${donationId} completion disputed by ${isDonor ? "donor" : "recipient"}. Reason: ${reason || "Not provided"}`,
      donationId,
      type: "dispute_created",
    });

    return res.status(200).json(donation);
  } catch (error) {
    console.error("Dispute complete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
