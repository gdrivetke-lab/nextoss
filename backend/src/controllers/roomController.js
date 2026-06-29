const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

const populateMembers = async (room) => {
  if (!room) return room;
  if (room.members?.length) {
    room.members = await User.find({ _id: { $in: room.members } });
  }
  return room;
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(await populateMembers(room));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, nameAr, description, descriptionAr, type, isPrivate, color } = req.body;
    const room = await Room.create({
      name, nameAr, description, descriptionAr,
      type: type || 'text', isPrivate: !!isPrivate, color: color || '#FFC001',
      icon: 'fas fa-hashtag',
      owner: req.user._id,
      members: [req.user._id],
      bannedUsers: [],
      lastActivity: new Date(),
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.bannedUsers?.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are banned from this room' });
    }

    if (!room.members?.includes(req.user._id)) {
      room.members = room.members || [];
      room.members.push(req.user._id);
      await Room.update({ _id: room._id }, { $set: { members: room.members } });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const leaveRoom = async (req, res) => {
  try {
    await Room.update({ _id: req.params.roomId }, { $pull: { members: req.user._id } });
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner !== req.user._id) {
      return res.status(403).json({ message: 'Only owner can delete room' });
    }
    await Message.deleteMany({ room: room._id });
    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRooms, getRoom, createRoom, joinRoom, leaveRoom, deleteRoom };
