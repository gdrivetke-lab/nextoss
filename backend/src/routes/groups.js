const router = require('express').Router();
const groupController = require('../controllers/groupController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, groupController.getGroups);
router.get('/:groupId', authenticate, groupController.getGroup);
router.post('/', authenticate, groupController.createGroup);
router.post('/:groupId/join', authenticate, groupController.joinGroup);
router.post('/:groupId/leave', authenticate, groupController.leaveGroup);
router.post('/:groupId/channels', authenticate, groupController.addChannel);
router.post('/:groupId/toggle-admin', authenticate, groupController.toggleAdmin);
router.delete('/:groupId', authenticate, groupController.deleteGroup);

module.exports = router;
