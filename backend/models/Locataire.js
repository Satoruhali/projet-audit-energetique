const mongoose = require('mongoose');

const locataireSchema = new mongoose.Schema({
  campagne_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campagne',
    required: true
  },
  logement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Logement',
    required: true
  },
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  telephone: { type: String, trim: true },
  date_entree: { type: Date },
  token: { type: String, unique: true, sparse: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Locataire', locataireSchema);
