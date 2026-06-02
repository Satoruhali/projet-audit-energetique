const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const lienController = require('../controllers/lienController');

const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';

const publicLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 60000,
  max: isTest ? 1000 : (parseInt(process.env.RATE_LIMIT_PUBLIC_MAX) || 10),
  message: { message: 'Trop de requêtes. Veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(publicLimiter);

router.get('/:token', lienController.getLien);
router.post('/:token/creneaux', lienController.postCreneau);

module.exports = router;
