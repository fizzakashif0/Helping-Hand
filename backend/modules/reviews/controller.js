const Review = require("./model").Review;
const User = require("../users/model");
const reviewQueue = require("./reviewQueue");

exports.createReview = async (req, res) => {
  try {
    const { donationId, revieweeId, role, text } = req.body;
    const reviewerId = req.user?.sub; // From JWT token

    // Validate required fields
    if (!donationId || !revieweeId || !role || !text) {
      return res.status(400).json({
        message: "donationId, revieweeId, role, and text are required",
      });
    }

    if (!["donor", "recipient"].includes(role)) {
      return res.status(400).json({
        message: "role must be 'donor' or 'recipient'",
      });
    }

    // Create Review document with status 'pending'
    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      donation: donationId,
      role,
      text,
      status: "pending",
    });

    // Enqueue job to Bull queue
    await reviewQueue.add(
      {
        reviewId: review._id,
        text,
        revieweeId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    // Return 202: Review submitted and being processed
    return res.status(202).json({
      message: "Review submitted and being processed",
      reviewId: review._id,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user with their trust score and review count
    const user = await User.findById(userId).select(
      "trustScore reviewCount"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all accepted reviews for that user
    const reviews = await Review.find({
      reviewee: userId,
      status: "accepted",
    })
      .populate("reviewer", "name profilePicture")
      .populate("donation", "_id type")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      user: {
        id: user._id,
        trustScore: user.trustScore || null,
        reviewCount: user.reviewCount || 0,
      },
      reviews,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
