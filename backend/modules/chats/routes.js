const express = require("express");
const router = express.Router();

const chatController = require("./controller");
const { verifyJWT } = require("../../shared/authMiddleware");

// POST / - Create a new chat thread (auth required)
router.post("/", verifyJWT, chatController.createThread);

// GET / - Get all threads for the authenticated user (auth required)
router.get("/", verifyJWT, chatController.getThreadsByUser);

// GET /:id - Get a specific thread by ID (auth required)
router.get("/:id", verifyJWT, chatController.getThreadById);

// PATCH /:id/lock - Lock a thread (auth required)
router.patch("/:id/lock", verifyJWT, chatController.lockThread);

module.exports = router;
