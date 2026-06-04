const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const Creneau = require('../models/Creneau');
const EmailEnvoye = require('../models/EmailEnvoye');
const { creerCampagne } = require('../validations/campagne');
const { lancerSelection } = require('../services/setCoverService');
const { sendMail, templateVisiteProgrammee, templatePasDeVisite } = require('../services/emailService');

exports.store = async (req, res) => {
  try {
    const { error, value } = creerCampagne.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeuble = await Immeuble.findOne({
      _id: value.immeuble_id,
      id_entrepreneur: req.entrepreneur.id
    });
    if (!immeuble) {
      return res.status(404).json({ message: 'Immeuble introuvable ou non autorisé' });
    }

    const campagne = await Campagne.create(value);
    res.status(201).json(campagne);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
  }
};

exports.index = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagnes = await Campagne.find({
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    res.json(campagnes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
  }
};

exports.show = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    }).populate(['logements', 'locataires']);

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const creneaux = await Creneau.find({ campagne_id: campagne._id }).lean();

    const result = campagne.toJSON();
    result.creneaux = creneaux;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
  }
};

exports.lancerSelection = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    if (!campagne.jours_disponibles || campagne.jours_disponibles.length === 0) {
      return res.status(400).json({ message: 'La campagne doit avoir des jours_disponibles définis avant de lancer la sélection' });
    }

    const logements = await Logement.find({
      campagne_id: campagne._id,
      deletedAt: null
    });

    if (logements.length === 0) {
      return res.status(400).json({ message: 'Aucun logement trouvé dans cette campagne' });
    }

    await Logement.updateMany(
      { campagne_id: campagne._id, deletedAt: null },
      { $set: { selectionne_visite: false } }
    );

    const resultat = lancerSelection(logements);

    await Logement.updateMany(
      { _id: { $in: resultat.selectionnes }, deletedAt: null },
      { $set: { selectionne_visite: true } }
    );

    const selectionnesIds = resultat.selectionnes;

    campagne.selection = {
      date_selection: new Date(),
      seuil_requis: resultat.seuil.requis,
      seuil_obtenu: resultat.seuil.obtenu,
      couverture: resultat.couverture,
      couvertureComplete: resultat.success,
      criteresManquants: resultat.criteresManquants
    };
    await campagne.save();

    res.json({
      message: `Sélection terminée : ${selectionnesIds.length} logements sélectionnés`,
      nbSelectionnes: selectionnesIds.length,
      selectionnes: selectionnesIds,
      couverture: resultat.couverture,
      seuil: resultat.seuil,
      couvertureComplete: resultat.success,
      criteresManquants: resultat.criteresManquants,
      selection: campagne.selection
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du lancement de la sélection' });
  }
};

exports.envoyerEmails = async (req, res) => {
  try {
    const immeubles = await Immeuble.find({ id_entrepreneur: req.entrepreneur.id });
    const immeubleIds = immeubles.map(i => i._id);

    const campagne = await Campagne.findOne({
      _id: req.params.id,
      immeuble_id: { $in: immeubleIds },
      deletedAt: null
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = await Logement.find({
      campagne_id: campagne._id,
      deletedAt: null
    }).populate('locataire');

    const logementsAvecLocataire = logements.filter(l => l.locataire && l.locataire.email);

    if (logementsAvecLocataire.length === 0) {
      return res.status(400).json({ message: 'Aucun locataire avec email trouvé dans cette campagne' });
    }

    const immeuble = await Immeuble.findById(campagne.immeuble_id);

    const resultats = [];

    for (const logement of logementsAvecLocataire) {
      const locataire = logement.locataire;
      const isVisite = logement.selectionne_visite === true;
      const type = isVisite ? 'visite_programmee' : 'pas_de_visite';

      const template = isVisite
        ? templateVisiteProgrammee({
            prenom: locataire.prenom,
            nom: locataire.nom,
            nom_campagne: campagne.nom,
            nom_immeuble: immeuble ? immeuble.nom : '',
            token: locataire.token
          })
        : templatePasDeVisite({
            prenom: locataire.prenom,
            nom: locataire.nom,
            nom_campagne: campagne.nom,
            nom_immeuble: immeuble ? immeuble.nom : ''
          });

      const { success, error } = await sendMail({
        to: locataire.email,
        subject: template.sujet,
        html: template.corps
      });

      const emailRecord = await EmailEnvoye.create({
        campagne_id: campagne._id,
        locataire_id: locataire._id,
        destinataire: locataire.email,
        sujet: template.sujet,
        corps: template.corps,
        type,
        statut: success ? 'envoye' : 'echec',
        erreur: error || null
      });

      resultats.push({
        locataire_id: locataire._id,
        email: locataire.email,
        type,
        statut: emailRecord.statut,
        erreur: error || null
      });
    }

    const totalEnvoyes = resultats.filter(r => r.statut === 'envoye').length;
    const totalErreurs = resultats.filter(r => r.statut === 'echec').length;

    res.json({
      message: `${totalEnvoyes} email(s) envoyé(s), ${totalErreurs} erreur(s)`,
      total: resultats.length,
      total_envoyes: totalEnvoyes,
      total_erreurs: totalErreurs,
      details: resultats
    });
  } catch (err) {
    console.error('Erreur envoyerEmails:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi des emails' });
  }
};
