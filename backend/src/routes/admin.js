const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(requireRole('admin', 'moderator'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:userId/role', requireRole('admin'), adminController.updateUserRole);
router.post('/users/:userId/ban', adminController.banUser);
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId', adminController.resolveReport);

module.exports = router;
