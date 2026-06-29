const router = require('express').Router();
const subController = require('../controllers/subscriptionController');
const { authenticate, requireRole } = require('../middleware/auth');
const express = require('express');

router.get('/plans', subController.getPlans);
router.get('/my', authenticate, subController.getMySubscription);
router.post('/checkout', authenticate, subController.createCheckoutSession);
router.post('/cancel', authenticate, subController.cancelSubscription);

router.post('/webhook', express.raw({ type: 'application/json' }), subController.handleWebhook);

router.post('/plans', authenticate, requireRole('admin'), subController.createPlan);

module.exports = router;
