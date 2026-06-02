const Joi = require('joi');

const creneauSchema = Joi.object({
  date_visite: Joi.date().iso().required().messages({
    'date.format': 'La date doit être au format ISO (YYYY-MM-DD)',
    'any.required': 'La date de visite est requise'
  }),
  heure_debut: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'L\'heure de début doit être au format HH:MM',
    'any.required': 'L\'heure de début est requise'
  }),
  heure_fin: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'L\'heure de fin doit être au format HH:MM',
    'any.required': 'L\'heure de fin est requise'
  })
});

module.exports = { creneauSchema };
