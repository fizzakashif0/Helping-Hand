const Review = require("./model").Review;
const User = require("../users/model");

exports.createReview = async (req, res) => {
  try {
    const { donationId, revieweeId, role, text } = req.body;
    const reviewerId = req.user?.id || req.user?.sub;

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

    // Save review as pending first
    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      donation: donationId,
      role,
      text,
      status: "pending",
    });

    // Call ML service
    let mlResult;
    try {
      const mlResponse = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      mlResult = await mlResponse.json();
    } catch (mlError) {
      console.error("ML service error:", mlError);
      mlResult = { status: "accepted", stars: 3, sentiment: "NEUTRAL", toxScore: 0 };
    }

    // Update review with ML result
    review.status = mlResult.status;
    review.sentiment = mlResult.sentiment;
    review.toxScore = mlResult.toxScore;
    review.stars = mlResult.status === "accepted" ? mlResult.stars : null;
    review.rejectReason = mlResult.rejectReason || null;
    await review.save();

    // If accepted, update reviewee trust score
    if (mlResult.status === "accepted") {
      const reviewee = await User.findById(revieweeId);
      if (reviewee) {
        const oldScore = reviewee.trustScore || 0;
        const oldCount = reviewee.reviewCount || 0;
        const newRawScore = (oldScore * oldCount * 0.9 + mlResult.stars) / (oldCount * 0.9 + 1);
        const newScore = Math.round((newRawScore / 5) * 100);
        await User.findByIdAndUpdate(revieweeId, {
          trustScore: newScore,
          reviewCount: oldCount + 1,
        });
      }
    }

    return res.status(201).json({
      message: mlResult.status === "accepted"
        ? "Review submitted successfully"
        : "Review was rejected: " + mlResult.rejectReason,
      status: mlResult.status,
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

    const user = await User.findById(userId).select("trustScore reviewCount");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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