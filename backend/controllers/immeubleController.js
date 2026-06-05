const Immeuble = require('../models/Immeuble');
const { creerImmeuble } = require('../validations/immeuble');

exports.list = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    res.json(immeubles);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des immeubles' });
  }
};

exports.create = async (req, res) => {
  try {
    const { error, value } = creerImmeuble.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeuble = await Immeuble.create({
      ...value,
      id_entrepreneur: req.entrepreneur.id
    });

    res.status(201).json(immeuble);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'immeuble' });
  }
};
