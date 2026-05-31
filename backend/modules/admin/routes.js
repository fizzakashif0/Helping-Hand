const express = require('express');
const router = express.Router();
const User = require('../auth/model');
const { verifyToken, requireRole } = require('../../shared/authMiddleware');

// All routes here require admin
router.use(verifyToken);
router.use(requireRole('admin'));

// GET all pending NGO applications
router.get('/ngos/pending', async (req, res) => {
  try {
    const ngos = await User.find({
      role: 'NGO',
      'ngoProfile.verificationStatus': 'pending',
    }).select('-password');

    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve an NGO
router.put('/ngos/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'ngoProfile.verificationStatus': 'approved',
        'ngoProfile.reviewedBy': req.user.id,
        'ngoProfile.reviewedAt': new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'NGO not found' });

    res.json({ message: 'NGO approved', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject an NGO
router.put('/ngos/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'ngoProfile.verificationStatus': 'rejected',
        'ngoProfile.rejectionReason': reason || 'No reason provided',
        'ngoProfile.reviewedBy': req.user.id,
        'ngoProfile.reviewedAt': new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'NGO not found' });

    res.json({ message: 'NGO rejected', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;