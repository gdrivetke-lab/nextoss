const CryptoJS = require('crypto-js');
const config = require('../config');

const encrypt = (text, key = config.encryption.key) => {
  try {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(),
    };
  } catch (err) {
    throw new Error('Encryption failed');
  }
};

const decrypt = (encryptedText, iv, key = config.encryption.key) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    throw new Error('Decryption failed');
  }
};

const generateKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

module.exports = { encrypt, decrypt, generateKey, hashPassword };
