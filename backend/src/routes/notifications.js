const router = require('express').Router();
const notificationService = require('../services/notification');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await notificationService.getNotifications(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      unreadOnly: unreadOnly === 'true',
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read', authenticate, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    await notificationService.markAsRead(req.user._id, notificationIds);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read-all', authenticate, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
