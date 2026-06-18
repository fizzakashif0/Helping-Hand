const express = require("express");
const router = express.Router();

const chatController = require("./controller");
const { verifyToken } = require("../../shared/authMiddleware");

// POST / - Create a new chat thread (auth required)
router.post("/", verifyToken, chatController.createThread);

// GET / - Get all threads for the authenticated user (auth required)
router.get("/", verifyToken, chatController.getThreadsByUser);

// GET /:id - Get a specific thread by ID (auth required)
router.get("/:id", verifyToken, chatController.getThreadById);

// PATCH /:id/lock - Lock a thread (auth required)
router.patch("/:id/lock", verifyToken, chatController.lockThread);
// PATCH /:id/complete - Mark thread as complete (auth required)
router.patch("/:id/complete", verifyToken, chatController.markComplete);
module.exports = router;
