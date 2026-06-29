const Notification = require('../models/Notification');
const { getIO } = require('./socket');

const sendNotification = async ({ userId, type, title, titleAr, body, bodyAr, data, image, actionUrl }) => {
  try {
    const notification = await Notification.create({
      user: userId, type, title, titleAr, body, bodyAr,
      data, image, actionUrl,
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', notification);
    } catch (e) {}

    return notification;
  } catch (err) {
    console.error('[Notification] Error:', err.message);
  }
};

const markAsRead = async (userId, notificationIds) => {
  await Notification.updateMany(
    { user: userId },
    { $set: { read: true, readAt: new Date() } }
  );
};

const getNotifications = async (userId, { page = 1, limit = 50, unreadOnly = false }) => {
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;

  const notifications = await Notification.find(filter, { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit });
  const total = await Notification.count(filter);
  const unreadCount = await Notification.count({ user: userId, read: false });

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount,
  };
};

module.exports = { sendNotification, markAsRead, getNotifications };
