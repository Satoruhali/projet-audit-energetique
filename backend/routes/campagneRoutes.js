const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const campagneController = require('../controllers/campagneController');
const logementController = require('../controllers/logementController');

router.post('/', auth, campagneController.store);
router.get('/', auth, campagneController.index);
router.get('/:id', auth, campagneController.show);

router.post('/:id/logements', auth, logementController.storeBatch);
router.put('/:campagne_id/logements/:logement_id', auth, logementController.update);
router.delete('/:campagne_id/logements/:logement_id', auth, logementController.delete);

router.post('/:id/lancer-selection', auth, campagneController.lancerSelection);

module.exports = router;
