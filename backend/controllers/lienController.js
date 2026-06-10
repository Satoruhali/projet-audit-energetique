const { Op } = require('sequelize');
const Locataire = require('../models/Locataire');
const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Creneau = require('../models/Creneau');
const JoursDisponible = require('../models/JoursDisponible');
const EmailEnvoye = require('../models/EmailEnvoye');
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
    const locataire = await Locataire.findOne({ where: { token_acces: token } });
    if (!locataire) {
      return res.status(404).json({ message: 'Lien invalide ou expiré' });
    }

    const logement = await require('../models/Logement').findOne({
      where: { locataire_id: locataire.id }
    });

    if (!logement) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    const immeuble = await Immeuble.findByPk(logement.batiment_id);
    if (!immeuble) {
      return res.status(404).json({ message: 'Immeuble introuvable' });
    }

    const campagne = await Campagne.findOne({
      where: { batiment_id: logement.batiment_id }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const joursDisponibles = await JoursDisponible.findAll({
      where: {
        id_entrepreneur: immeuble.id_entrepreneur,
        est_disponible: true
      },
      order: [['date', 'ASC']]
    });

    res.json({
      locataire: {
        nom: locataire.nom,
        prenom: locataire.prenom
      },
      campagne: {
        id: campagne.id,
        nom: campagne.nom
      },
      jours_disponibles: joursDisponibles.map(j => {
        const d = new Date(j.date);
        return d.toISOString().split('T')[0];
      })
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

    const locataire = await Locataire.findOne({ where: { token_acces: token } });
    if (!locataire) {
      return res.status(404).json({ message: 'Lien invalide ou expiré' });
    }

    const logement = await require('../models/Logement').findOne({
      where: { locataire_id: locataire.id }
    });

    if (!logement) {
      return res.status(404).json({ message: 'Logement introuvable' });
    }

    const campagne = await Campagne.findOne({
      where: { batiment_id: logement.batiment_id }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const creneauExistant = await Creneau.findOne({
      where: { id_logement: logement.id, id_campagne: campagne.id }
    });
    if (creneauExistant) {
      return res.status(400).json({ message: 'Un créneau a déjà été réservé pour ce lien' });
    }

    const immeuble = await Immeuble.findByPk(logement.batiment_id);

    const dateStr = new Date(date_visite).toISOString().split('T')[0];

    const joursDisponibles = await JoursDisponible.findAll({
      where: {
        id_entrepreneur: immeuble.id_entrepreneur,
        est_disponible: true
      }
    });

    const joursDates = joursDisponibles.map(j =>
      new Date(j.date).toISOString().split('T')[0]
    );

    if (!joursDates.includes(dateStr)) {
      return res.status(400).json({ message: 'La date sélectionnée n\'est pas disponible' });
    }

    const existants = await Creneau.findAll({
      where: {
        id_campagne: campagne.id,
        date_visite: date_visite
      }
    });

    for (const existant of existants) {
      if (chevauche(heure_debut, heure_fin, existant.heure_debut, existant.heure_fin)) {
        return res.status(409).json({
          message: `Ce créneau chevauche un rendez-vous existant (${existant.heure_debut}-${existant.heure_fin})`
        });
      }
    }

    const creneau = await Creneau.create({
      id_logement: logement.id,
      id_campagne: campagne.id,
      date_visite: date_visite,
      heure_debut,
      heure_fin,
      statut: 'reserve'
    });

    const { sendMail, templateConfirmation } = require('../services/emailService');

    if (locataire.email) {
      const { sujet, corps } = templateConfirmation({
        prenom: locataire.prenom,
        nom: locataire.nom,
        date_visite: dateStr,
        heure_debut,
        heure_fin,
        nom_immeuble: immeuble.nom,
        nom_campagne: campagne.nom
      });
      const { success, error } = await sendMail({ to: locataire.email, subject: sujet, html: corps });
      await EmailEnvoye.create({
        id_campagne: campagne.id,
        id_locataire: locataire.id,
        destinataire: locataire.email,
        sujet,
        corps,
        type: 'visite_programmee',
        statut: success ? 'envoye' : 'echec',
        erreur: error || null
      });
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
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Un créneau existe déjà pour ce locataire ou ce créneau horaire' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
