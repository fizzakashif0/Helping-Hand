const ChatRequest = require("./model");
const Notification = require("../notifications/model");
const chatsController = require("../chats/controller");

exports.sendRequest = async (req, res) => {
  try {
    const { donorId, recipientId, donationId } = req.body;
    
    if (!donorId || !recipientId || !donationId) {
      return res.status(400).json({ message: "donorId, recipientId, and donationId are required" });
    }

    const existing = await ChatRequest.findOne({ donorId, recipientId, donationId, status: "pending" });
    if (existing) {
      return res.status(409).json({ message: "A pending request already exists", requestId: existing._id });
    }

    const chatRequest = await ChatRequest.create({ donorId, recipientId, donationId, status: "pending" });

    const User = require("../auth/model");
    const Donation = require("../donations/model");
    const HelpRequest = require("../requests/model");

    // Fetch the requester (sender) name
    const sender = await User.findById(recipientId).select("name");
    const senderName = sender?.name || "Someone";

    // Determine if this is Flow 1 (HelpRequest) or Flow 2 (Donation)
    // and notify the correct person accordingly
    const helpRequest = await HelpRequest.findById(donationId).select("title description");
    const donation = await Donation.findById(donationId).select("description type");

    let postTitle = "a request";
    let notifyUserId = recipientId; // Default to recipient

    if (helpRequest) {
      // Flow 1: Fizza clicked Help Now on Ayesha's help request
      // → notify recipientId (Ayesha, the request poster who needs help)
      postTitle = helpRequest.title || helpRequest.description || "your request";
      notifyUserId = recipientId;
    } else if (donation) {
      // Flow 2: Ayesha clicked Request This on Fizza's donation
      // → notify donorId (Fizza, the donation poster who has something to give)
      postTitle = donation.description || donation.type || "a donation";
      notifyUserId = donorId;
    }

    // Fetch the person who will receive the notification
    const notifyUser = await User.findById(notifyUserId).select("name");
    const notifyUserName = notifyUser?.name || "Someone";

    // Create notification for the correct recipient
    await Notification.create({
      receiverId: String(notifyUserId),
      senderId: String(recipientId),
      senderName: senderName,
      type: "chat_request",
      title: `${senderName} wants your ${helpRequest ? "request" : "donation"}`,
      message: `${senderName} wants ${helpRequest ? "to help with" : "to request"} "${postTitle}". Accept to start chatting.`,
      relatedRequestId: chatRequest._id,
      relatedDonationId: donationId,
    });

    return res.status(201).json(chatRequest);
  } catch (error) {
    console.error("Send request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const userId = req.user?.id || req.user?.sub || req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chatRequest = await ChatRequest.findById(requestId);
    if (!chatRequest) return res.status(404).json({ message: "Request not found" });

    // Only the donor (post owner) can accept
    if (chatRequest.donorId.toString() !== userId) {
      return res.status(403).json({ message: "Only the donor can accept this request" });
    }

    chatRequest.status = "accepted";
    await chatRequest.save();

    const thread = await chatsController.createThreadFromIds({
      donorId: chatRequest.donorId,
      recipientId: chatRequest.recipientId,
      donationId: chatRequest.donationId,
    });

    // Fetch donor name and post title for personalized message
    const User = require("../auth/model");
    const donor = await User.findById(userId).select("name");
    const donorName = donor?.name || "The donor";
    
    let postTitle = "your request";
    const Donation = require("../donations/model");
    const HelpRequest = require("../requests/model");
    const donation = await Donation.findById(chatRequest.donationId).select("description type");
    if (donation) {
      const firstLine = donation.description?.split("\n")[0] || donation.type || "a donation";
      postTitle = `"${firstLine}"`;
    } else {
      const helpReq = await HelpRequest.findById(chatRequest.donationId).select("message title");
      if (helpReq) {
        const firstLine = helpReq.message?.split("\n")[0] || helpReq.title || "your request";
        postTitle = `"${firstLine}"`;
      }
    }

    // Notify the RECIPIENT — their request was accepted
    await Notification.create({
      receiverId: chatRequest.recipientId,  // recipient gets notified
      senderId: userId,
      senderName: donorName,
      type: "request_accepted",
      title: "Request Accepted ✓",
      message: `${donorName} accepted your request for ${postTitle}. You can now message them!`,
      relatedRequestId: chatRequest._id,
      relatedDonationId: chatRequest.donationId,
    });

    return res.status(200).json({ threadId: thread._id });
  } catch (error) {
    console.error("Accept request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const userId = req.user?.id || req.user?.sub || req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const chatRequest = await ChatRequest.findById(requestId);
    if (!chatRequest) return res.status(404).json({ message: "Request not found" });

    // Only the donor (post owner) can decline
    if (chatRequest.donorId.toString() !== userId) {
      return res.status(403).json({ message: "Only the donor can decline this request" });
    }

    chatRequest.status = "declined";
    await chatRequest.save();

    // Fetch donor name and post title for personalized message
    const User = require("../auth/model");
    const donor = await User.findById(userId).select("name");
    const donorName = donor?.name || "The donor";
    
    let postTitle = "your request";
    const Donation = require("../donations/model");
    const HelpRequest = require("../requests/model");
    const donation = await Donation.findById(chatRequest.donationId).select("description type");
    if (donation) {
      const firstLine = donation.description?.split("\n")[0] || donation.type || "a donation";
      postTitle = `"${firstLine}"`;
    } else {
      const helpReq = await HelpRequest.findById(chatRequest.donationId).select("message title");
      if (helpReq) {
        const firstLine = helpReq.message?.split("\n")[0] || helpReq.title || "your request";
        postTitle = `"${firstLine}"`;
      }
    }

    // Notify the RECIPIENT — their request was declined
    await Notification.create({
      receiverId: chatRequest.recipientId,  // recipient gets notified
      senderId: userId,
      senderName: donorName,
      type: "request_declined",
      title: "Request Declined",
      message: `${donorName} declined your request for ${postTitle}.`,
      relatedRequestId: chatRequest._id,
      relatedDonationId: chatRequest.donationId,
    });

    return res.status(200).json(chatRequest);
  } catch (error) {
    console.error("Decline request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = req.user?.id || req.user?.sub || req.userId;
    console.log("=== PENDING userId ===", userId, typeof userId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Debug: Check all pending records
    const testFind = await ChatRequest.find({ status: "pending" }).limit(5);
    console.log("=== ALL PENDING (no filter) ===", testFind.map(r => ({
      donorId: r.donorId?.toString(),
      donorIdType: typeof r.donorId,
      recipientId: r.recipientId?.toString(),
    })));

    // Fix: Convert userId to ObjectId if it's a valid MongoDB ObjectId
    let queryUserId = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryUserId = new mongoose.Types.ObjectId(userId);
      console.log("=== Converted userId to ObjectId ===", queryUserId);
    }

    // Only return requests where user is the DONOR (post owner who needs to accept/reject)
    const requests = await ChatRequest.find({
      donorId: queryUserId,
      status: "pending",
    })
      .populate("donorId", "name email")
      .populate("recipientId", "name email")
      .sort({ createdAt: -1 });

    console.log("=== FOUND REQUESTS:", requests.length, requests.map(r => ({
      donorId: r.donorId,
      recipientId: r.recipientId,
    })));
    const HelpRequest = require("../requests/model");
    const Donation = require("../donations/model");

    const mapped = await Promise.all(requests.map(async (r) => {
      let postTitle = "Donation Request";
      if (r.donationId) {
        const donation = await Donation.findById(r.donationId).select("title description");
        if (donation) {
          postTitle = donation.title || donation.description || "Donation Request";
        } else {
          const helpReq = await HelpRequest.findById(r.donationId).select("title description");
          if (helpReq) postTitle = helpReq.title || helpReq.description || "Donation Request";
        }
      }

      return {
        _id: r._id,
        postTitle,
        // User is the donor (post owner), sender is the recipient who requested
        senderUsername: r.recipientId?.name || r.recipientId?.email || "Someone",
        type: "recipient_to_donor",
        status: r.status,
        createdAt: r.createdAt,
      };
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};