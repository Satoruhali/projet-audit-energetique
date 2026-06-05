require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const FRONTEND = path.join(__dirname, '..', 'frontend');

// Servir les fichiers statiques du frontend
app.use(express.static(FRONTEND));

// Routes pages (URLs propres)
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'dashboard.html')));
app.get('/auth', (req, res) => res.sendFile(path.join(FRONTEND, 'auth.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(FRONTEND, 'dashboard.html')));
app.get('/detail', (req, res) => res.sendFile(path.join(FRONTEND, 'detail.html')));
app.get('/jours', (req, res) => res.sendFile(path.join(FRONTEND, 'jours.html')));
app.get('/planning', (req, res) => res.sendFile(path.join(FRONTEND, 'planning.html')));
app.get('/rendez-vous/:token', (req, res) => res.sendFile(path.join(FRONTEND, 'rdv.html')));

// API 404 catch-all
app.get('/api/*', (req, res) => res.status(404).json({ message: 'Route API inconnue' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  });
