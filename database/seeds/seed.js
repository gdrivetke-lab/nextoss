require('dotenv').config({ path: require('path').resolve(__dirname, '../../backend/.env') });
const mongoose = require('mongoose');
const User = require('../../backend/src/models/User');
const Room = require('../../backend/src/models/Room');
const Message = require('../../backend/src/models/Message');
const { Subscription } = require('../../backend/src/models/Subscription');
const config = require('../../backend/src/config');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('[Seed] Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Message.deleteMany({}),
      Subscription.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    const users = await User.create([
      { username: 'أحمد', email: 'ahmed@nextoss.com', password: 'test123', role: 'admin', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed', preferences: { theme: 'gold', language: 'ar' } },
      { username: 'سارة', email: 'sara@nextoss.com', password: 'test123', role: 'moderator', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara', preferences: { theme: 'red', language: 'ar' } },
      { username: 'محمد', email: 'mohamed@nextoss.com', password: 'test123', role: 'user', status: 'idle', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed', preferences: { theme: 'gold', language: 'ar' } },
      { username: 'نورة', email: 'noura@nextoss.com', password: 'test123', role: 'user', status: 'offline', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura', preferences: { theme: 'orange', language: 'ar' } },
      { username: 'خالد', email: 'khaled@nextoss.com', password: 'test123', role: 'user', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled', preferences: { theme: 'gold', language: 'ar' } },
      { username: 'Admin', email: 'admin@nextoss.com', password: 'admin123', role: 'admin', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', preferences: { theme: 'gold', language: 'en' } },
    ]);
    console.log(`[Seed] Created ${users.length} users`);

    const rooms = await Room.create([
      { name: 'عام', nameAr: 'عام', description: 'النقاشات العامة', descriptionAr: 'النقاشات العامة حول أي موضوع', color: '#FFC001', owner: users[0]._id, members: users.map(u => u._id) },
      { name: 'تقنية', nameAr: 'تقنية', description: 'نقاشات تقنية وبرمجة', descriptionAr: 'نقاشات تقنية وبرمجة', color: '#3ec6ff', owner: users[1]._id, members: [users[0]._id, users[1]._id, users[2]._id, users[4]._id] },
      { name: 'تصميم', nameAr: 'تصميم', description: 'عالم التصميم والإبداع', descriptionAr: 'عالم التصميم والإبداع', color: '#a78bfa', owner: users[2]._id, members: [users[0]._id, users[2]._id, users[3]._id] },
      { name: 'صوتي', nameAr: 'صوتي', description: 'دردشة صوتية', descriptionAr: 'دردشة صوتية مباشرة', color: '#f472b6', type: 'voice', owner: users[0]._id, members: users.map(u => u._id) },
    ]);
    console.log(`[Seed] Created ${rooms.length} rooms`);

    const now = new Date();
    const times = Array.from({ length: 20 }, (_, i) => {
      const d = new Date(now);
      d.setMinutes(d.getMinutes() - (20 - i) * 3);
      return d;
    });

    const initialMessages = [
      { text: 'السلام عليكم! 👋', userId: 0, roomIdx: 0 },
      { text: 'وعليكم السلام ورحمة الله', userId: 1, roomIdx: 0 },
      { text: 'كيف الحال جميعاً؟', userId: 2, roomIdx: 0 },
      { text: 'الحمد لله تمام، كيف أنت؟', userId: 3, roomIdx: 0 },
      { text: 'فكرة رائعة هذا التطبيق!', userId: 4, roomIdx: 0 },
      { text: 'شكراً لكم جميعاً 🤝', userId: 0, roomIdx: 0 },
      { text: 'هل أحد مهتم بموضوع التقنية؟', userId: 2, roomIdx: 1 },
      { text: 'أنا مهتم! وش عندك؟', userId: 4, roomIdx: 1 },
      { text: 'تحديث جديد في React 19', userId: 2, roomIdx: 1 },
      { text: 'واو، أخيراً!', userId: 0, roomIdx: 1 },
      { text: 'من يحب التصميم؟ ✨', userId: 2, roomIdx: 2 },
      { text: 'أنا أحب التصميم!', userId: 3, roomIdx: 2 },
      { text: 'عندكم أعمال حلوة؟', userId: 0, roomIdx: 2 },
      { text: 'إن شاء الله نشارك قريباً', userId: 2, roomIdx: 2 },
      { text: 'اختبار الصوت 🎤', userId: 0, roomIdx: 0 },
    ];

    const messages = [];
    for (const m of initialMessages) {
      messages.push({
        room: rooms[m.roomIdx]._id,
        sender: users[m.userId]._id,
        text: m.text,
        type: 'text',
        createdAt: times[messages.length] || now,
      });
    }

    const voiceMsgs = [
      { roomIdx: 0, userId: 1, text: '', type: 'voice', duration: '0:05' },
      { roomIdx: 0, userId: 4, text: '', type: 'voice', duration: '0:08' },
    ];
    for (const m of voiceMsgs) {
      messages.push({
        room: rooms[m.roomIdx]._id,
        sender: users[m.userId]._id,
        text: m.text,
        type: m.type,
        duration: m.duration,
        createdAt: new Date(now.getTime() - 300000),
      });
    }

    await Message.insertMany(messages);
    console.log(`[Seed] Created ${messages.length} messages`);

    const plans = await Subscription.create([
      {
        name: 'Basic', nameAr: 'أساسي', price: 0, currency: 'USD',
        duration: 0, durationUnit: 'month',
        features: { maxGroups: 1, maxVoiceUsers: 5, fileSizeLimit: 5242880, voiceQuality: 'low', noAds: false },
        order: 0,
      },
      {
        name: 'Premium', nameAr: 'مميز', price: 9.99, currency: 'USD',
        duration: 1, durationUnit: 'month',
        features: { maxGroups: 10, maxVoiceUsers: 25, fileSizeLimit: 52428800, voiceQuality: 'high', customEmoji: true, animatedAvatar: true, noAds: true, prioritySupport: false },
        order: 1,
      },
      {
        name: 'Ultimate', nameAr: 'أقصى', price: 19.99, currency: 'USD',
        duration: 1, durationUnit: 'month',
        features: { maxGroups: 50, maxVoiceUsers: 100, fileSizeLimit: 104857600, voiceQuality: 'ultra', customEmoji: true, animatedAvatar: true, noAds: true, prioritySupport: true },
        order: 2,
      },
    ]);
    console.log(`[Seed] Created ${plans.length} subscription plans`);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║         Seed completed! 🎉           ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║  Users:     ' + users.length.toString().padStart(3) + '                       ║');
    console.log('║  Rooms:     ' + rooms.length.toString().padStart(3) + '                       ║');
    console.log('║  Messages:  ' + messages.length.toString().padStart(3) + '                       ║');
    console.log('║  Plans:     ' + plans.length.toString().padStart(3) + '                       ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('\n[Seed] Login credentials:');
    console.log('  Admin:  admin@nextoss.com / admin123');
    console.log('  User:   ahmed@nextoss.com / test123');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
};

seed();
