const express = require('express');
const router = express.Router();
const {
  getTypologies,
  getPlancherBas,
  getPlancherHaut
} = require('../controllers/referentielController');

router.get('/typologies', getTypologies);
router.get('/plancher-bas', getPlancherBas);
router.get('/plancher-haut', getPlancherHaut);

module.exports = router;
