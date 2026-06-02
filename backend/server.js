require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du frontend (index.html, script.js, styles.css)
app.use(express.static(path.join(__dirname, '..')));

// SPA fallback : rediriger toutes les routes non-API vers index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Route API inconnue' });
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  });
