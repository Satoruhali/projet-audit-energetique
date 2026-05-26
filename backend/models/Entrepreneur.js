const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const entrepreneurSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true, minlength: 8, select: false },
  telephone: { type: String, trim: true },
  entreprise: { type: String, trim: true },
  role: { type: String, enum: ['entrepreneur', 'admin'], default: 'entrepreneur' }
}, { timestamps: true });

entrepreneurSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
});

entrepreneurSchema.methods.comparerMotDePasse = async function (motDePasse) {
  return bcrypt.compare(motDePasse, this.motDePasse);
};

entrepreneurSchema.methods.genererToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = mongoose.model('Entrepreneur', entrepreneurSchema);
