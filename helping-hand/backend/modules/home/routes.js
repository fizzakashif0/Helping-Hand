const express = require('express');
const router = express.Router();
const Donation = require('../donations/model');
const Request = require('../requests/model');

// Donor creates a donation
router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    
    const donation = new Donation({
      ...req.body,
      donor: userId
    });
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

// Donor views all their own donations
router.get('/my-donations', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    
    const donations = await Donation.find({ donor: userId }).sort({ createdAt: -1 });
    res.json({ message: 'Your donations fetched', donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Donor edits a donation
router.put('/:id', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, donor: userId },
      req.body,
      { new: true }
    );

    if (!donation) return res.status(404).json({ error: 'Donation not found or not authorized' });

    res.json({ message: 'Donation updated successfully', donation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Donor deletes a donation
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    
    const donation = await Donation.findOneAndDelete({ _id: req.params.id, donor: userId });

    if (!donation) return res.status(404).json({ error: 'Donation not found or not authorized' });

    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;