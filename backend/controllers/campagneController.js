const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const { creerCampagne } = require('../validations/campagne');

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
