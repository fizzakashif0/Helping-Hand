const express = require('express');
const router = express.Router();
const User = require('../auth/model');
const NGO = require('../ngos/model');
const { verifyToken, requireRole } = require('../../shared/authMiddleware');

// All routes here require admin
router.use(verifyToken);
router.use(requireRole('admin'));

// GET all pending NGO applications
router.get('/ngos/pending', async (req, res) => {
  try {
    // Pull from NGO collection (source of truth) and populate user details
    const ngos = await NGO.find({ verificationStatus: 'pending' })
      .populate('userId', '-password');

    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve an NGO — :id is the NGO document _id
router.put('/ngos/:id/approve', async (req, res) => {
  try {
    // 1. Update NGO collection (source of truth)
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: 'verified',      // ← 'approved' was wrong; enum is 'verified'
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    // 2. Sync mirror on User
    await User.findByIdAndUpdate(ngo.userId, {
      'ngoProfile.verificationStatus': 'verified',
      'ngoProfile.reviewedBy': req.user.id,
      'ngoProfile.reviewedAt': new Date(),
    });

    res.json({ message: 'NGO approved', ngo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject an NGO — :id is the NGO document _id
router.put('/ngos/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    // 1. Update NGO collection (source of truth)
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: 'rejected',
        rejectionReason: reason || 'No reason provided',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    // 2. Sync mirror on User
    await User.findByIdAndUpdate(ngo.userId, {
      'ngoProfile.verificationStatus': 'rejected',
      'ngoProfile.rejectionReason': reason || 'No reason provided',
      'ngoProfile.reviewedBy': req.user.id,
      'ngoProfile.reviewedAt': new Date(),
    });

    res.json({ message: 'NGO rejected', ngo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;