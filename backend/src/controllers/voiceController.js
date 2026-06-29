const VoiceChannel = require('../models/VoiceChannel');
const config = require('../config');

const getChannels = async (req, res) => {
  try {
    const { roomId, groupId } = req.query;
    const filter = {};
    if (roomId) filter.room = roomId;
    if (groupId) filter.group = groupId;
    const channels = await VoiceChannel.find(filter)
      .populate('owner', 'username avatar')
      .populate('speakers', 'username avatar status')
      .populate('listeners', 'username avatar status');
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createChannel = async (req, res) => {
  try {
    const { name, roomId, groupId, isPrivate, password, maxUsers } = req.body;
    const channel = new VoiceChannel({
      name,
      room: roomId || null,
      group: groupId || null,
      isPrivate: !!isPrivate,
      maxUsers: maxUsers || 10,
      owner: req.user._id,
      speakers: [req.user._id],
    });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTurnCredentials = async (req, res) => {
  try {
    res.json({
      urls: config.webrtc.turnUrl,
      username: config.webrtc.turnUsername,
      credential: config.webrtc.turnCredential,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const joinChannel = async (req, res) => {
  try {
    const channel = await VoiceChannel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (channel.listeners.length + channel.speakers.length >= channel.maxUsers) {
      return res.status(400).json({ message: 'Channel is full' });
    }

    if (!channel.listeners.includes(req.user._id) && !channel.speakers.includes(req.user._id)) {
      channel.listeners.push(req.user._id);
      await channel.save();
    }

    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const leaveChannel = async (req, res) => {
  try {
    const channel = await VoiceChannel.findByIdAndUpdate(
      req.params.channelId,
      { $pull: { speakers: req.user._id, listeners: req.user._id, mutedUsers: req.user._id, deafenedUsers: req.user._id } },
      { new: true }
    );
    res.json({ message: 'Left channel' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleMute = async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await VoiceChannel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (channel.owner?.toString() !== req.user._id.toString() && !channel.speakers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const idx = channel.mutedUsers.indexOf(userId);
    if (idx > -1) channel.mutedUsers.splice(idx, 1);
    else channel.mutedUsers.push(userId);

    await channel.save();
    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getChannels, createChannel, getTurnCredentials, joinChannel, leaveChannel, toggleMute };
