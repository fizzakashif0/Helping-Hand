const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Donation = require('../models/Donation');

// Recipient creates a request
router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json({ message: 'Request created successfully', request });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Recipient views all donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recipient applies for a donation
router.post('/apply/:donationId', async (req, res) => {
  try {
    const { userId } = req.body; // recipient ID
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    if (donation.applicants.includes(userId)) {
      return res.status(400).json({ error: 'You have already applied' });
    }

    donation.applicants.push(userId);
    await donation.save();

    res.json({ message: 'Applied successfully', donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;