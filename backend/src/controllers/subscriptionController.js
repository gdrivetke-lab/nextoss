const { Subscription, UserSubscription } = require('../models/Subscription');
const User = require('../models/User');
const config = require('../config');

let stripe = null;
try {
  if (config.stripe.secretKey) {
    stripe = require('stripe')(config.stripe.secretKey);
  }
} catch (e) {}

const getPlans = async (req, res) => {
  try {
    const plans = await Subscription.find({ active: true }).sort({ order: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const plan = new Subscription(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ user: req.user._id, active: true })
      .populate('plan')
      .sort({ endDate: -1 });
    res.json(sub || { active: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) return res.status(400).json({ message: 'Payments not configured' });
    const { planId } = req.body;
    const plan = await Subscription.findById(planId);
    if (!plan || !plan.stripePriceId) return res.status(404).json({ message: 'Plan not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${req.headers.origin}/settings?subscription=success`,
      cancel_url: `${req.headers.origin}/settings?subscription=cancel`,
      metadata: { userId: req.user._id.toString(), planId: plan._id.toString() },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleWebhook = async (req, res) => {
  if (!stripe) return res.status(400).json({ message: 'Payments not configured' });
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planId } = session.metadata;
        const plan = await Subscription.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const endDate = new Date();
        if (plan.durationUnit === 'day') endDate.setDate(endDate.getDate() + plan.duration);
        else if (plan.durationUnit === 'month') endDate.setMonth(endDate.getMonth() + plan.duration);
        else if (plan.durationUnit === 'year') endDate.setFullYear(endDate.getFullYear() + plan.duration);

        await UserSubscription.updateMany(
          { user: userId, active: true },
          { active: false }
        );

        const userSub = new UserSubscription({
          user: userId, plan: planId,
          endDate, paymentMethod: 'stripe',
          active: true,
        });
        await userSub.save();

        await User.findByIdAndUpdate(userId, { 'balance.subscription': userSub._id });
        break;
      }

      case 'invoice.payment_failed': {
        const subId = event.data.object.subscription;
        await UserSubscription.findOneAndUpdate(
          { 'stripeSubscriptionId': subId },
          { autoRenew: false }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    await UserSubscription.updateMany(
      { user: req.user._id, active: true },
      { active: false, autoRenew: false }
    );
    await User.findByIdAndUpdate(req.user._id, { 'balance.subscription': null });
    res.json({ message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlans, createPlan, getMySubscription, createCheckoutSession, handleWebhook, cancelSubscription };
