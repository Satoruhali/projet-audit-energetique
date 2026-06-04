const mongoose = require('mongoose');

const emailEnvoyeSchema = new mongoose.Schema({
  campagne_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campagne',
    required: true
  },
  locataire_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Locataire',
    required: true
  },
  destinataire: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  sujet: {
    type: String,
    required: true
  },
  corps: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['visite_programmee', 'pas_de_visite', 'relance'],
    required: true
  },
  statut: {
    type: String,
    enum: ['envoye', 'echec'],
    default: 'envoye'
  },
  date_envoi: {
    type: Date,
    default: Date.now
  },
  erreur: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailEnvoye', emailEnvoyeSchema);
