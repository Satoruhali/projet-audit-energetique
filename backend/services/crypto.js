const crypto = require('crypto');

function getKey() {
  const cle = process.env.SMTP_ENCRYPTION_KEY;
  if (!cle) {
    throw new Error('SMTP_ENCRYPTION_KEY manquante — chiffrement des mots de passe SMTP impossible');
  }
  const buffer = Buffer.from(cle, 'hex');
  if (buffer.length !== 32) {
    throw new Error('SMTP_ENCRYPTION_KEY doit être une clé hexadécimale de 32 octets (64 caractères)');
  }
  return buffer;
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const data = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: data.toString('hex')
  };
}

function decrypt(payload) {
  const { iv, tag, data } = payload;
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
