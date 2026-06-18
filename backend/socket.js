const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./modules/messages/model");
const ChatThread = require("./modules/chats/chatThreadModel");


function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) {
        return next(new Error("token is required in socket handshake auth"));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error("Server misconfiguration: JWT_SECRET is not set"));
      }

      const decoded = jwt.verify(token, secret);
      const userId = decoded?.sub || decoded?.id;
      if (!userId) {
        return next(new Error("Unable to decode userId from JWT"));
      }

      socket.userId = userId;
      next();
    } catch (error) {
      next(error);
    }
  });



  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(socket.userId);

    /**
     * join_thread: Client joins a specific thread room
     * Emits: thread_history with last 50 messages
     */
    socket.on("join_thread", async (data, callback) => {
      try {
        const { threadId } = data;

        // Verify user belongs to this thread
        const thread = await ChatThread.findById(threadId);
        if (!thread) {
          return callback({ error: "Thread not found" });
        }

        const isDonor = thread.donorId.toString() === socket.userId;
        const isRecipient = thread.recipientId.toString() === socket.userId;

        if (!isDonor && !isRecipient) {
          return callback({ error: "Forbidden" });
        }

        // Join thread room
        socket.join(threadId);

        // Fetch last 50 messages
        const messages = await Message.find({ threadId })
          .populate("senderId", "name profilePicture")
          .sort({ createdAt: 1 })
          .limit(50);

        callback({ messages });
      } catch (error) {
        console.error("join_thread error:", error);
        callback({ error: error.message });
      }
    });

    /**
     * send_message: Client sends a message in a thread
     * Emits: new_message to all clients in the thread room
     */
   socket.on("send_message", async (data, callback) => {
  try {
    const { threadId, text, attachments } = data;

    if (!text?.trim() && (!attachments || attachments.length === 0)) {
      return callback({ error: "Message text or attachment is required" });
    }

    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return callback({ error: "Thread not found" });
    }

    if (thread.status !== "active") {
      return callback({ error: "Chat is closed" });
    }

    const isDonor = thread.donorId.toString() === socket.userId;
    const isRecipient = thread.recipientId.toString() === socket.userId;

    if (!isDonor && !isRecipient) {
      return callback({ error: "Forbidden" });
    }

    const message = await Message.create({
      threadId,
      senderId: socket.userId,
      text: text?.trim() || "",
      attachments: attachments || [],
    });

    await message.populate("senderId", "name profilePicture");

    thread.updatedAt = new Date();
    await thread.save();

    io.to(threadId).emit("new_message", {
      _id: message._id,
      senderId: message.senderId,
      text: message.text,
      attachments: message.attachments,
      createdAt: message.createdAt,
    });

    callback({ success: true });
  } catch (error) {
    console.error("send_message error:", error);
    callback({ error: error.message });
  }
});
    /**
     * typing: Broadcast that user is typing
     */
    socket.on("typing", (data) => {
      try {
        const { threadId } = data;
        socket.to(threadId).emit("user_typing", {
          senderId: socket.userId,
        });
      } catch (error) {
        console.error("typing error:", error);
      }
    });

    /**
     * stop_typing: Broadcast that user stopped typing
     */
    socket.on("stop_typing", (data) => {
      try {
        const { threadId } = data;
        socket.to(threadId).emit("user_stop_typing", {
          senderId: socket.userId,
        });
      } catch (error) {
        console.error("stop_typing error:", error);
      }
    });

    /**
 * mark_complete: One user marks donation as complete
 * If both users mark complete → lock thread + request feedback from both
 */
