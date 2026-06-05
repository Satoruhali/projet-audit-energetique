const { Op } = require('sequelize');
const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const JoursDisponible = require('../models/JoursDisponible');
const { mettreAJoursDisponibles } = require('../validations/campagneJours');

exports.remplacerJours = async (req, res) => {
  try {
    const { error, value } = mettreAJoursDisponibles.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const jours = value.jours;
    const vus = new Set();

    for (const jour of jours) {
      const d = new Date(jour);
      const iso = d.toISOString().split('T')[0];
      if (vus.has(iso)) {
        return res.status(400).json({
          message: `Le jour ${jour} est présent en doublon dans la liste`
        });
      }
      vus.add(iso);
    }

    await JoursDisponible.destroy({
      where: { id_entrepreneur: req.entrepreneur.id }
    });

    const joursCrees = [];
    for (const jour of jours) {
      const jd = await JoursDisponible.create({
        id_entrepreneur: req.entrepreneur.id,
        date: new Date(jour),
        est_disponible: true
      });
      joursCrees.push(jd);
    }

    res.json({
      message: 'Jours disponibles mis à jour avec succès',
      jours: joursCrees.map(j => j.date)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des jours disponibles' });
  }
};

exports.recupererJours = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const jours = await JoursDisponible.findAll({
      where: {
        id_entrepreneur: req.entrepreneur.id,
        est_disponible: true
      },
      order: [['date', 'ASC']]
    });

    res.json({ jours: jours.map(j => j.date) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des jours disponibles' });
  }
};
