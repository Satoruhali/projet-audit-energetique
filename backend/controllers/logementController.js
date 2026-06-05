const { Op } = require('sequelize');
const Campagne = require('../models/Campagne');
const Logement = require('../models/Logement');
const Immeuble = require('../models/Immeuble');
const { creerLogements, updateLogement } = require('../validations/logement');

exports.storeBatch = async (req, res) => {
  try {
    const { error, value } = creerLogements.validate(req.body);
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
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = value.map(l => ({
      ...l,
      batiment_id: campagne.batiment_id
    }));

    const created = await Logement.bulkCreate(logements);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création des logements' });
  }
};

exports.update = async (req, res) => {
  try {
    const { error, value } = updateLogement.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.campagne_id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const [affected] = await Logement.update(
      value,
      { where: { id: req.params.logement_id, batiment_id: campagne.batiment_id } }
    );

    if (affected === 0) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    const logement = await Logement.findByPk(req.params.logement_id);
    res.json(logement);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du logement' });
  }
};

exports.delete = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.campagne_id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const [affected] = await Logement.update(
      { deleted_at: new Date() },
      { where: { id: req.params.logement_id, batiment_id: campagne.batiment_id } }
    );

    if (affected === 0) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    res.json({ message: 'Logement supprimé (soft delete)' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du logement' });
  }
};
