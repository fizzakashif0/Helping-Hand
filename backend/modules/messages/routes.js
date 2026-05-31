const express = require("express");
const router = express.Router();

const messageController = require("./controller");
const { verifyToken } = require("../../shared/authMiddleware");

// POST /:threadId/messages - Send a message in a thread (auth required)
router.post("/:threadId/messages", verifyToken, messageController.sendMessage);

// GET /:threadId/messages - Get all messages in a thread (auth required)
router.get("/:threadId/messages", verifyToken, messageController.getMessages);

// PATCH /:threadId/messages/read - Mark messages as read (auth required)
router.patch("/:threadId/messages/read", verifyToken, messageController.markRead);

module.exports = router;
