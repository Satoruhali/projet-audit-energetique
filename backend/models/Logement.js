const mongoose = require('mongoose');

const TYPOLOGIES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

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
  typologie: {
    type: String,
    enum: TYPOLOGIES,
    required: true
  },
  plancher_bas: { type: String, required: true, trim: true },
  plancher_haut: { type: String, required: true, trim: true },
  statut: {
    type: String,
    enum: ['libre', 'occupe', 'reserve'],
    default: 'libre'
  },
  selectionne_visite: { type: Boolean, default: false },
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
