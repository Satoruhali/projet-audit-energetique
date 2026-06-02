const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const immeubleRoutes = require('./routes/immeubleRoutes');
const referentielRoutes = require('./routes/referentielRoutes');
const campagneRoutes = require('./routes/campagneRoutes');
const lienRoutes = require('./routes/lienRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur opérationnel' });
});

// app.use('/api/auth', authRoutes);
app.use('/api/auth', (req, res, next) => {
  console.log('Route atteinte:', req.method, req.url);
  next();
}, authRoutes);

app.use('/api/entrepreneur/immeubles', immeubleRoutes);
const campagneJoursRoutes = require('./routes/campagneJoursRoutes');

app.use('/api/entrepreneur/campagnes', campagneRoutes);
app.use('/api/entrepreneur/campagnes/:id', campagneJoursRoutes);
app.use('/api/liens', lienRoutes);
app.use('/api/referentiel', referentielRoutes);

module.exports = app;
