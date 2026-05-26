const mongoose = require('mongoose');

const immeubleSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  adresse: { type: String, required: true, trim: true },
  typologie: {
    type: String,
    required: true,
    enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
  },
  annee_construction: { type: Number, required: true },
  plancher_bas: { type: String, required: true, trim: true },
  plancher_haut: { type: String, required: true, trim: true },
  surface_totale: { type: Number },
  nombre_etages: { type: Number },
  id_entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Immeuble', immeubleSchema);
