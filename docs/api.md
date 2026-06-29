# NextosS API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production:  https://api.nextoss.com/api
```

## Authentication
All endpoints (except auth) require `Authorization: Bearer <token>` header.

### Auth Endpoints

#### POST /auth/register
```json
{ "username": "user", "email": "user@example.com", "password": "pass123" }
```

#### POST /auth/login
```json
{ "email": "user@example.com", "password": "pass123" }
// or
{ "phone": "+966500000000", "password": "pass123" }
// or
{ "username": "user", "password": "pass123" }
```
Response: `{ user, token, refreshToken }`

### Message Endpoints

#### GET /messages?roomId=xxx&page=1&limit=50
#### GET /messages?dmTarget=user_id
#### GET /messages/search?q=text&roomId=xxx

### WebSocket Connection
```js
const socket = io('wss://api.nextoss.com', {
  auth: { token: 'jwt_token' }
});
```

## Error Codes
- `TOKEN_EXPIRED` - Refresh token required
- 401 - Unauthorized
- 403 - Insufficient permissions
- 404 - Resource not found
- 409 - Conflict (duplicate)
- 429 - Rate limit exceeded
