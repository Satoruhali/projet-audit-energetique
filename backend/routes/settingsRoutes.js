const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { uploadLogo } = require('../middlewares/upload');
const { getParametres, updateParametres, uploadLogo: uploadLogoHandler } = require('../controllers/settingsController');

router.get('/parametres', auth, getParametres);
router.put('/parametres', auth, updateParametres);
router.post('/parametres/logo', auth, uploadLogo, uploadLogoHandler);

module.exports = router;
