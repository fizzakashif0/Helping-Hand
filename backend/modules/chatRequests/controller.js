const ChatRequest = require("./model");
const Notification = require("../notifications/model");
const chatsController = require("../chats/controller");

/**
 * Send a chat request to initiate messaging
 */
exports.sendRequest = async (req, res) => {
  try {
    const { donorId, recipientId, donationId } = req.body;
    if (!donorId || !recipientId || !donationId) {
      return res.status(400).json({
        message: "donorId, recipientId, and donationId are required",
      });
    }

    // Check if request already exists
    const existing = await ChatRequest.findOne({
      donorId,
      donationId,
      status: "pending",
    });

    if (existing) {
      return res.status(409).json({
        message: "A pending request already exists for this donation",
        requestId: existing._id,
      });
    }

    // Create chat request
    const chatRequest = await ChatRequest.create({
      donorId,
      recipientId,
      donationId,
      status: "pending",
    });

    // Notify the other user
    const requesterId = String(donorId);
    const otherUserId = String(recipientId);

    await Notification.create({
      receiverId: otherUserId,
      senderId: requesterId,
      type: "chat_request",
      title: "New Chat Request",
      message: "A donor wants to message you about a donation.",
      relatedRequestId: chatRequest._id,
      relatedDonationId: donationId,
    });

    return res.status(201).json(chatRequest);
  } catch (error) {
    console.error("Send request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Accept a chat request and create a thread
 */
exports.acceptRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find chat request
    const chatRequest = await ChatRequest.findById(requestId);
    if (!chatRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify recipient is accepting
    if (chatRequest.recipientId.toString() !== userId) {
      return res.status(403).json({ message: "Only recipient can accept this request" });
    }

    chatRequest.status = "accepted";
    await chatRequest.save();

    const thread = await chatsController.createThreadFromIds({
      donorId: chatRequest.donorId,
      recipientId: chatRequest.recipientId,
      donationId: chatRequest.donationId,
    });

    // Notify the requester
    await Notification.create({
      receiverId: chatRequest.donorId,
      senderId: userId,
      type: "request_accepted",
      title: "Request Accepted",
      message: "Your chat request was accepted! You can now message them.",
      relatedRequestId: chatRequest._id,
      relatedDonationId: chatRequest.donationId,
    });

    return res.status(200).json({ threadId: thread._id });
  } catch (error) {
    console.error("Accept request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Decline a chat request
 */
exports.declineRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find chat request
    const chatRequest = await ChatRequest.findById(requestId);
    if (!chatRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify recipient is declining
    if (chatRequest.recipientId.toString() !== userId) {
      return res.status(403).json({ message: "Only recipient can decline this request" });
    }

    // Update status
    chatRequest.status = "declined";
    await chatRequest.save();

    // Notify the requester
    await Notification.create({
      receiverId: chatRequest.donorId,
      senderId: userId,
      type: "request_declined",
      title: "Request Declined",
      message: "Your chat request was declined.",
      relatedRequestId: chatRequest._id,
      relatedDonationId: chatRequest.donationId,
    });

    return res.status(200).json(chatRequest);
  } catch (error) {
    console.error("Decline request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all pending chat requests for a user
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get pending requests where user is either donor or recipient
    const requests = await ChatRequest.find({
      $or: [{ donorId: userId }, { recipientId: userId }],
      status: "pending",
    })
      .populate("donorId", "name avatar")
      .populate("recipientId", "name avatar")
      .populate("donationId", "_id type description")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
