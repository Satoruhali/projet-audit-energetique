const { Op } = require('sequelize');
const Campagne = require('../models/Campagne');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const Immeuble = require('../models/Immeuble');
const crypto = require('crypto');

exports.storeBatch = async (req, res) => {
  try {
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

    const locataireData = req.body.map(l => ({
      nom: l.nom,
      email: l.email ? l.email.toLowerCase().trim() : undefined,
      telephone: l.telephone || '',
      token_acces: crypto.randomBytes(32).toString('hex')
    }));

    if (locataireData.length === 0) {
      return res.status(400).json({ message: 'Aucun locataire fourni' });
    }

    const logementIds = req.body.map(l => l.logement_id);
    const logements = await Logement.findAll({
      where: { id: { [Op.in]: logementIds }, batiment_id: campagne.batiment_id }
    });

    if (logements.length !== locataireData.length) {
      return res.status(400).json({ message: 'Certains logements sont introuvables ou n\'appartiennent pas à cette campagne' });
    }

    const created = await Locataire.bulkCreate(locataireData);

    for (let i = 0; i < created.length; i++) {
      await Logement.update(
        { locataire_id: created[i].id },
        { where: { id: logementIds[i] } }
      );
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('Erreur storeBatch locataires:', err);
    res.status(500).json({ message: 'Erreur lors de la création des locataires' });
  }
};
