const express = require("express");
const router = express.Router();

const chatRequestController = require("./controller");
const { verifyToken } = require("../../shared/authMiddleware");

// POST / - Send a chat request (auth required)
router.post("/", verifyToken, chatRequestController.sendRequest);

// PATCH /:id/accept - Accept a chat request (auth required)
router.patch("/:id/accept", verifyToken, chatRequestController.acceptRequest);

// PATCH /:id/decline - Decline a chat request (auth required)
router.patch("/:id/decline", verifyToken, chatRequestController.declineRequest);

// GET /pending - Get all pending requests for user (auth required)
router.get("/pending", verifyToken, chatRequestController.getPendingRequests);

module.exports = router;
