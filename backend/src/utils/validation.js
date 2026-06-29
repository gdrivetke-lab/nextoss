const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\+?[\d\s\-()]{7,20}$/;
  return re.test(phone);
};

const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_\u0600-\u06FF]+$/.test(username);
};

const sanitizeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password too long';
  return null;
};

module.exports = { validateEmail, validatePhone, validateUsername, sanitizeHtml, validatePassword };
