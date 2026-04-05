const express = require("express");
const router = express.Router();

// Basic home routes
router.get("/", (req, res) => {
  res.json({ message: "Welcome to Helping Hand API" });
});

router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = router;