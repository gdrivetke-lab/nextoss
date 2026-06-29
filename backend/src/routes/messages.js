const router = require('express').Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { upload, uploadErrorHandler } = require('../middleware/upload');
const { messageLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticate, messageController.getMessages);
router.get('/search', authenticate, messageController.searchMessages);
router.post('/upload', authenticate, messageLimiter, upload.single('file'), uploadErrorHandler, messageController.uploadFile);

module.exports = router;
