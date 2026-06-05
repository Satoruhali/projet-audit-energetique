const Entrepreneur = require('../models/Entrepreneur');

exports.register = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone, entreprise, password } = req.body;
    const mdp = motDePasse || password;

    const existant = await Entrepreneur.findOne({ where: { email } });
    if (existant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const entrepreneur = await Entrepreneur.create({
      nom,
      email,
      mot_de_passe_hash: mdp,
      telephone
    });

    const token = entrepreneur.genererToken();

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      entrepreneur: {
        id: entrepreneur.id, nom: entrepreneur.nom,
        email: entrepreneur.email
      },
      user: {
        id: entrepreneur.id, nom: entrepreneur.nom,
        email: entrepreneur.email
      }
    });
  } catch (err) {
    console.error('ERREUR:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse, password } = req.body;
    const mdp = motDePasse || password;

    if (!email || !mdp) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const entrepreneur = await Entrepreneur.findOne({ where: { email } });

    if (!entrepreneur || !(await entrepreneur.comparerMotDePasse(mdp))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = entrepreneur.genererToken();

    res.json({
      message: 'Connexion réussie',
      token,
      entrepreneur: {
        id: entrepreneur.id, nom: entrepreneur.nom,
        email: entrepreneur.email
      },
      user: {
        id: entrepreneur.id, nom: entrepreneur.nom,
        email: entrepreneur.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByPk(req.entrepreneur.id);

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      entrepreneur: {
        id: entrepreneur.id, nom: entrepreneur.nom,
        email: entrepreneur.email,
        createdAt: entrepreneur.date_creation
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
