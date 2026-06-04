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
        const { threadId, text } = data;

        if (!text || !text.trim()) {
          return callback({ error: "Message text is required" });
        }

        // Check thread exists and is active
        const thread = await ChatThread.findById(threadId);
        if (!thread) {
          return callback({ error: "Thread not found" });
        }

        if (thread.status !== "active") {
          io.to(threadId).emit("error", { message: "Chat is closed" });
          return callback({ error: "Chat is closed" });
        }

        // Verify user belongs to thread
        const isDonor = thread.donorId.toString() === socket.userId;
        const isRecipient = thread.recipientId.toString() === socket.userId;

        if (!isDonor && !isRecipient) {
          return callback({ error: "Forbidden" });
        }

        // Create and save message
        const message = await Message.create({
          threadId,
          senderId: socket.userId,
          text: text.trim(),
        });

        // Populate sender info
        await message.populate("senderId", "name profilePicture");

        // Update thread's updatedAt
        thread.updatedAt = new Date();
        await thread.save();

        // Emit to entire thread room
        io.to(threadId).emit("new_message", {
          _id: message._id,
          senderId: message.senderId,
          text: message.text,
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
