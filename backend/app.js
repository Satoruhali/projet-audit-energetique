const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const immeubleRoutes = require('./routes/immeubleRoutes');
const referentielRoutes = require('./routes/referentielRoutes');
const campagneRoutes = require('./routes/campagneRoutes');
const lienRoutes = require('./routes/lienRoutes');

const app = express();

const helmet = require('helmet');

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' }));
app.use(helmet());
app.use(express.json());

const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: isTest ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX) || 100),
  message: { message: 'Trop de requêtes. Veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur opérationnel' });
});

app.use('/api/auth', authRoutes);

app.use('/api/entrepreneur/immeubles', immeubleRoutes);
const campagneJoursRoutes = require('./routes/campagneJoursRoutes');

app.use('/api/entrepreneur/campagnes', campagneRoutes);
app.use('/api/entrepreneur/campagnes/:id', campagneJoursRoutes);
app.use('/api/liens', lienRoutes);
app.use('/api/referentiel', referentielRoutes);

app.use(errorHandler);

module.exports = app;
