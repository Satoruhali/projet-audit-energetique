const Typologie = require('../models/Typologie');
const TypePlancher = require('../models/TypePlancher');

const POSITIONS = ['bas', 'intermediaire', 'haut'];

exports.getTypologies = async (_req, res) => {
  try {
    const types = await Typologie.findAll({ attributes: ['code'] });
    const codes = types.map(t => t.code);
    res.json(codes.length > 0 ? codes : ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
  } catch {
    res.json(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
  }
};

exports.getPlancherBas = async (_req, res) => {
  try {
    const types = await TypePlancher.findAll({
      where: { categorie: 'bas' },
      attributes: ['nom', 'description']
    });
    const items = types.map(t => ({ id: t.nom, label: t.description || t.nom }));
    res.json(items.length > 0 ? items : [
      { id: 'dalle-béton', label: 'Dalle béton' },
      { id: 'terre-plein', label: 'Sur terre-plein' },
      { id: 'vide-sanitaire', label: 'Sur vide sanitaire' },
      { id: 'sous-sol', label: 'Sur sous-sol' }
    ]);
  } catch {
    res.json([
      { id: 'dalle-béton', label: 'Dalle béton' },
      { id: 'terre-plein', label: 'Sur terre-plein' },
      { id: 'vide-sanitaire', label: 'Sur vide sanitaire' },
      { id: 'sous-sol', label: 'Sur sous-sol' }
    ]);
  }
};

exports.getPlancherHaut = async (_req, res) => {
  try {
    const types = await TypePlancher.findAll({
      where: { categorie: 'haut' },
      attributes: ['nom', 'description']
    });
    const items = types.map(t => ({ id: t.nom, label: t.description || t.nom }));
    res.json(items.length > 0 ? items : [
      { id: 'combles-perdus', label: 'Combles non aménagés' },
      { id: 'toiture-terrasse', label: 'Toiture terrasse' },
      { id: 'rampants', label: 'Rampants' }
    ]);
  } catch {
    res.json([
      { id: 'combles-perdus', label: 'Combles non aménagés' },
      { id: 'toiture-terrasse', label: 'Toiture terrasse' },
      { id: 'rampants', label: 'Rampants' }
    ]);
  }
};

exports.getPositions = (_req, res) => {
  res.json(POSITIONS);
};
