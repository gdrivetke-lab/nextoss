const slugify = (text) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const generateCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
};

const paginate = ({ page = 1, limit = 50, maxLimit = 100 }) => {
  page = Math.max(1, parseInt(page));
  limit = Math.min(maxLimit, Math.max(1, parseInt(limit)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

module.exports = { slugify, generateCode, paginate, formatDuration };
