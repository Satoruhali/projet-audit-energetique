const fs = require('fs');
const path = require('path');
const Entrepreneur = require('../models/Entrepreneur');

exports.getParametres = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      nom: entrepreneur.nom,
      email: entrepreneur.email,
      nom_entreprise: entrepreneur.nom_entreprise || null,
      logo_url: entrepreneur.logo_url || null,
      smtp_configured: !!(entrepreneur.smtp_host && entrepreneur.smtp_user)
    });
  } catch (err) {
    console.error('ERREUR getParametres:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
  }
};

exports.updateParametres = async (req, res) => {
  try {
    const { nomEntreprise } = req.body;

    if (nomEntreprise !== undefined && typeof nomEntreprise !== 'string') {
      return res.status(400).json({ message: 'nomEntreprise doit être une chaîne de caractères' });
    }

    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (nomEntreprise !== undefined) {
      entrepreneur.nom_entreprise = nomEntreprise.trim() || null;
    }
    await entrepreneur.save();

    res.json({
      message: 'Paramètres mis à jour',
      nom_entreprise: entrepreneur.nom_entreprise,
      logo_url: entrepreneur.logo_url
    });
  } catch (err) {
    console.error('ERREUR updateParametres:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres' });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu (champ "logo" requis)' });
    }

    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const ancienLogo = entrepreneur.logo_url;

    const logoUrl = `/uploads/${req.file.filename}`;
    entrepreneur.logo_url = logoUrl;
    await entrepreneur.save();

    if (ancienLogo && ancienLogo.startsWith('/uploads/')) {
      const ancienChemin = path.join(__dirname, '..', '..', 'uploads', path.basename(ancienLogo));
      fs.unlink(ancienChemin, () => {});
    }

    res.json({
      message: 'Logo mis à jour',
      logo_url: logoUrl
    });
  } catch (err) {
    console.error('ERREUR uploadLogo:', err);
    res.status(500).json({ message: 'Erreur lors de l\'upload du logo' });
  }
};
