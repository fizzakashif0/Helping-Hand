const express = require('express');
const router = express.Router();
const Event = require('./model');
const { verifyToken, requireRole } = require('../../shared/authMiddleware');

// ─── PUBLIC (no auth) ─────────────────────────────────────────────────────────

router.get('/public', async (req, res) => {
  try {
    const events = await Event.find({
      status: { $in: ['upcoming', 'active'] },
    })
      .populate('ngo', 'name ngoProfile')
      .sort({ startDate: 1 })
      .limit(20)
      .lean();

    const shaped = events.map((e) => ({
      _id: e._id,
      name: e.name,
      description: e.description || '',
      location: e.location || '',
      startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
      status: e.status,
      targetParticipants: e.targetParticipants || 0,
      participants: e.participants?.length || 0,
      ngoName: e.ngo?.ngoProfile?.orgName || e.ngo?.name || 'NGO',
    }));

    res.json({ events: shaped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('ngo', 'name ngoProfile')
      .lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({
      event: {
        _id: event._id,
        name: event.name,
        description: event.description || '',
        location: event.location || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        status: event.status,
        targetParticipants: event.targetParticipants || 0,
        participants: event.participants?.length || 0,
        participantIds: event.participants?.map(p => p.toString()) || [],
        ngoName: event.ngo?.ngoProfile?.orgName || event.ngo?.name || 'NGO',
        ngoId: event.ngo?._id,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ANY LOGGED-IN USER ───────────────────────────────────────────────────────
router.use(verifyToken);

// POST /api/events/:id/join — donor volunteers or recipient applies
router.post('/:id/join', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user.id;
    const alreadyJoined = event.participants.some(p => p.toString() === userId);

    if (alreadyJoined) {
      // Toggle: leave the event
      event.participants = event.participants.filter(p => p.toString() !== userId);
      await event.save();
      return res.json({
        message: 'You have left the event',
        joined: false,
        participants: event.participants.length,
        participantIds: event.participants.map(p => p.toString()),
      });
    }

    event.participants.push(userId);
    await event.save();

    res.json({
      message: 'Successfully joined the event',
      joined: true,
      participants: event.participants.length,
      participantIds: event.participants.map(p => p.toString()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── NGO ONLY ─────────────────────────────────────────────────────────────────
router.use(requireRole('NGO'));

router.post('/', async (req, res) => {
  try {
    const { name, description, location, startDate, endDate } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({ message: 'name and startDate are required' });
    }

    const event = await Event.create({
      ngo: req.user.id,
      name,
      description,
      location,
      startDate,
      endDate,
      status: 'upcoming',
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const events = await Event.find({ ngo: req.user.id })
      .sort({ startDate: -1 })
      .lean();

    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, ngo: req.user.id })
      .populate('donations')
      .populate('participants', 'name email')
      .lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'description', 'location', 'startDate', 'endDate', 'status'];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, ngo: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, ngo: req.user.id });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;