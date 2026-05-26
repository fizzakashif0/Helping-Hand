const express = require("express");
const router = express.Router();

const messageController = require("./controller");
const { verifyJWT } = require("../../shared/authMiddleware");

// POST /:threadId/messages - Send a message in a thread (auth required)
router.post("/:threadId/messages", verifyJWT, messageController.sendMessage);

// GET /:threadId/messages - Get all messages in a thread (auth required)
router.get("/:threadId/messages", verifyJWT, messageController.getMessages);

// PATCH /:threadId/messages/read - Mark messages as read (auth required)
router.patch("/:threadId/messages/read", verifyJWT, messageController.markRead);

module.exports = router;
