const Entrepreneur = require('../models/Entrepreneur');

exports.register = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone, entreprise, password } = req.body;
    const mdp = motDePasse || password;

    if (await Entrepreneur.findOne({ email })) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const entrepreneur = await Entrepreneur.create({ nom, email, motDePasse: mdp, telephone, entreprise });
    const token = entrepreneur.genererToken();

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      entrepreneur: {
        id: entrepreneur._id, nom: entrepreneur.nom,
        email: entrepreneur.email, role: entrepreneur.role
      },
      user: {
        id: entrepreneur._id, nom: entrepreneur.nom,
        email: entrepreneur.email, role: entrepreneur.role
      }
    });
  }   catch (err) {
  console.error('ERREUR:', err);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  res.status(500).json({ message: err.message });
}
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const entrepreneur = await Entrepreneur.findOne({ email }).select('+motDePasse');

    if (!entrepreneur || !(await entrepreneur.comparerMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = entrepreneur.genererToken();

    res.json({
      message: 'Connexion réussie',
      token,
      entrepreneur: {
        id: entrepreneur._id, nom: entrepreneur.nom,
        email: entrepreneur.email, role: entrepreneur.role
      },
      user: {
        id: entrepreneur._id, nom: entrepreneur.nom,
        email: entrepreneur.email, role: entrepreneur.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.entrepreneur.id);

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      entrepreneur: {
        id: entrepreneur._id, nom: entrepreneur.nom,
        email: entrepreneur.email, role: entrepreneur.role,
        createdAt: entrepreneur.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
