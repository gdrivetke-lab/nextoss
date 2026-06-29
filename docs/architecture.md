# NextosS Architecture

## Overview
NextosS is a full-stack Arabic chat application with real-time messaging, voice channels, groups, and premium subscriptions.

## Tech Stack

### Frontend
- **Web**: HTML5, CSS3, JavaScript (Vanilla)
- **Mobile (future)**: Flutter (iOS + Android)
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB 7+ (Mongoose ODM)
- **Cache**: Redis 7+
- **Auth**: JWT (access + refresh tokens)
- **AI**: OpenAI GPT-4 (spam detection, assistant, translation)

### Infrastructure
- **Web Server**: Nginx (reverse proxy + static files)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **CDN**: Optional (Cloudflare, AWS CloudFront)

## Database Schema

### Collections
1. **users** - User accounts, profiles, preferences, devices
2. **messages** - All messages (text, image, voice, file)
3. **rooms** - Chat rooms (text/voice)
4. **groups** - User-created groups with channels
5. **voicechannels** - Voice channel sessions
6. **reports** - User reports
7. **notifications** - Push notifications
8. **subscriptions** - Premium plan definitions
9. **usersubscriptions** - User subscription assignments

## API Structure

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login (email/phone/username)
POST   /api/auth/google         Google OAuth
POST   /api/auth/apple          Apple OAuth
POST   /api/auth/guest          Guest login
POST   /api/auth/refresh        Refresh token
POST   /api/auth/logout         Logout

GET    /api/users/search        Search users
GET    /api/users/:id           Get user profile
PUT    /api/users/profile       Update profile
POST   /api/users/block/:id     Block user
POST   /api/users/unblock/:id   Unblock user
PUT    /api/users/status        Update online status

GET    /api/messages            Get messages (room/dm/group)
GET    /api/messages/search     Search messages
POST   /api/messages/upload     Upload file/image

GET    /api/rooms               List rooms
GET    /api/rooms/:id           Get room details
POST   /api/rooms               Create room
POST   /api/rooms/:id/join      Join room
POST   /api/rooms/:id/leave     Leave room
DELETE /api/rooms/:id           Delete room

GET    /api/groups              List user groups
POST   /api/groups              Create group
GET    /api/groups/:id          Get group details
POST   /api/groups/:id/join     Join via invite link
POST   /api/groups/:id/leave    Leave group
DELETE /api/groups/:id          Delete group

GET    /api/voice/channels      List voice channels
POST   /api/voice/channels      Create voice channel
GET    /api/voice/turn          Get TURN credentials

GET    /api/notifications       Get notifications
PUT    /api/notifications/read  Mark as read
PUT    /api/notifications/read-all

GET    /api/subscriptions/plans List plans
GET    /api/subscriptions/my    Get my subscription
POST   /api/subscriptions/checkout  Create Stripe checkout
POST   /api/subscriptions/cancel    Cancel subscription

GET    /api/admin/stats         Dashboard stats
GET    /api/admin/users         List all users
PUT    /api/admin/users/:id/role  Update role
POST   /api/admin/users/:id/ban   Ban user
GET    /api/admin/reports       List reports
PUT    /api/admin/reports/:id   Resolve report

GET    /api/health              Health check
```

## WebSocket Events

### Client → Server
- `room:join` / `room:leave`
- `message:send` / `message:delete` / `message:edit` / `message:reaction`
- `typing:start` / `typing:stop`
- `message:read`
- `voice:join` / `voice:leave` / `voice:signal`

### Server → Client
- `message:new` / `message:deleted` / `message:edited` / `message:reaction_update`
- `typing:update`
- `notification:new`
- `user:status`
- `voice:user_joined` / `voice:user_left` / `voice:signal`

## Security
- JWT with short-lived access tokens + refresh tokens
- 2FA support (TOTP)
- End-to-end encryption for DMs
- Rate limiting on auth, API, and messages
- Helmet security headers
- File upload validation + image optimization
- Content moderation via AI
- XSS protection via HTML sanitization

## Performance
- Redis caching for frequent queries
- CDN for static assets
- Gzip/brotli compression
- MongoDB indexes on all query patterns
- Nginx reverse proxy with caching
- Image optimization via Sharp

## Deployment
```bash
# Development
npm run dev

# Production with Docker
docker-compose up -d

# Seed database
npm run seed
```
