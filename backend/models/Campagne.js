const mongoose = require('mongoose');

const campagneSchema = new mongoose.Schema({
  immeuble_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Immeuble',
    required: true
  },
  nom: { type: String, required: true, trim: true },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  statut: {
    type: String,
    enum: ['brouillon', 'en_cours', 'termine'],
    default: 'brouillon'
  },
  deletedAt: { type: Date, default: null },
  jours_disponibles: [{ type: Date }]
}, { timestamps: true });

campagneSchema.virtual('logements', {
  ref: 'Logement',
  localField: '_id',
  foreignField: 'campagne_id'
});

campagneSchema.virtual('locataires', {
  ref: 'Locataire',
  localField: '_id',
  foreignField: 'campagne_id'
});

campagneSchema.set('toJSON', { virtuals: true });
campagneSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Campagne', campagneSchema);
