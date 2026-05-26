const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 10000,
});

/**
 * Call the Python ML microservice to analyze a review text
 * @param {string} text - The review text to analyze
 * @returns {Promise<Object>} { status, stars, sentiment, toxScore, rejectReason }
 */
async function analyzeReview(text) {
  try {
    const response = await mlClient.post("/analyze", { text });
    return response.data;
  } catch (error) {
    console.error("ML Service error:", error.message);
    throw error;
  }
}

module.exports = {
  analyzeReview,
};
