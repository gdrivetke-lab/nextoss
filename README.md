<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-%23FFC001?style=for-the-badge&labelColor=0a0e17">
  <img src="https://img.shields.io/badge/Node.js-20-%23339933?style=for-the-badge&labelColor=0a0e17">
  <img src="https://img.shields.io/badge/NeDB-1.0-%23ff6b9d?style=for-the-badge&labelColor=0a0e17">
  <img src="https://img.shields.io/badge/license-MIT-%23a78bfa?style=for-the-badge&labelColor=0a0e17">
  <br><br>
  <img src="https://api.dicebear.com/7.x/shapes/svg?seed=nextoss&backgroundColor=FFC001&size=120" width="80">
  <h1 style="font-family: 'Orbitron', monospace; letter-spacing: 4px; margin: 8px 0 4px;">NextosS</h1>
  <p><b>تطبيق محادثات عربي شامل — Modern Arabic Chat Application</b></p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-api-examples">API</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="https://github.com/gdrivetke-lab/nextoss/blob/main/docs/architecture.md">Architecture</a>
  </p>
  <br>
</div>

---

> **NextosS** is a full-featured Arabic-first chat application with real-time messaging, voice channels, group management, file sharing, and an elegant dark futuristic UI — all powered by a lightweight Node.js backend with zero external dependencies (no MongoDB, no Redis).

## ✨ Features

<table>
<tr>
<td width="50%">

**💬 Chat System**
- Text, voice messages, images & file uploads
- Message reactions (👍❤️😄😮😢🔥)
- Edit & delete messages
- Reply, forward, search
- Typing indicators
- Read receipts
- End-to-end encryption

**🔊 Voice Channels**
- Real-time voice rooms via WebRTC
- Mute/unmute participants
- Speaker management
- Voice activity detection
- TURN server support

**👥 Groups**
- Create groups with custom channels
- Admin & moderator roles
- Invite links
- Member management

</td>
<td width="50%">

**🔐 Authentication**
- Email/password registration
- Login with email, phone, or username
- Guest login (no account needed)
- Google & Apple OAuth
- JWT access + refresh tokens
- 2FA support

**🎨 UI/UX**
- Dark futuristic theme with gold accent (#FFC001)
- RTL Arabic-first interface
- 5 theme colors (gold, red, orange, yellow, burgundy)
- Adjustable font sizes
- Animated particles background
- Voice recording with waveform
- Emoji picker (60+ emojis)

**🛠️ Backend**
- Express.js + Socket.io real-time engine
- NeDB file-based database (no setup!)
- Rate limiting & security headers
- File upload with validation
- AI-powered spam detection
- Admin dashboard & reports
- Premium subscription plans

</td>
</tr>
</table>

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/gdrivetke-lab/nextoss.git
cd nextoss

# Install backend dependencies
cd backend && npm install

# Seed sample data (users, rooms, messages)
npm run seed

# Start the server
node src/app.js

# Open in browser
# → http://localhost:3001
```

**Demo accounts:**
| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `admin@nextoss.com` | `admin123` | admin |
| أحمد | `ahmed@nextoss.com` | `test123` | user |
| سارة | `sara@nextoss.com` | `test123` | moderator |

## 🖥️ Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=login&backgroundColor=FFC001" width="200"><br><b>Login Screen</b></td>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=chat&backgroundColor=0a0e17" width="200"><br><b>Chat Interface</b></td>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=voice&backgroundColor=ff6b9d" width="200"><br><b>Voice Channel</b></td>
    </tr>
    <tr>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=settings&backgroundColor=a78bfa" width="200"><br><b>Settings</b></td>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=emoji&backgroundColor=3ec6ff" width="200"><br><b>Emoji Picker</b></td>
      <td align="center"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=admin&backgroundColor=f3393a" width="200"><br><b>Admin Panel</b></td>
    </tr>
  </table>
</div>

## 📡 API Examples

### Authentication

```javascript
// Register
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myuser',
    email: 'user@example.com',
    password: 'secret123'
  })
}).then(r => r.json()).then(data => {
  // { user: {...}, token: '...', refreshToken: '...' }
});

// Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@nextoss.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(data => {
  localStorage.setItem('token', data.token);
});

// Guest login (no credentials needed)
fetch('/api/auth/guest', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Guest user:', data.user));
```

### Messages

```javascript
// Get room messages
fetch('/api/messages?roomId=ROOM_ID&page=1&limit=50', {
  headers: { 'Authorization': 'Bearer ' + token }
}).then(r => r.json()).then(data => {
  console.log(data.messages);
});

// Search messages
fetch('/api/messages/search?q=hello&roomId=ROOM_ID', {
  headers: { 'Authorization': 'Bearer ' + token }
}).then(r => r.json()).then(data => {
  console.log('Found:', data.length, 'results');
});
```

### WebSocket (Real-time)

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.emit('room:join', roomId);

socket.on('message:new', (msg) => {
  console.log('New message:', msg);
});

// Send a message
socket.emit('message:send', {
  roomId: roomId,
  text: 'Hello everyone! 👋',
  type: 'text'
});

// Typing indicator
socket.emit('typing:start', { roomId });
socket.emit('typing:stop', { roomId });
```

## 🏗️ Project Structure

```
nextoss/
├── backend/                    # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── app.js              # Server entry point
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # Route handlers (auth, messages, rooms, etc.)
│   │   ├── database/           # NeDB file-based database manager
│   │   ├── middleware/         # Auth (JWT), upload (Multer), rate limiting
│   │   ├── models/             # Data access layer (User, Message, Room, etc.)
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Socket.io, encryption, AI, notifications, cache
│   │   └── utils/              # Helpers, validation
│   ├── database/seeds/         # Sample data seeding
│   └── data/                   # NeDB database files (auto-created)
│
├── index.html                   # Single-page frontend application
├── docker/                     # Docker & Nginx configuration
├── docs/                       # Architecture & API documentation
├── uploads/                    # File upload directory
├── package.json
└── docker-compose.yml
```

## 🔒 Security

| Feature | Detail |
|---------|--------|
| **Authentication** | JWT access + refresh tokens, bcrypt password hashing |
| **Rate Limiting** | 100 req/min general, 10 req/15min auth, 5 req/sec messaging |
| **Headers** | Helmet security headers (CSP, XSS, frame protection) |
| **Input Validation** | Express-validator, HTML sanitization |
| **File Upload** | MIME type validation, size limits (10MB) |
| **Encryption** | AES-256 for end-to-end encrypted messages |
| **Content Moderation** | AI-powered spam & abuse detection |

## 🧪 Tech Stack

```
Frontend:     HTML5, CSS3, JavaScript (Vanilla) · Socket.io Client · Font Awesome · Tajawal Font
Backend:      Node.js 20 · Express 4 · Socket.io 4 · NeDB (file-based DB)
Auth:         JWT · bcrypt · OAuth 2.0 (Google, Apple)
Real-time:    WebSocket (Socket.io) · WebRTC (voice)
Security:     Helmet · CORS · Rate Limiting · Input Sanitization
DevOps:       Docker · Docker Compose · Nginx · GitHub Actions
```

## 📄 License

MIT — feel free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with ❤️ and ☕ · NextosS v1.0.0</sub>
  <br>
  <sub>
    <a href="https://github.com/gdrivetke-lab/nextoss">GitHub</a> •
    <a href="docs/architecture.md">Architecture</a> •
    <a href="docs/api.md">API Docs</a>
  </sub>
</div>
