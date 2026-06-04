const reviewQueue = require("./reviewQueue");
const Review = require("./model").Review;
const User = require("../users/model");
const mlService = require("../../shared/mlService");

function createReviewWorker(io) {
  if (!io) {
    throw new Error("createReviewWorker(io) requires a socket.io instance");
  }

  // Process jobs from the review-processing queue
  reviewQueue.process(async (job) => {
    try {
      const { reviewId, text, revieweeId } = job.data;

      // 1. Call ML service to analyze review
      const mlResult = await mlService.analyzeReview(text);

      // 2. Update Review document with result
      const reviewDoc = await Review.findByIdAndUpdate(
        reviewId,
        {
          sentiment: mlResult.sentiment,
          toxScore: mlResult.toxScore,
          status: mlResult.status,
          rejectReason: mlResult.rejectReason,
          stars: mlResult.status === "accepted" ? mlResult.stars : null,
        },
        { new: true }
      );

      // 3. If accepted, recalculate reviewee trust score
      if (mlResult.status === "accepted") {
        const reviewee = await User.findById(revieweeId);

        if (reviewee) {
          const oldScore = reviewee.trustScore || 0;
          const oldCount = reviewee.reviewCount || 0;

          // formula: newScore = (oldScore * oldCount * 0.9 + stars) / (oldCount * 0.9 + 1)
          const newScore = (oldScore * oldCount * 0.9 + mlResult.stars) / (oldCount * 0.9 + 1);

          await User.findByIdAndUpdate(
            revieweeId,
            {
              trustScore: newScore,
              reviewCount: oldCount + 1,
            },
            { new: true }
          );
        }
      }

      // 4. Emit review_processed to the reviewer
      const reviewerUserId = reviewDoc?.reviewer;
      if (reviewerUserId) {
        io.to(reviewerUserId.toString()).emit("review_processed", {
          status: mlResult.status,
          reason: mlResult.status === "rejected" ? mlResult.rejectReason || null : null,
        });
      }

      return { success: true, reviewId, status: mlResult.status };
    } catch (error) {
      console.error("Review worker error:", error);
      throw error;
    }
  });

  reviewQueue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  reviewQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });
}

module.exports = { createReviewWorker };

