const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');

let io;

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 5 * 1024 * 1024,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      socket.userId = user._id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.username} (${socket.userId})`);

    User.update({ _id: socket.userId }, { status: 'online', 'stats.lastSeen': new Date() });
    io.emit('user:status', { userId: socket.userId, status: 'online' });

    socket.join(`user:${socket.userId}`);

    socket.on('room:join', (roomId) => {
      socket.join(`room:${roomId}`);
      socket.currentRoom = roomId;
    });

    socket.on('room:leave', (roomId) => {
      socket.leave(`room:${roomId}`);
      if (socket.currentRoom === roomId) socket.currentRoom = null;
    });

    socket.on('message:send', async (data, callback) => {
      try {
        const msg = await Message.create({
          room: data.roomId || null,
          dmTarget: data.dmTarget || null,
          group: data.groupId || null,
          sender: socket.userId,
          type: data.type || 'text',
          text: data.text || '',
          image: data.image || '',
          file: data.file || '',
          replyTo: data.replyTo || null,
        });

        User.update({ _id: socket.userId }, { $inc: { 'stats.messagesCount': 1 } });

        const target = data.dmTarget
          ? `user:${data.dmTarget}`
          : data.groupId
            ? `group:${data.groupId}`
            : `room:${data.roomId}`;

        io.to(target).emit('message:new', msg);

        if (data.dmTarget) {
          io.to(`user:${socket.userId}`).emit('message:new', msg);
        }

        if (callback) callback({ success: true, message: msg });
      } catch (err) {
        console.error('[Socket] message:send error:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('message:delete', async (msgId) => {
      try {
        const msg = await Message.findById(msgId);
        if (!msg || msg.sender !== socket.userId) return;
        await Message.update({ _id: msgId }, { $set: { deleted: true } });
        if (msg.room) io.to(`room:${msg.room}`).emit('message:deleted', msgId);
      } catch (err) {
        console.error('[Socket] message:delete error:', err);
      }
    });

    socket.on('message:edit', async (msgId, newText) => {
      try {
        const msg = await Message.findById(msgId);
        if (!msg || msg.sender !== socket.userId) return;
        await Message.update({ _id: msgId }, { $set: { text: newText, edited: true } });
        const target = msg.room ? `room:${msg.room}` : `user:${msg.dmTarget}`;
        io.to(target).emit('message:edited', { _id: msgId, text: newText, edited: true });
      } catch (err) {
        console.error('[Socket] message:edit error:', err);
      }
    });

    socket.on('message:reaction', async (msgId, emoji) => {
      try {
        const msg = await Message.findById(msgId);
        if (!msg) return;
        const reactions = msg.reactions || [];
        const existing = reactions.find(r => r.userId === socket.userId && r.emoji === emoji);
        if (existing) {
          await Message.update({ _id: msgId }, { $pull: { reactions: { userId: socket.userId, emoji } } });
        } else {
          await Message.update({ _id: msgId }, { $push: { reactions: { userId: socket.userId, emoji } } });
        }
        const updated = await Message.findById(msgId);
        const target = msg.room ? `room:${msg.room}` : `user:${msg.dmTarget}`;
        io.to(target).emit('message:reaction_update', { msgId, reactions: updated.reactions });
      } catch (err) {
        console.error('[Socket] message:reaction error:', err);
      }
    });

    socket.on('typing:start', (data) => {
      const target = data.dmTarget ? `user:${data.dmTarget}` : `room:${data.roomId}`;
      io.to(target).emit('typing:update', { userId: socket.userId, username: socket.user.username, typing: true });
    });

    socket.on('typing:stop', (data) => {
      const target = data.dmTarget ? `user:${data.dmTarget}` : `room:${data.roomId}`;
      io.to(target).emit('typing:update', { userId: socket.userId, typing: false });
    });

    socket.on('message:read', async (data) => {
      try {
        const filter = data.dmTarget
          ? { dmTarget: data.dmTarget, sender: socket.userId }
          : { room: data.roomId };
        await Message.updateMany(filter, { $addToSet: { readBy: socket.userId } });
      } catch (err) {
        console.error('[Socket] message:read error:', err);
      }
    });

    socket.on('voice:join', (data) => {
      socket.join(`voice:${data.channelId}`);
      socket.currentVoice = data.channelId;
      io.to(`voice:${data.channelId}`).emit('voice:user_joined', { userId: socket.userId, username: socket.user.username });
    });

    socket.on('voice:leave', () => {
      if (socket.currentVoice) {
        socket.leave(`voice:${socket.currentVoice}`);
        io.to(`voice:${socket.currentVoice}`).emit('voice:user_left', { userId: socket.userId });
        socket.currentVoice = null;
      }
    });

    socket.on('voice:signal', (data) => {
      io.to(`voice:${data.channelId}`).emit('voice:signal', { userId: socket.userId, signal: data.signal });
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] User disconnected: ${socket.user.username}`);
      if (socket.currentVoice) {
        io.to(`voice:${socket.currentVoice}`).emit('voice:user_left', { userId: socket.userId });
      }
      User.update({ _id: socket.userId }, { status: 'offline', 'stats.lastSeen': new Date() });
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { setupSocket, getIO };
