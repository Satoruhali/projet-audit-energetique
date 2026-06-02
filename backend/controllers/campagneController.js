const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const { creerCampagne } = require('../validations/campagne');
const { lancerSelection } = require('../services/setCoverService');

exports.store = async (req, res) => {
  try {
    const { error, value } = creerCampagne.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeuble = await Immeuble.findOne({
      _id: value.immeuble_id,
      id_entrepreneur: req.entrepreneur.id
    });
    if (!immeuble) {
      return res.status(404).json({ message: 'Immeuble introuvable ou non autorisé' });
    }

    const campagne = await Campagne.create(value);
    res.status(201).json(campagne);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
  }
};

exports.index = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagnes = await Campagne.find({
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    res.json(campagnes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
  }
};

exports.show = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    }).populate(['logements', 'locataires']);

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    res.json(campagne);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
  }
};

exports.lancerSelection = async (req, res) => {
  try {
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

    if (!campagne.jours_disponibles || campagne.jours_disponibles.length === 0) {
      return res.status(400).json({ message: 'La campagne doit avoir des jours_disponibles définis avant de lancer la sélection' });
    }

    const logements = await Logement.find({
      campagne_id: campagne._id,
      deletedAt: null
    });

    if (logements.length === 0) {
      return res.status(400).json({ message: 'Aucun logement trouvé dans cette campagne' });
    }

    await Logement.updateMany(
      { campagne_id: campagne._id, deletedAt: null },
      { $set: { selectionne_visite: false } }
    );

    const resultat = lancerSelection(logements);

    await Logement.updateMany(
      { _id: { $in: resultat.selectionnes }, deletedAt: null },
      { $set: { selectionne_visite: true } }
    );

    const selectionnesIds = resultat.selectionnes;

    res.json({
      message: `Sélection terminée : ${selectionnesIds.length} logements sélectionnés`,
      nbSelectionnes: selectionnesIds.length,
      selectionnes: selectionnesIds,
      couverture: resultat.couverture,
      seuil: resultat.seuil,
      couvertureComplete: resultat.success,
      criteresManquants: resultat.criteresManquants
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du lancement de la sélection' });
  }
};
