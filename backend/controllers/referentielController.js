const TYPOLOGIES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const PLANCHER_BAS = ['Dalle pleine', 'Dalle alvéolée', 'Poutrelles hourdis'];
const PLANCHER_HAUT = ['Dalle pleine', 'Dalle alvéolée', 'Plancher bois'];

exports.getTypologies = (_req, res) => {
  res.json(TYPOLOGIES);
};

exports.getPlancherBas = (_req, res) => {
  res.json(PLANCHER_BAS);
};

exports.getPlancherHaut = (_req, res) => {
  res.json(PLANCHER_HAUT);
};
