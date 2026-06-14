const ChatThread = require("./chatThreadModel");
const User = require("../users/model");
const Message = require("../messages/model");

/**
 * Create a new chat thread between donor and recipient for a donation
 * Check no thread already exists for this donationId
 */
exports.createThread = async (req, res) => {
  try {
    const { donorId, recipientId, donationId } = req.body;

    if (!donorId || !recipientId || !donationId) {
      return res.status(400).json({
        message: "donorId, recipientId, and donationId are required",
      });
    }

    // Check if thread already exists for this donation
    const existingThread = await ChatThread.findOne({ donationId });
    if (existingThread) {
      return res.status(409).json({
        message: "Thread already exists for this donation",
        threadId: existingThread._id,
      });
    }

    // Create new thread
    const thread = await ChatThread.create({
      donorId,
      recipientId,
      donationId,
      status: "active",
    });

    return res.status(201).json(thread);
  } catch (error) {
    console.error("Create thread error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Internal helper to create/find a thread from plain IDs.
 * Keeps createThread route behavior unchanged while enabling reuse.
 */
exports.createThreadFromIds = async ({ donorId, recipientId, donationId }) => {
  const existingThread = await ChatThread.findOne({ donationId });
  if (existingThread) {
    return existingThread;
  }

  const thread = await ChatThread.create({
    donorId,
    recipientId,
    donationId,
    status: "active",
  });

  return thread;
};

/**
 * Get all threads for a user (where user is donor OR recipient)
 * Populate donor and recipient info, sort by latest message
 */
exports.getThreadsByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all threads where user is donor or recipient
    const threads = await ChatThread.find({
      $or: [{ donorId: userId }, { recipientId: userId }],
    })
      .populate("donorId", "name profilePicture")
      .populate("recipientId", "name profilePicture")
      .populate("donationId", "_id type description")
      .sort({ updatedAt: -1 });

    return res.status(200).json(threads);
  } catch (error) {
    console.error("Get threads error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a specific thread by ID
 * Only return if user is donor or recipient of this thread
 */
exports.getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
   const userId = req.user?.id || req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const thread = await ChatThread.findById(id)
      .populate("donorId", "name profilePicture")
      .populate("recipientId", "name profilePicture")
      .populate("donationId", "_id type description");

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Verify user belongs to this thread
    const isDonor = thread.donorId._id.toString() === userId;
    const isRecipient = thread.recipientId._id.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(thread);
  } catch (error) {
    console.error("Get thread error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Lock a chat thread (set status to 'locked', update lockedAt)
 */
exports.lockThread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.sub || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const thread = await ChatThread.findById(id);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Verify user belongs to this thread
    const isDonor = thread.donorId.toString() === userId;
    const isRecipient = thread.recipientId.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Lock the thread
    thread.status = "locked";
    thread.lockedAt = new Date();
    await thread.save();

    return res.status(200).json(thread);
  } catch (error) {
    console.error("Lock thread error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
