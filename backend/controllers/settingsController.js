const fs = require('fs');
const path = require('path');
const Entrepreneur = require('../models/Entrepreneur');
const { encrypt } = require('../services/crypto');
const { sendMail, construireSmtpConfig } = require('../services/emailService');

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
      smtp_configured: !!(entrepreneur.smtp_host && entrepreneur.smtp_user),
      smtp_host: entrepreneur.smtp_host || null,
      smtp_port: entrepreneur.smtp_port || null,
      smtp_user: entrepreneur.smtp_user || null,
      smtp_from: entrepreneur.smtp_from || null,
      smtp_from_nom: entrepreneur.smtp_from_nom || null
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

exports.updateSmtp = async (req, res) => {
  try {
    const { host, port, user, pass, from, fromNom } = req.body;

    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (host !== undefined) {
      if (host !== null && typeof host !== 'string') {
        return res.status(400).json({ message: 'host doit être une chaîne de caractères' });
      }
      entrepreneur.smtp_host = typeof host === 'string' ? host.trim() || null : null;
    }

    if (port !== undefined) {
      const num = (port === null || port === '') ? null : parseInt(port, 10);
      if (num !== null && Number.isNaN(num)) {
        return res.status(400).json({ message: 'port doit être un nombre' });
      }
      entrepreneur.smtp_port = num;
    }

    if (user !== undefined) {
      if (user !== null && typeof user !== 'string') {
        return res.status(400).json({ message: 'user doit être une chaîne de caractères' });
      }
      entrepreneur.smtp_user = typeof user === 'string' ? user.trim() || null : null;
    }

    if (pass !== undefined && pass !== null && pass.trim() !== '') {
      entrepreneur.smtp_pass_encrypted = JSON.stringify(encrypt(pass));
    }

    if (from !== undefined) {
      if (from !== null && typeof from !== 'string') {
        return res.status(400).json({ message: 'from doit être une chaîne de caractères' });
      }
      entrepreneur.smtp_from = typeof from === 'string' ? from.trim() || null : null;
    }

    if (fromNom !== undefined) {
      if (fromNom !== null && typeof fromNom !== 'string') {
        return res.status(400).json({ message: 'fromNom doit être une chaîne de caractères' });
      }
      entrepreneur.smtp_from_nom = typeof fromNom === 'string' ? fromNom.trim() || null : null;
    }

    await entrepreneur.save();

    res.json({
      message: 'Configuration SMTP enregistrée',
      smtp_configured: !!(entrepreneur.smtp_host && entrepreneur.smtp_user)
    });
  } catch (err) {
    console.error('ERREUR updateSmtp:', err);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la configuration SMTP' });
  }
};

exports.testSmtp = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const smtpConfig = construireSmtpConfig(entrepreneur);
    if (!smtpConfig) {
      return res.status(400).json({ message: 'Aucune configuration SMTP enregistrée (hôte et utilisateur requis)' });
    }

    const { success, error } = await sendMail({
      to: entrepreneur.email,
      subject: 'Test d\'envoi — Planif\'Audit',
      html: '<p>Ceci est un email de test envoyé depuis votre configuration SMTP.</p>',
      smtpConfig,
      nomEntreprise: entrepreneur.nom_entreprise || null
    });

    if (!success) {
      return res.status(502).json({ message: `Échec de l'envoi de test : ${error}`, success: false });
    }

    res.json({ success: true, message: 'Email de test envoyé avec succès' });
  } catch (err) {
    console.error('ERREUR testSmtp:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du test' });
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
