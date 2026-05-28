const Joi = require('joi');

const creerCampagne = Joi.object({
  immeuble_id: Joi.string().required(),
  nom: Joi.string().trim().required(),
  date_debut: Joi.date().required(),
  date_fin: Joi.date().min(Joi.ref('date_debut')).required(),
  statut: Joi.string().valid('brouillon', 'en_cours', 'termine').optional()
});

module.exports = { creerCampagne };
