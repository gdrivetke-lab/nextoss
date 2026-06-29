# NextosS - تطبيق محادثات عربي شامل

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-gold?style=flat-square">
  <img src="https://img.shields.io/badge/Node.js-20-green?style=flat-square">
  <img src="https://img.shields.io/badge/MongoDB-7-brightgreen?style=flat-square">
  <img src="https://img.shields.io/badge/Redis-7-red?style=flat-square">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square">
</p>

**NextosS** is a modern Arabic chat application with real-time messaging, voice channels, group management, and premium subscriptions.

## ✨ Features

- **Chat System**: Text, voice, images, files, replies, editing, deletion, reactions
- **Voice Channels**: Real-time voice rooms with WebRTC, mute/unmute, speaker management
- **Groups & Channels**: Create groups, manage permissions, invite links
- **Authentication**: Email, phone, Google, Apple, guest login, 2FA
- **AI Assistant**: Smart replies, spam detection, content moderation, translation
- **End-to-End Encryption**: Secure DMs with AES encryption
- **Notifications**: Push notifications (FCM), sound, vibration
- **Admin Panel**: User management, reports, statistics
- **Premium Subscriptions**: Stripe integration, tiered plans
- **Arabic-First**: Full RTL support, Arabic interface

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/nextoss/nextoss.git
cd nextoss

# Install
npm install
cd backend && npm install && cd ..

# Environment
cp .env.example .env

# Start MongoDB & Redis (Docker)
docker-compose up -d mongodb redis

# Seed database
npm run seed

# Development
npm run dev
```

## 📁 Project Structure

```
nextoss/
├── backend/              # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, upload, rate limiting
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Socket, AI, encryption, cache
│   │   └── utils/        # Helpers, validation
│   └── tests/
├── frontend/             # Web client (HTML/CSS/JS)
├── database/
│   ├── seeds/            # Database seeding
│   └── migrations/       # Schema migrations
├── docker/               # Docker configs
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD
└── docker-compose.yml    # Full stack orchestration
```

## 📊 API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `POST /api/auth/google` | Google OAuth |
| `GET /api/rooms` | List chat rooms |
| `GET /api/messages` | Get messages |
| `POST /api/messages/upload` | Upload file |
| `GET /api/groups` | List groups |
| `GET /api/voice/channels` | List voice channels |
| `GET /api/admin/stats` | Dashboard statistics |

## 🔐 Security

- JWT access + refresh tokens
- Rate limiting on all endpoints
- Input sanitization
- Helmet security headers
- File upload validation
- MongoDB injection prevention
- 2FA support

## 📄 License

MIT
