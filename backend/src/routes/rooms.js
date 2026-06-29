const router = require('express').Router();
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, roomController.getRooms);
router.get('/:roomId', authenticate, roomController.getRoom);
router.post('/', authenticate, roomController.createRoom);
router.post('/:roomId/join', authenticate, roomController.joinRoom);
router.post('/:roomId/leave', authenticate, roomController.leaveRoom);
router.delete('/:roomId', authenticate, roomController.deleteRoom);

module.exports = router;
