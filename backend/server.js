const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const FRONTEND = path.join(__dirname, '..', 'frontend');

app.use(express.static(FRONTEND));

app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'dashboard.html')));
app.get('/auth', (req, res) => res.sendFile(path.join(FRONTEND, 'auth.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(FRONTEND, 'dashboard.html')));
app.get('/detail', (req, res) => res.sendFile(path.join(FRONTEND, 'detail.html')));
app.get('/jours', (req, res) => res.sendFile(path.join(FRONTEND, 'jours.html')));
app.get('/planning', (req, res) => res.sendFile(path.join(FRONTEND, 'planning.html')));
app.get('/rendez-vous/:token', (req, res) => res.sendFile(path.join(FRONTEND, 'rdv.html')));

app.get('/api/*', (req, res) => res.status(404).json({ message: 'Route API inconnue' }));

sequelize.authenticate()
  .then(() => {
    console.log('MySQL connecté');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MySQL:', err);
    process.exit(1);
  });
