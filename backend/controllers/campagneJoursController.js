const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const { mettreAJoursDisponibles } = require('../validations/campagneJours');

exports.remplacerJours = async (req, res) => {
  try {
    const { error, value } = mettreAJoursDisponibles.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const debut = new Date(campagne.date_debut);
    const fin = new Date(campagne.date_fin);
    const jours = value.jours;
    const vus = new Set();

    for (const jour of jours) {
      const d = new Date(jour);

      if (d < debut || d > fin) {
        return res.status(400).json({
          message: `Le jour ${jour} est hors de l'intervalle [${campagne.date_debut.toISOString().split('T')[0]}, ${campagne.date_fin.toISOString().split('T')[0]}]`
        });
      }

      const iso = d.toISOString().split('T')[0];
      if (vus.has(iso)) {
        return res.status(400).json({
          message: `Le jour ${jour} est présent en doublon dans la liste`
        });
      }
      vus.add(iso);
    }

    campagne.jours_disponibles = jours.map(j => new Date(j));
    await campagne.save();

    res.json({ message: 'Jours disponibles mis à jour avec succès', jours: campagne.jours_disponibles });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des jours disponibles' });
  }
};

exports.recupererJours = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    res.json({ jours: campagne.jours_disponibles || [] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des jours disponibles' });
  }
};
