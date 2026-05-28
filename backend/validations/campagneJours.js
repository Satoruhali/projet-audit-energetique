const Joi = require('joi');

const mettreAJoursDisponibles = Joi.object({
  jours: Joi.array()
    .items(Joi.date().iso())
    .min(1)
    .required()
    .messages({
      'array.min': 'Le tableau jours doit contenir au moins un jour',
      'any.required': 'Le champ jours est requis'
    })
});

module.exports = { mettreAJoursDisponibles };
