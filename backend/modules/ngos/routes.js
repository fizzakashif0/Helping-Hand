const express = require('express');
const router = express.Router();
const NGO = require('./model');
const Donation = require('../donations/model');
const Event = require('../events/model');
const { verifyToken, requireRole } = require('../../shared/authMiddleware');

// All routes require a logged-in NGO user
router.use(verifyToken);
router.use(requireRole('NGO'));

// GET /api/ngos/me — load NGO profile
router.get('/me', async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    res.json({ ngo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/ngos/me — update NGO profile
router.put('/me', async (req, res) => {
  try {
    const allowed = [
      'organizationName',
      'orgType',
      'missionStatement',
      'phone',
      'address',
      'website',
      'documents',
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const ngo = await NGO.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    res.json({ message: 'Profile updated successfully', ngo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ngos/me/stats — dashboard + reports data
router.get('/me/stats', async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id }).select('_id userId');
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const ngoUserId = ngo.userId;

    // Run all queries in parallel for performance
    const [
      donationsPostedByNGO,       // NGO is the donor
      donationsReceivedByNGO,     // NGO is an applicant/recipient
      completedPosted,
      completedReceived,
      recentDonations,
      totalEvents,
      activeEvents,
    ] = await Promise.all([
      // Total donations posted by this NGO
      Donation.countDocuments({
        donor: ngoUserId,
        postType: 'donation',
      }),

      // Total donations where NGO applied as recipient
      Donation.countDocuments({
        applicants: ngoUserId,
        postType: 'donation',
      }),

      // Completed donations posted by NGO
      Donation.countDocuments({
        donor: ngoUserId,
        postType: 'donation',
        status: 'completed',
      }),

      // Completed donations received by NGO
      Donation.countDocuments({
        applicants: ngoUserId,
        postType: 'donation',
        status: 'completed',
      }),

      // 5 most recent donations involving this NGO (posted or received)
      Donation.find({
        $or: [
          { donor: ngoUserId },
          { applicants: ngoUserId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('description type status createdAt quantityText donor applicants')
        .lean(),

      // Total events created by this NGO
      Event.countDocuments({ ngo: ngoUserId }),

      // Events currently active (upcoming or active counts as "active" for dashboard purposes)
      Event.countDocuments({
        ngo: ngoUserId,
        status: { $in: ['upcoming', 'active'] },
      }),
    ]);

    const totalDonations = donationsPostedByNGO + donationsReceivedByNGO;
    const completedDonations = completedPosted + completedReceived;

    // Shape recentDonations for the frontend
    const recentEvents = recentDonations.map((d) => {
      const desc = d.description || '';
      const name = desc.split('\n')[0]?.trim() || `${d.type} donation`;
      const isPostedByNGO = d.donor?.toString() === ngoUserId.toString();

      return {
        _id: d._id,
        name,
        participants: d.applicants?.length || 0,
        donations: 0,              // monetary amount — not tracked in this model
        status: d.status === 'completed' ? 'Completed' : 'Ongoing',
        date: d.createdAt?.toISOString().split('T')[0] || '',
        role: isPostedByNGO ? 'donor' : 'recipient',
      };
    });

    res.json({
      stats: {
        totalEvents,
        activeEvents,
        totalDonations,
        completedDonations,
        donationsPosted: donationsPostedByNGO,
        donationsReceived: donationsReceivedByNGO,
        totalParticipants: recentDonations.reduce(
          (sum, d) => sum + (d.applicants?.length || 0), 0
        ),
      },
      recentEvents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;