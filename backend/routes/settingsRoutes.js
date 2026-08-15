const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { uploadLogo } = require('../middlewares/upload');
const { getParametres, updateParametres, uploadLogo: uploadLogoHandler, updateSmtp, testSmtp } = require('../controllers/settingsController');

router.get('/parametres', auth, getParametres);
router.put('/parametres', auth, updateParametres);
router.put('/parametres/smtp', auth, updateSmtp);
router.post('/parametres/smtp/test', auth, testSmtp);
router.post('/parametres/logo', auth, uploadLogo, uploadLogoHandler);

module.exports = router;
