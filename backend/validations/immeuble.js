const Joi = require('joi');

const creerImmeuble = Joi.object({
  nom: Joi.string().trim().required(),
  adresse: Joi.string().trim().required(),
  typologie: Joi.string().valid('T1', 'T2', 'T3', 'T4', 'T5', 'T6').required(),
  annee_construction: Joi.number().integer().min(1900).max(2100).required(),
  plancher_bas: Joi.string().trim().required(),
  plancher_haut: Joi.string().trim().required(),
  surface_totale: Joi.number().positive().optional(),
  nombre_etages: Joi.number().integer().positive().optional()
});

module.exports = { creerImmeuble };
