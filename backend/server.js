const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const requiredEnvVars = [
  { key: 'JWT_SECRET', message: 'JWT_SECRET manquant — tokens non sécurisés' },
  { key: 'BASE_URL', message: 'BASE_URL manquante — liens emails invalides' },
];
for (const { key, message } of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`FATAL: ${message}`);
    process.exit(1);
  }
}

const express = require('express');
const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || '0.0.0.0';
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
    app.listen(PORT, HOST, () => console.log(`Serveur démarré sur http://${HOST}:${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MySQL:', err);
    process.exit(1);
  });
