const Message = require('../models/Message');
const User = require('../models/User');

const populateSender = async (messages) => {
  if (!Array.isArray(messages)) messages = [messages];
  for (const msg of messages) {
    if (msg.sender && typeof msg.sender === 'string') {
      const user = await User.findById(msg.sender);
      if (user) msg.sender = User.toPublicJSON(user);
    }
    if (msg.replyTo && typeof msg.replyTo === 'string') {
      const reply = await Message.findById(msg.replyTo);
      if (reply) msg.replyTo = reply;
    }
  }
  return messages;
};

const getMessages = async (req, res) => {
  try {
    const { roomId, dmTarget, groupId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filter = { deleted: { $ne: true } };
    if (roomId) filter.room = roomId;
    if (dmTarget) filter.dmTarget = dmTarget;
    if (groupId) filter.group = groupId;

    const options = { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit };
    const messages = await Message.find(filter, options);

    const populated = await populateSender(messages.reverse());
    const total = await Message.count(filter);

    res.json({
      messages: populated.filter(Boolean),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { q, roomId, dmTarget } = req.query;
    if (!q) return res.json([]);

    const filter = { deleted: { $ne: true }, text: { $regex: q, $options: 'i' } };
    if (roomId) filter.room = roomId;
    if (dmTarget) filter.dmTarget = dmTarget;

    const messages = await Message.find(filter, { sort: { createdAt: -1 }, limit: 50 });
    const populated = await populateSender(messages);
    res.json(populated.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { roomId, dmTarget } = req.body;

    const msg = await Message.create({
      room: roomId || null,
      dmTarget: dmTarget || null,
      sender: req.user._id,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
      image: req.file.mimetype.startsWith('image/') ? `/uploads/${req.file.filename}` : undefined,
      file: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    User.update({ _id: req.user._id }, { $inc: { 'stats.messagesCount': 1 } });
    const populated = await populateSender(msg);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessages, searchMessages, uploadFile };
