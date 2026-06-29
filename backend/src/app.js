require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const config = require('./config');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { setupSocket } = require('./services/socket');

const app = express();
const server = http.createServer(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(defaultLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const fs = require('fs');
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.static(path.join(__dirname, '../../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', name: 'NextosS API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: config.env === 'production' ? 'Internal server error' : err.message,
  });
});

setupSocket(server);

server.listen(config.port, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║      NextosS API Server v1.0.0       ║`);
  console.log(`║══════════════════════════════════════║`);
  console.log(`║  Port: ${config.port}                       ║`);
  console.log(`║  Env:  ${config.env.padEnd(15)}              ║`);
  console.log(`║  URL:  http://localhost:${config.port}         ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});

module.exports = { app, server };
