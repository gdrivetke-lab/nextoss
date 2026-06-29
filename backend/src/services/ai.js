const config = require('../config');

let openai = null;
try {
  if (config.ai.apiKey) {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: config.ai.apiKey });
  }
} catch (err) {
  console.warn('[AI] OpenAI not available:', err.message);
}

const generateReply = async (message, context = []) => {
  if (!openai) {
    return getFallbackReply(message);
  }
  try {
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant in an Arabic chat app named NextosS. Respond in Arabic.' },
        ...context.slice(-10),
        { role: 'user', content: message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || getFallbackReply(message);
  } catch (err) {
    console.error('[AI] Error:', err.message);
    return getFallbackReply(message);
  }
};

const detectSpam = async (text) => {
  if (!openai) return { isSpam: false, score: 0 };
  try {
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: 'Analyze this message for spam. Respond with JSON: {"isSpam": bool, "score": 0-1, "reason": "string"}',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 50,
      temperature: 0,
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{"isSpam":false,"score":0}');
  } catch {
    return { isSpam: false, score: 0 };
  }
};

const translate = async (text, targetLang = 'ar') => {
  if (!openai) return text;
  try {
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        { role: 'system', content: `Translate to ${targetLang}. Return only the translation.` },
        { role: 'user', content: text },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content || text;
  } catch {
    return text;
  }
};

const getFallbackReply = (message) => {
  const greetings = ['السلام', 'مرحبا', 'هلا', 'hi', 'hello', 'hey'];
  const lower = message.toLowerCase();

  if (greetings.some(g => lower.includes(g))) {
    return 'وعليكم السلام! كيف أستطيع مساعدتك؟ 🙏';
  }
  if (lower.includes('كيف الحال') || lower.includes('شلون')) {
    return 'الحمد لله، بخير! كيف أنت؟ 😊';
  }
  if (lower.includes('شكرا') || lower.includes('thanks')) {
    return 'العفو! دائمًا موجود 🤝';
  }
  if (lower.includes('باي') || lower.includes('مع السلامة')) {
    return 'مع السلامة! كانت سعادة بالحديث معك 👋';
  }

  const replies = [
    'تمام! 😊',
    'فكرة رائعة! 👍',
    'ممتاز! استمر 💪',
    'نعم، صحيح! ✓',
    'أتفق معك تمامًا 🤝',
    'جيد جدًا! 🌟',
    'ما شاء الله! ✨',
    'إن شاء الله 🙏',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
};

const moderateContent = async (text) => {
  if (!openai) return { flagged: false, categories: [] };
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Check if this content violates guidelines (hate, harassment, spam, NSFW). Respond JSON: {"flagged":bool,"categories":[],"reason":"string"}',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 50,
      temperature: 0,
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{"flagged":false,"categories":[]}');
  } catch {
    return { flagged: false, categories: [] };
  }
};

module.exports = { generateReply, detectSpam, translate, moderateContent };
