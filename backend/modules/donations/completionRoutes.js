const express = require("express");
const router = express.Router();

const completionController = require("./completionController");
const { verifyJWT } = require("../../shared/authMiddleware");

// PATCH /:id/complete - Mark donation as completed (donor only)
router.patch("/:id/complete", verifyJWT, completionController.markComplete);

// PATCH /:id/confirm - Confirm completion (recipient only)
router.patch("/:id/confirm", verifyJWT, completionController.confirmComplete);

// PATCH /:id/dispute - Dispute completion
router.patch("/:id/dispute", verifyJWT, completionController.disputeComplete);

module.exports = router;
