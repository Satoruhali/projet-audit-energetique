const Joi = require('joi');

const creerCampagne = Joi.object({
  immeuble_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  nom: Joi.string().trim().required(),
  statut: Joi.string().valid('brouillon', 'en_cours', 'termine').optional(),
  jours_disponibles: Joi.array().items(Joi.date().iso()).optional()
});

module.exports = { creerCampagne };
