const User = require('../models/User');
const Report = require('../models/Report');
const Group = require('../models/Group');
const Message = require('../models/Message');

const getStats = async (req, res) => {
  try {
    const [
      totalUsers, onlineUsers, totalMessages, totalGroups, totalRooms,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      Message.countDocuments({ deleted: false }),
      Group.countDocuments(),
      require('../models/Room').countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayMessages = await Message.countDocuments({ createdAt: { $gte: today }, deleted: false });

    res.json({
      totalUsers, onlineUsers, totalMessages, totalGroups, totalRooms,
      pendingReports, todayUsers, todayMessages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;
    const filter = {};
    if (search) filter.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const banUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      'auth.verified': false,
      status: 'offline',
    });
    res.json({ message: 'User banned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reporter', 'username avatar')
      .populate('targetUser', 'username avatar')
      .lean();

    const total = await Report.countDocuments(filter);

    res.json({ reports, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status, action } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status: status || 'resolved', action: action || '', handledBy: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getUsers, updateUserRole, banUser, getReports, resolveReport };
