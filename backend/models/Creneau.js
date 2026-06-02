const mongoose = require('mongoose');

const creneauSchema = new mongoose.Schema({
  locataire_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Locataire',
    required: true
  },
  campagne_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campagne',
    required: true
  },
  date_visite: { type: Date, required: true },
  heure_debut: { type: String, required: true },
  heure_fin: { type: String, required: true },
  statut: {
    type: String,
    enum: ['reserve', 'confirme', 'annule'],
    default: 'reserve'
  }
}, { timestamps: true });

creneauSchema.index({ campagne_id: 1, date_visite: 1, heure_debut: 1 }, { unique: true });
creneauSchema.index({ locataire_id: 1, campagne_id: 1 }, { unique: true });

module.exports = mongoose.model('Creneau', creneauSchema);
