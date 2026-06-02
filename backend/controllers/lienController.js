const Locataire = require('../models/Locataire');
const Campagne = require('../models/Campagne');
const Creneau = require('../models/Creneau');
const { creneauSchema } = require('../validations/lien');

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function chevauche(debut1, fin1, debut2, fin2) {
  return timeToMinutes(debut1) < timeToMinutes(fin2) && timeToMinutes(debut2) < timeToMinutes(fin1);
}

exports.timeToMinutes = timeToMinutes;
exports.chevauche = chevauche;

exports.getLien = async (req, res) => {
  try {
    const { token } = req.params;
    const locataire = await Locataire.findOne({ token });
    if (!locataire) {
      return res.status(404).json({ message: 'Lien invalide ou expiré' });
    }

    const campagne = await Campagne.findById(locataire.campagne_id);
    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const joursDisponibles = (campagne.jours_disponibles || []).map(d => {
      const date = new Date(d);
      return date.toISOString().split('T')[0];
    });

    res.json({
      locataire: {
        nom: locataire.nom,
        prenom: locataire.prenom,
        logement: locataire.logement_id
      },
      campagne: {
        id: campagne._id,
        nom: campagne.nom
      },
      jours_disponibles: joursDisponibles
    });
  } catch (err) {
    console.error('Erreur getLien:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.postCreneau = async (req, res) => {
  try {
    const { token } = req.params;

    const { error, value } = creneauSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { date_visite, heure_debut, heure_fin } = value;

    if (heure_debut >= heure_fin) {
      return res.status(400).json({ message: 'L\'heure de fin doit être postérieure à l\'heure de début' });
    }

    const locataire = await Locataire.findOne({ token });
    if (!locataire) {
      return res.status(404).json({ message: 'Lien invalide ou expiré' });
    }

    const creneauExistant = await Creneau.findOne({ locataire_id: locataire._id, campagne_id: locataire.campagne_id });
    if (creneauExistant) {
      return res.status(400).json({ message: 'Un créneau a déjà été réservé pour ce lien' });
    }

    const campagne = await Campagne.findById(locataire.campagne_id);
    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const dateStr = new Date(date_visite).toISOString().split('T')[0];
    const joursDisponibles = (campagne.jours_disponibles || []).map(d =>
      new Date(d).toISOString().split('T')[0]
    );

    if (!joursDisponibles.includes(dateStr)) {
      return res.status(400).json({ message: 'La date sélectionnée n\'est pas disponible' });
    }

    const debut = new Date(date_visite);
    debut.setHours(0, 0, 0, 0);

    const fin = new Date(date_visite);
    fin.setHours(23, 59, 59, 999);

    const existants = await Creneau.find({
      campagne_id: campagne._id,
      date_visite: { $gte: debut, $lte: fin }
    });

    for (const existant of existants) {
      if (chevauche(heure_debut, heure_fin, existant.heure_debut, existant.heure_fin)) {
        return res.status(409).json({
          message: `Ce créneau chevauche un rendez-vous existant (${existant.heure_debut}-${existant.heure_fin})`
        });
      }
    }

    const creneau = await Creneau.create({
      locataire_id: locataire._id,
      campagne_id: campagne._id,
      date_visite: date_visite,
      heure_debut,
      heure_fin,
      statut: 'reserve'
    });

    if (locataire.email) {
      console.log(`[EMAIL SIMULÉ] Confirmation envoyée à ${locataire.email}`);
      console.log(`[EMAIL SIMULÉ] Sujet: Confirmation de votre rendez-vous`);
      console.log(`[EMAIL SIMULÉ] Corps: Bonjour ${locataire.prenom} ${locataire.nom},`);
      console.log(`[EMAIL SIMULÉ] Votre rendez-vous est confirmé le ${dateStr} de ${heure_debut} à ${heure_fin}.`);
    }

    res.status(201).json({
      message: 'Créneau réservé avec succès',
      creneau: {
        date_visite: dateStr,
        heure_debut,
        heure_fin,
        statut: creneau.statut
      }
    });
  } catch (err) {
    console.error('Erreur postCreneau:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Un créneau existe déjà pour ce locataire ou ce créneau horaire' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
