const bcrypt = require('bcryptjs');
const db = require('../../src/database');

const seed = async () => {
  console.log('[Seed] Seeding NeDB...');

  const counts = await Promise.all([
    db.users.count({}),
    db.rooms.count({}),
    db.messages.count({}),
    db.subscriptions.count({}),
  ]);

  if (counts.some(c => c > 0)) {
    console.log('[Seed] Database already has data, skipping...');
    process.exit(0);
  }

  const hashedPass = await bcrypt.hash('test123', 12);
  const adminPass = await bcrypt.hash('admin123', 12);

  const users = await db.users.insert([
    { username: 'أحمد', email: 'ahmed@nextoss.com', password: hashedPass, role: 'admin', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed', preferences: { theme: 'gold', language: 'ar' }, privacy: {}, notifications: { push: true, sound: true, vibration: true, dm: true, group: true, voice: true }, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
    { username: 'سارة', email: 'sara@nextoss.com', password: hashedPass, role: 'moderator', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara', preferences: { theme: 'red', language: 'ar' }, privacy: {}, notifications: {}, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
    { username: 'محمد', email: 'mohamed@nextoss.com', password: hashedPass, role: 'user', status: 'idle', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed', preferences: { theme: 'gold', language: 'ar' }, privacy: {}, notifications: {}, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
    { username: 'نورة', email: 'noura@nextoss.com', password: hashedPass, role: 'user', status: 'offline', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura', preferences: { theme: 'orange', language: 'ar' }, privacy: {}, notifications: {}, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
    { username: 'خالد', email: 'khaled@nextoss.com', password: hashedPass, role: 'user', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled', preferences: { theme: 'gold', language: 'ar' }, privacy: {}, notifications: {}, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
    { username: 'Admin', email: 'admin@nextoss.com', password: adminPass, role: 'admin', status: 'online', auth: { isGuest: false, verified: true }, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', preferences: { theme: 'gold', language: 'en' }, privacy: {}, notifications: {}, stats: { messagesCount: 0, voiceMinutes: 0, joinedAt: new Date() }, balance: { coins: 0, gems: 0 }, blockedUsers: [], friends: [], devices: [], createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log(`[Seed] Created ${users.length} users`);

  const rooms = await db.rooms.insert([
    { name: 'عام', nameAr: 'عام', description: 'النقاشات العامة', descriptionAr: 'النقاشات العامة حول أي موضوع', color: '#FFC001', icon: 'fas fa-hashtag', type: 'text', isPrivate: false, owner: users[0]._id, members: users.map(u => u._id), bannedUsers: [], lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { name: 'تقنية', nameAr: 'تقنية', description: 'نقاشات تقنية وبرمجة', descriptionAr: 'نقاشات تقنية وبرمجة', color: '#3ec6ff', icon: 'fas fa-code', type: 'text', isPrivate: false, owner: users[1]._id, members: [users[0]._id, users[1]._id, users[2]._id, users[4]._id], bannedUsers: [], lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { name: 'تصميم', nameAr: 'تصميم', description: 'عالم التصميم والإبداع', descriptionAr: 'عالم التصميم والإبداع', color: '#a78bfa', icon: 'fas fa-palette', type: 'text', isPrivate: false, owner: users[2]._id, members: [users[0]._id, users[2]._id, users[3]._id], bannedUsers: [], lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { name: 'صوتي', nameAr: 'صوتي', description: 'دردشة صوتية', descriptionAr: 'دردشة صوتية مباشرة', color: '#f472b6', icon: 'fas fa-microphone', type: 'voice', isPrivate: false, owner: users[0]._id, members: users.map(u => u._id), bannedUsers: [], lastActivity: new Date(), createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log(`[Seed] Created ${rooms.length} rooms`);

  const now = new Date();
  const messages = [
    { room: rooms[0]._id, sender: users[0]._id, text: 'السلام عليكم! 👋', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3600000) },
    { room: rooms[0]._id, sender: users[1]._id, text: 'وعليكم السلام ورحمة الله', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3500000) },
    { room: rooms[0]._id, sender: users[2]._id, text: 'كيف الحال جميعاً؟', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3400000) },
    { room: rooms[0]._id, sender: users[3]._id, text: 'الحمد لله تمام، كيف أنت؟', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3300000) },
    { room: rooms[0]._id, sender: users[4]._id, text: 'فكرة رائعة هذا التطبيق!', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3200000) },
    { room: rooms[0]._id, sender: users[0]._id, text: 'شكراً لكم جميعاً 🤝', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3100000) },
    { room: rooms[1]._id, sender: users[2]._id, text: 'هل أحد مهتم بموضوع التقنية؟', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 3000000) },
    { room: rooms[1]._id, sender: users[4]._id, text: 'أنا مهتم! وش عندك؟', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2900000) },
    { room: rooms[1]._id, sender: users[2]._id, text: 'تحديث جديد في React 19', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2800000) },
    { room: rooms[1]._id, sender: users[0]._id, text: 'واو، أخيراً!', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2700000) },
    { room: rooms[2]._id, sender: users[2]._id, text: 'من يحب التصميم؟ ✨', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2600000) },
    { room: rooms[2]._id, sender: users[3]._id, text: 'أنا أحب التصميم!', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2500000) },
    { room: rooms[2]._id, sender: users[0]._id, text: 'عندكم أعمال حلوة؟', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2400000) },
    { room: rooms[2]._id, sender: users[2]._id, text: 'إن شاء الله نشارك قريباً', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2300000) },
    { room: rooms[0]._id, sender: users[2]._id, text: 'اختبار الصوت 🎤', type: 'text', reactions: [], readBy: [], createdAt: new Date(now - 2200000) },
    { room: rooms[0]._id, sender: users[1]._id, text: '', type: 'voice', duration: '0:05', reactions: [], readBy: [], createdAt: new Date(now - 2000000) },
    { room: rooms[0]._id, sender: users[4]._id, text: '', type: 'voice', duration: '0:08', reactions: [], readBy: [], createdAt: new Date(now - 1900000) },
  ];
  await db.messages.insert(messages);
  console.log(`[Seed] Created ${messages.length} messages`);

  const plans = await db.subscriptions.insert([
    { name: 'Basic', nameAr: 'أساسي', price: 0, currency: 'USD', duration: 0, durationUnit: 'month', features: { maxGroups: 1, maxVoiceUsers: 5, fileSizeLimit: 5242880, voiceQuality: 'low', noAds: false }, active: true, order: 0, createdAt: new Date() },
    { name: 'Premium', nameAr: 'مميز', price: 9.99, currency: 'USD', duration: 1, durationUnit: 'month', features: { maxGroups: 10, maxVoiceUsers: 25, fileSizeLimit: 52428800, voiceQuality: 'high', customEmoji: true, animatedAvatar: true, noAds: true, prioritySupport: false }, active: true, order: 1, createdAt: new Date() },
    { name: 'Ultimate', nameAr: 'أقصى', price: 19.99, currency: 'USD', duration: 1, durationUnit: 'month', features: { maxGroups: 50, maxVoiceUsers: 100, fileSizeLimit: 104857600, voiceQuality: 'ultra', customEmoji: true, animatedAvatar: true, noAds: true, prioritySupport: true }, active: true, order: 2, createdAt: new Date() },
  ]);
  console.log(`[Seed] Created ${plans.length} subscription plans`);

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║         Seed completed! 🎉           ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Users:     ${users.length.toString().padStart(3)}                       ║`);
  console.log(`║  Rooms:     ${rooms.length.toString().padStart(3)}                       ║`);
  console.log(`║  Messages:  ${messages.length.toString().padStart(3)}                       ║`);
  console.log(`║  Plans:     ${plans.length.toString().padStart(3)}                       ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('\n[Seed] Login credentials:');
  console.log('  Admin:  admin@nextoss.com / admin123');
  console.log('  User:   ahmed@nextoss.com / test123');

  process.exit(0);
};

seed().catch(err => { console.error('[Seed] Error:', err); process.exit(1); });
