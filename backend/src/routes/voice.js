const router = require('express').Router();
const voiceController = require('../controllers/voiceController');
const { authenticate } = require('../middleware/auth');

router.get('/channels', authenticate, voiceController.getChannels);
router.post('/channels', authenticate, voiceController.createChannel);
router.post('/channels/:channelId/join', authenticate, voiceController.joinChannel);
router.post('/channels/:channelId/leave', authenticate, voiceController.leaveChannel);
router.post('/channels/:channelId/mute', authenticate, voiceController.toggleMute);
router.get('/turn', authenticate, voiceController.getTurnCredentials);

module.exports = router;
