const { Op } = require('sequelize');
const Campagne = require('../models/Campagne');
const Logement = require('../models/Logement');
const Immeuble = require('../models/Immeuble');
const Typologie = require('../models/Typologie');
const TypePlancher = require('../models/TypePlancher');
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

    const typoCodes = [...new Set(value.map(l => l.typologie))];
    const pbNoms = [...new Set(value.map(l => l.plancher_bas))];
    const phNoms = [...new Set(value.map(l => l.plancher_haut))];

    const [typologies, planchersBas, planchersHaut] = await Promise.all([
      Typologie.findAll({ where: { code: typoCodes } }),
      TypePlancher.findAll({ where: { nom: pbNoms, categorie: 'bas' } }),
      TypePlancher.findAll({ where: { nom: phNoms, categorie: 'haut' } })
    ]);

    const typoMap = Object.fromEntries(typologies.map(t => [t.code, t.id]));
    const pbMap = Object.fromEntries(planchersBas.map(p => [p.nom, p.id]));
    const phMap = Object.fromEntries(planchersHaut.map(p => [p.nom, p.id]));

    const logements = value.map(l => ({
      batiment_id: campagne.batiment_id,
      numero: l.numero,
      etage: l.etage,
      surface: l.surface,
      loyer_estime: l.loyer_estime,
      id_typologie: typoMap[l.typologie],
      id_type_plancher_bas: pbMap[l.plancher_bas],
      id_type_plancher_haut: phMap[l.plancher_haut],
      position: l.position,
      statut: 'libre'
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

    const payload = {};
    if (value.numero !== undefined) payload.numero = value.numero;
    if (value.etage !== undefined) payload.etage = value.etage;
    if (value.surface !== undefined) payload.surface = value.surface;
    if (value.loyer_estime !== undefined) payload.loyer_estime = value.loyer_estime;
    if (value.position !== undefined) payload.position = value.position;
    if (value.statut !== undefined) payload.statut = value.statut;

    if (value.typologie !== undefined) {
      const typo = await Typologie.findOne({ where: { code: value.typologie } });
      payload.id_typologie = typo ? typo.id : null;
    }
    if (value.plancher_bas !== undefined) {
      const pb = await TypePlancher.findOne({ where: { nom: value.plancher_bas, categorie: 'bas' } });
      payload.id_type_plancher_bas = pb ? pb.id : null;
    }
    if (value.plancher_haut !== undefined) {
      const ph = await TypePlancher.findOne({ where: { nom: value.plancher_haut, categorie: 'haut' } });
      payload.id_type_plancher_haut = ph ? ph.id : null;
    }

    const [affected] = await Logement.update(
      payload,
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
