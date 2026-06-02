const Joi = require('joi');

const logementItem = Joi.object({
  numero: Joi.string().trim().required(),
  etage: Joi.number().integer().required(),
  surface: Joi.number().positive().required(),
  loyer_estime: Joi.number().positive().optional(),
  typologie: Joi.string().valid('T1', 'T2', 'T3', 'T4', 'T5', 'T6').required(),
  plancher_bas: Joi.string().trim().required(),
  plancher_haut: Joi.string().trim().required()
});

const creerLogements = Joi.array().items(logementItem).min(1).required();

const updateLogement = Joi.object({
  numero: Joi.string().trim().optional(),
  etage: Joi.number().integer().optional(),
  surface: Joi.number().positive().optional(),
  loyer_estime: Joi.number().positive().optional(),
  typologie: Joi.string().valid('T1', 'T2', 'T3', 'T4', 'T5', 'T6').optional(),
  plancher_bas: Joi.string().trim().optional(),
  plancher_haut: Joi.string().trim().optional(),
  statut: Joi.string().valid('libre', 'occupe', 'reserve').optional()
}).min(1);

module.exports = { creerLogements, updateLogement };
