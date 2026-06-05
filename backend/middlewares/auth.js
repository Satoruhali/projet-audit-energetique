const jwt = require('jsonwebtoken');
const Entrepreneur = require('../models/Entrepreneur');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const entrepreneur = await Entrepreneur.findByPk(decoded.id);

    if (!entrepreneur) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    req.entrepreneur = {
      id: entrepreneur.id, nom: entrepreneur.nom,
      email: entrepreneur.email
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = auth;
