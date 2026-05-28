const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middlewares/auth');
const campagneJoursController = require('../controllers/campagneJoursController');

router.put('/jours-disponibles', auth, campagneJoursController.remplacerJours);
router.get('/jours-disponibles', auth, campagneJoursController.recupererJours);

module.exports = router;
