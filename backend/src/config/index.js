require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,

  jwt: {
    secret: process.env.JWT_SECRET || 'nextoss_dev_jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'nextoss_dev_refresh_secret',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || 'nextoss_dev_encryption_key_32bytes!',
  },

  upload: {
    dir: require('path').join(__dirname, '../../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  },

  webrtc: {
    turnUrl: process.env.TURN_SERVER_URL || 'turn:localhost:3478',
    turnUsername: 'nextoss',
    turnCredential: 'nextoss_pass',
  },

  rateLimit: {
    windowMs: 60000,
    max: 100,
  },
};

module.exports = config;
