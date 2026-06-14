const Notification = require("./model");
const mongoose = require("mongoose");

exports.listForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const count = await Notification.countDocuments({ receiverId: userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const body = req.body || {};
    const userId = req.user?.id;
    const { notificationId, markAll } = body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (markAll) {
      await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
      return res.json({ ok: true });
    }

    if (!notificationId) {
      return res.status(400).json({ message: "notificationId or markAll required" });
    }

    const n = await Notification.findOneAndUpdate(
      { _id: notificationId, receiverId: userId },
      { isRead: true },
      { new: true }
    );

    if (!n) return res.status(404).json({ message: "Notification not found" });
    res.json(n);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
