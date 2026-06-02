const express = require('express');
const router = express.Router();
const lienController = require('../controllers/lienController');

router.get('/:token', lienController.getLien);
router.post('/:token/creneaux', lienController.postCreneau);

module.exports = router;
