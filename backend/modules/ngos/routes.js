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

    // Run all queries in parallel
    const [
      donationsPostedByNGO,
      donationsReceivedByNGO,
      completedPosted,
      completedReceived,
      totalEvents,
      activeEvents,
      recentDonations,
      recentEventDocs,
    ] = await Promise.all([
      // Donations posted by this NGO as donor
      Donation.countDocuments({
        donor: ngoUserId,
        postType: 'donation',
      }),

      // Donations where NGO applied as recipient
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

      // Total events created by this NGO
      Event.countDocuments({ ngo: ngoUserId }),

      // Active events (upcoming + active)
      Event.countDocuments({
        ngo: ngoUserId,
        status: { $in: ['upcoming', 'active'] },
      }),

      // 5 most recent donations involving this NGO
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

      // 5 most recent events
      Event.find({ ngo: ngoUserId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name status startDate participants')
        .lean(),
    ]);

    const totalDonations = donationsPostedByNGO + donationsReceivedByNGO;
    const completedDonations = completedPosted + completedReceived;

    // Shape recent donations for frontend
    const recentDonationItems = recentDonations.map((d) => {
      const desc = d.description || '';
      const name = desc.split('\n')[0]?.trim() || `${d.type} donation`;
      const isPostedByNGO = d.donor?.toString() === ngoUserId.toString();

      return {
        _id: d._id,
        name,
        participants: d.applicants?.length || 0,
        donations: 0,
        status: d.status === 'completed' ? 'Completed' : 'Ongoing',
        date: d.createdAt?.toISOString().split('T')[0] || '',
        role: isPostedByNGO ? 'donor' : 'recipient',
        itemType: 'donation',
      };
    });

    // Shape recent events for frontend
    const recentEventItems = recentEventDocs.map((e) => ({
      _id: e._id,
      name: e.name,
      participants: e.participants?.length || 0,
      donations: 0,
      status: e.status === 'completed'
        ? 'Completed'
        : e.status === 'cancelled'
        ? 'Cancelled'
        : 'Ongoing',
      date: e.startDate?.toISOString().split('T')[0] || '',
      role: 'organizer',
      itemType: 'event',
    }));

    // Merge and sort by date, most recent first, cap at 5
    const recentEvents = [...recentDonationItems, ...recentEventItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

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