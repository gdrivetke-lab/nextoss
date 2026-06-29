const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });
    if (!password) return res.status(400).json({ message: 'Password required' });

    const existing = await User.findOne({
      $or: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existing) {
      if (existing.username === username) return res.status(409).json({ message: 'Username taken' });
      if (email && existing.email === email) return res.status(409).json({ message: 'Email already registered' });
      if (phone && existing.phone === phone) return res.status(409).json({ message: 'Phone already registered' });
    }

    const user = await User.create({
      username,
      email: email || undefined,
      phone: phone || undefined,
      password,
      role: 'user',
      status: 'online',
      auth: { isGuest: false, verified: !!email, phoneVerified: !!phone },
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      preferences: { theme: 'gold', fontSize: 14, language: 'ar' },
      privacy: { onlineStatus: 'everyone', readReceipts: true, typingIndicator: true },
      notifications: { push: true, sound: true, vibration: true, dm: true, group: true, voice: true },
      stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date(), lastSeen: new Date() },
      balance: { coins: 0, gems: 0, subscription: null },
      blockedUsers: [],
      friends: [],
      devices: [],
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({ user: User.toPublicJSON(user), token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, phone, username, password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });

    const user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(username ? [{ username }] : []),
      ],
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await User.comparePassword(user, password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.auth?.twoFactorEnabled) {
      return res.json({ require2FA: true, tempToken: generateToken(user, false) });
    }

    await User.update({ _id: user._id }, { status: 'online', 'stats.lastSeen': new Date() });
    user.status = 'online';

    const token = generateToken(user, true);
    const refreshToken = generateRefreshToken(user);

    res.json({ user: User.toPublicJSON(user), token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { googleId, email, username, avatar } = req.body;
    let user = await User.findOne({ 'auth.googleId': googleId });
    if (!user && email) user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: username || `user_${googleId.slice(-6)}`,
        email: email || undefined,
        avatar: avatar || '',
        role: 'user',
        status: 'online',
        auth: { googleId, isGuest: false, verified: true },
        preferences: { theme: 'gold', fontSize: 14, language: 'ar' },
        privacy: {}, notifications: {},
        stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date(), lastSeen: new Date() },
        balance: { coins: 0, gems: 0, subscription: null },
        blockedUsers: [], friends: [], devices: [],
      });
    } else {
      await User.update({ _id: user._id }, { status: 'online', 'stats.lastSeen': new Date() });
    }

    const token = generateToken(user, true);
    const refreshToken = generateRefreshToken(user);

    res.json({ user: User.toPublicJSON(user), token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Google auth failed', error: err.message });
  }
};

const appleAuth = async (req, res) => {
  try {
    const { appleId, email, username } = req.body;
    let user = await User.findOne({ 'auth.appleId': appleId });
    if (!user && email) user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: username || `user_${appleId.slice(-6)}`,
        email: email || undefined,
        role: 'user',
        status: 'online',
        auth: { appleId, isGuest: false, verified: true },
        preferences: { theme: 'gold', fontSize: 14, language: 'ar' },
        privacy: {}, notifications: {},
        stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date(), lastSeen: new Date() },
        balance: { coins: 0, gems: 0, subscription: null },
        blockedUsers: [], friends: [], devices: [],
      });
    } else {
      await User.update({ _id: user._id }, { status: 'online', 'stats.lastSeen': new Date() });
    }

    const token = generateToken(user, true);
    const refreshToken = generateRefreshToken(user);

    res.json({ user: User.toPublicJSON(user), token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Apple auth failed', error: err.message });
  }
};

const guestLogin = async (req, res) => {
  try {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const user = await User.create({
      username: `زائر_${guestId.slice(-6)}`,
      role: 'user',
      status: 'online',
      auth: { isGuest: true, verified: false },
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestId}`,
      preferences: { theme: 'gold', fontSize: 14, language: 'ar' },
      privacy: {}, notifications: {},
      stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date(), lastSeen: new Date() },
      balance: { coins: 0, gems: 0, subscription: null },
      blockedUsers: [], friends: [], devices: [],
    });

    const token = generateToken(user, true);
    const refreshToken = generateRefreshToken(user);

    res.json({ user: User.toPublicJSON(user), token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Guest login failed', error: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newToken = generateToken(user, true);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    await User.update({ _id: req.user._id }, { status: 'offline', 'stats.lastSeen': new Date() });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = { register, login, googleAuth, appleAuth, guestLogin, refreshToken, logout };