socket.on("mark_complete", async (data, callback) => {
  try {
    const { threadId } = data;
    const Notification = require("./modules/notifications/model");

    const threadCheck = await ChatThread.findById(threadId)
      .populate("donorId", "name")
      .populate("recipientId", "name");

    if (!threadCheck) return callback({ error: "Thread not found" });

    const isDonor = threadCheck.donorId._id.toString() === socket.userId;
    const isRecipient = threadCheck.recipientId._id.toString() === socket.userId;
    if (!isDonor && !isRecipient) return callback({ error: "Forbidden" });

    const alreadyMarked = (threadCheck.completedBy || []).some(
      (id) => id.toString() === socket.userId
    );
    if (alreadyMarked) return callback({ error: "Already marked complete" });

    // Atomically push and fetch updated doc in one query
   const mongoose = require("mongoose");
const thread = await ChatThread.findByIdAndUpdate(
  threadId,
  { $addToSet: { completedBy: new mongoose.Types.ObjectId(socket.userId) } },
  { new: true }
).populate("donorId", "name").populate("recipientId", "name");

    const completedBy = thread.completedBy || [];
    const bothCompleted = completedBy.length >= 2;

    const otherUserId = isDonor
      ? thread.recipientId._id.toString()
      : thread.donorId._id.toString();

    const userName = isDonor
      ? thread.donorId.name
      : thread.recipientId.name;

    if (bothCompleted) {
      await ChatThread.findByIdAndUpdate(threadId, {
        status: "locked",
        lockedAt: new Date(),
      });

      io.to(threadId).emit("chat_locked", { threadId });

      io.to(thread.donorId._id.toString()).emit("request_feedback", {
        donationId: thread.donationId,
        revieweeId: thread.recipientId._id,
        role: "donor",
      });

      io.to(thread.recipientId._id.toString()).emit("request_feedback", {
        donationId: thread.donationId,
        revieweeId: thread.donorId._id,
        role: "recipient",
      });

      callback({ success: true, bothCompleted: true });
    } else {
      await Notification.create({
        receiverId: otherUserId,
        senderId: socket.userId,
        type: "completion_requested",
        title: "Donation Marked Complete",
        message: `${userName} has marked this donation as complete. Mark it complete too to close the chat.`,
        relatedDonationId: thread.donationId,
      });

      io.to(otherUserId).emit("completion_requested", {
        threadId,
        fromUser: userName,
      });

      callback({ success: true, bothCompleted: false });
    }
  } catch (error) {
    console.error("mark_complete error:", error);
    callback({ error: error.message });
  }
});
    /**
     * mark_read: Mark messages as read in a thread
     */
    socket.on("mark_read", async (data, callback) => {
      try {
        const { threadId } = data;

        // Verify user belongs to thread
        const thread = await ChatThread.findById(threadId);
        if (!thread) {
          return callback({ error: "Thread not found" });
        }

        const isDonor = thread.donorId.toString() === socket.userId;
        const isRecipient = thread.recipientId.toString() === socket.userId;

        if (!isDonor && !isRecipient) {
          return callback({ error: "Forbidden" });
        }

        // Update readAt on unread messages from other user
        await Message.updateMany(
          {
            threadId,
            senderId: { $ne: socket.userId },
            readAt: null,
          },
          {
            readAt: new Date(),
          }
        );

        // Emit to entire thread room
        io.to(threadId).emit("messages_read", {
          threadId,
          userId: socket.userId,
        });

        callback({ success: true });
      } catch (error) {
        console.error("mark_read error:", error);
        callback({ error: error.message });
      }
    });

    /**
     * disconnect: Handle user disconnect
     */
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}

/**
 * Emit donation_completed event to both users
 * Call this from completionController after confirming completion
 */
function emitDonationCompleted(io, donorId, recipientId, donationId) {
  io.to(donorId).emit("donation_completed", {
    donationId,
    message: "Donation completed. Chat is now closed.",
  });
  io.to(recipientId).emit("donation_completed", {
    donationId,
    message: "Donation completed. Chat is now closed.",
  });

  // Request feedback from both donor and recipient
  io.to(donorId).emit("request_feedback", {
    threadId: donationId,
    donationId,
    revieweeId: recipientId,
    role: "donor",
  });

  io.to(recipientId).emit("request_feedback", {
    threadId: donationId,
    donationId,
    revieweeId: donorId,
    role: "recipient",
  });
}



module.exports = initializeSocket;
module.exports.emitDonationCompleted = emitDonationCompleted;
