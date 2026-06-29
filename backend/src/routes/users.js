const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/search', authenticate, userController.searchUsers);
router.get('/:userId', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/block/:userId', authenticate, userController.blockUser);
router.post('/unblock/:userId', authenticate, userController.unblockUser);
router.get('/:userId/status', authenticate, userController.getStatus);
router.put('/status', authenticate, userController.updateStatus);

module.exports = router;
