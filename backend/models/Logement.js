const mongoose = require('mongoose');

const logementSchema = new mongoose.Schema({
  campagne_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campagne',
    required: true
  },
  numero: { type: String, required: true, trim: true },
  etage: { type: Number, required: true },
  surface: { type: Number, required: true },
  loyer_estime: { type: Number },
  statut: {
    type: String,
    enum: ['libre', 'occupe', 'reserve'],
    default: 'libre'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

logementSchema.virtual('locataire', {
  ref: 'Locataire',
  localField: '_id',
  foreignField: 'logement_id',
  justOne: true
});

logementSchema.set('toJSON', { virtuals: true });
logementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Logement', logementSchema);
