const Message = require("./model");
const ChatThread = require("../chats/chatThreadModel");

/**
 * Send a message in a thread
 * Check thread status is 'active' — reject if locked
 */
exports.sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { text } = req.body;
    const senderId = req.user?.sub || req.userId;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Check thread exists and get its status
    const thread = await ChatThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Verify user belongs to this thread
    const isDonor = thread.donorId.toString() === senderId;
    const isRecipient = thread.recipientId.toString() === senderId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check thread is active
    if (thread.status !== "active") {
      return res.status(403).json({ message: "Cannot send message in a locked thread" });
    }

    // Create message
    const message = await Message.create({
      threadId,
      senderId,
      text: text.trim(),
    });

    // Update thread's updatedAt timestamp
    thread.updatedAt = new Date();
    await thread.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all messages in a thread
 * Verify userId belongs to thread
 * Return sorted by createdAt asc
 */
exports.getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check thread exists
    const thread = await ChatThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Verify user belongs to this thread
    const isDonor = thread.donorId.toString() === userId;
    const isRecipient = thread.recipientId.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Get all messages sorted by creation time
    const messages = await Message.find({ threadId })
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mark all unread messages in a thread as read for the current user
 * Update readAt on all messages where senderId != userId
 */
exports.markRead = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check thread exists
    const thread = await ChatThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Verify user belongs to this thread
    const isDonor = thread.donorId.toString() === userId;
    const isRecipient = thread.recipientId.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Mark unread messages as read
    const result = await Message.updateMany(
      {
        threadId,
        senderId: { $ne: userId },
        readAt: null,
      },
      {
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
