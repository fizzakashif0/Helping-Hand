const Queue = require("bull");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const reviewQueue = new Queue("review-processing", redisUrl);

module.exports = reviewQueue;
