const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = req.params.userId
      ? await User.findById(req.params.userId)
      : req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(User.toPublicJSON(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ['username', 'bio', 'avatar', 'banner', 'privacy', 'notifications', 'preferences'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates);
    res.json(User.toPublicJSON(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(users.filter(u => u._id !== req.user._id).map(u => User.toPublicJSON(u)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id) return res.status(400).json({ message: 'Cannot block yourself' });
    await User.update({ _id: req.user._id }, { $addToSet: { blockedUsers: userId } });
    res.json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.update({ _id: req.user._id }, { $pull: { blockedUsers: userId } });
    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: user._id, status: user.status, lastSeen: user.stats?.lastSeen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'idle', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    await User.update({ _id: req.user._id }, { status, 'stats.lastSeen': new Date() });
    res.json({ userId: req.user._id, status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, searchUsers, blockUser, unblockUser, getStatus, updateStatus };
