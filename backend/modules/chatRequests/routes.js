const express = require("express");
const router = express.Router();

const chatRequestController = require("./controller");
const { verifyJWT } = require("../../shared/authMiddleware");

// POST / - Send a chat request (auth required)
router.post("/", verifyJWT, chatRequestController.sendRequest);

// PATCH /:id/accept - Accept a chat request (auth required)
router.patch("/:id/accept", verifyJWT, chatRequestController.acceptRequest);

// PATCH /:id/decline - Decline a chat request (auth required)
router.patch("/:id/decline", verifyJWT, chatRequestController.declineRequest);

// GET /pending - Get all pending requests for user (auth required)
router.get("/pending", verifyJWT, chatRequestController.getPendingRequests);

module.exports = router;
