const express = require('express');
const router = express.Router();
const Donation = require('./model');
const Request = require('../requests/model');
// Donor creates a donation
router.post('/', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json({ message: 'Donation created successfully', donation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Donor views all requests (to see who needs help)
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;