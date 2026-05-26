const express = require("express");
const router = express.Router();

const reviewController = require("./controller");
const { verifyJWT } = require("../../shared/authMiddleware");

// POST /reviews - Create a new review (auth required)
router.post("/", verifyJWT, reviewController.createReview);

// GET /reviews/user/:userId - Get all accepted reviews for a user
router.get("/user/:userId", reviewController.getUserReviews);

module.exports = router;
