const express = require('express');
const router = express.Router();
const Event = require('./model');
const { verifyToken, requireRole } = require('../../shared/authMiddleware');

// All event-management routes require a logged-in NGO user
router.use(verifyToken);
router.use(requireRole('NGO'));

// POST /api/events — create a new event
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

// GET /api/events/mine — list this NGO's events
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

// GET /api/events/:id — single event detail
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

// PUT /api/events/:id — update event details/status
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

// DELETE /api/events/:id — remove an event
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