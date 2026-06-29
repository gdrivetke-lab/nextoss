const Group = require('../models/Group');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ owner: req.user._id }, { admins: req.user._id }, { members: req.user._id }],
    }).populate('owner', 'username avatar').lean();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const group = new Group({
      name, description: description || '',
      isPrivate: !!isPrivate,
      owner: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
      inviteLink: uuidv4().replace(/-/g, '').slice(0, 12),
      channels: [{ name: 'عام', type: 'text' }],
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('owner', 'username avatar status')
      .populate('admins', 'username avatar status')
      .populate('members', 'username avatar status');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { inviteLink } = req.body;
    const group = await Group.findOne({ inviteLink });
    if (!group) return res.status(404).json({ message: 'Invalid invite link' });

    if (group.bannedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are banned from this group' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Owner cannot leave, transfer ownership or delete group' });
    }
    await Group.findByIdAndUpdate(req.params.groupId, {
      $pull: { members: req.user._id, admins: req.user._id },
    });
    res.json({ message: 'Left group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addChannel = async (req, res) => {
  try {
    const { name, type } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ message: 'Admin only' });
    }
    group.channels.push({ name, type: type || 'text' });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Owner only' });
    }
    const idx = group.admins.indexOf(userId);
    if (idx > -1) group.admins.splice(idx, 1);
    else group.admins.push(userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Owner only' });
    }
    await Message.deleteMany({ group: group._id });
    await Group.findByIdAndDelete(req.params.groupId);
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getGroups, createGroup, getGroup, joinGroup, leaveGroup, addChannel, toggleAdmin, deleteGroup };
