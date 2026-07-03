const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure 32 bytes key
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  return crypto.createHash('sha256').update(secret).digest();
};

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
  if (!text) return null;
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text; // fallback if unencrypted
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return text;
  }
}

module.exports = { encrypt, decrypt };
