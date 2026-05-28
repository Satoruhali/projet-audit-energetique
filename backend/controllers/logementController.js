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

    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = value.map(l => ({
      ...l,
      campagne_id: campagne._id
    }));

    const created = await Logement.insertMany(logements);
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

    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.campagne_id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logement = await Logement.findOneAndUpdate(
      { _id: req.params.logement_id, campagne_id: req.params.campagne_id, deletedAt: null },
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!logement) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    res.json(logement);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du logement' });
  }
};

exports.delete = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.campagne_id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logement = await Logement.findOneAndUpdate(
      { _id: req.params.logement_id, campagne_id: req.params.campagne_id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!logement) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    res.json({ message: 'Logement supprimé (soft delete)' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du logement' });
  }
};
