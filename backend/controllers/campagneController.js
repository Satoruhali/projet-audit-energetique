const { Op } = require('sequelize');
const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const Creneau = require('../models/Creneau');
const EmailEnvoye = require('../models/EmailEnvoye');
const Typologie = require('../models/Typologie');
const TypePlancher = require('../models/TypePlancher');
const { creerCampagne } = require('../validations/campagne');
const { lancerSelection } = require('../services/setCoverService');
const { sendMail, templateVisiteProgrammee, templatePasDeVisite, templateRelance } = require('../services/emailService');

exports.store = async (req, res) => {
  try {
    const { error, value } = creerCampagne.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const immeuble = await Immeuble.findOne({
      where: { id: value.immeuble_id, id_entrepreneur: req.entrepreneur.id }
    });
    if (!immeuble) {
      return res.status(404).json({ message: 'Immeuble introuvable ou non autorisé' });
    }

    const campagne = await Campagne.create({
      batiment_id: value.immeuble_id,
      nom: value.nom,
      statut: value.statut || 'brouillon',
      date_debut_possible: new Date(),
      date_fin_possible: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    res.status(201).json(campagne);
  } catch (err) {
    console.error('ERREUR campagneController.store:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
  }
};

exports.index = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagnes = await Campagne.findAll({
      where: { batiment_id: { [Op.in]: immeubleIds } }
    });

    res.json(campagnes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
  }
};

exports.show = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable' });
    }

    const logements = await Logement.findAll({
      where: { batiment_id: campagne.batiment_id },
      include: [
        { model: Typologie, attributes: ['code'] },
        { model: TypePlancher, as: 'plancherBas', attributes: ['nom'] },
        { model: TypePlancher, as: 'plancherHaut', attributes: ['nom'] },
        { model: Locataire }
      ]
    });

    const locataires = await Locataire.findAll({
      include: [{
        model: Logement,
        required: true,
        where: { batiment_id: campagne.batiment_id }
      }]
    });

    const creneaux = await Creneau.findAll({
      where: { id_campagne: campagne.id }
    });

    const relanceIds = new Set(
      (await EmailEnvoye.findAll({
        where: { id_campagne: campagne.id, type: 'relance' },
        attributes: ['id_locataire']
      })).map(r => r.id_locataire)
    );

    const result = campagne.toJSON();
    result.logements = logements.map(l => {
      const plain = l.toJSON();
      return {
        ...plain,
        typologie: plain.typologie?.code || null,
        plancher_bas: plain.plancherBas?.nom || null,
        plancher_haut: plain.plancherHaut?.nom || null
      };
    });
    result.locataires = locataires.map(l => {
      const plain = l.toJSON();
      plain.relance_envoye = relanceIds.has(plain.id);
      return plain;
    });
    result.creneaux = creneaux;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
  }
};

exports.lancerSelection = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = await Logement.findAll({
      where: { batiment_id: campagne.batiment_id },
      include: [
        { model: Typologie, attributes: ['code'] },
        { model: TypePlancher, as: 'plancherBas', attributes: ['nom'] },
        { model: TypePlancher, as: 'plancherHaut', attributes: ['nom'] }
      ]
    });

    if (logements.length === 0) {
      return res.status(400).json({ message: 'Aucun logement trouvé dans cette campagne' });
    }

    await Logement.update(
      { selectionne_visite: false },
      { where: { batiment_id: campagne.batiment_id } }
    );

    const logementsData = logements.map(l => {
      const plain = l.toJSON();
      return {
        id: plain.id,
        etage: plain.etage,
        typologie: plain.typologie?.code || null,
        plancher_bas: plain.plancherBas?.nom || null,
        plancher_haut: plain.plancherHaut?.nom || null,
        position: plain.position || null
      };
    });

    const resultat = lancerSelection(logementsData);

    await Logement.update(
      { selectionne_visite: true },
      { where: { id: { [Op.in]: resultat.selectionnes }, batiment_id: campagne.batiment_id } }
    );

    campagne.selection = {
      date_selection: new Date().toISOString(),
      seuil_requis: resultat.seuil.requis,
      seuil_obtenu: resultat.seuil.obtenu,
      couverture: resultat.couverture,
      couvertureComplete: resultat.success,
      criteresManquants: resultat.criteresManquants
    };
    await campagne.save();

    res.json({
      message: `Sélection terminée : ${resultat.selectionnes.length} logements sélectionnés`,
      nbSelectionnes: resultat.selectionnes.length,
      selectionnes: resultat.selectionnes,
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

exports.listEmails = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const emails = await EmailEnvoye.findAll({
      where: { id_campagne: campagne.id },
      order: [['date_envoi', 'DESC']],
      limit: 100
    });

    res.json({ emails });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des emails' });
  }
};

exports.envoyerEmails = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = await Logement.findAll({
      where: { batiment_id: campagne.batiment_id },
      include: [{ model: Locataire }]
    });

    const logementsAvecLocataire = logements.filter(l => l.locataire && l.locataire.email);

    if (logementsAvecLocataire.length === 0) {
      return res.status(400).json({ message: 'Aucun locataire avec email trouvé dans cette campagne' });
    }

    const immeuble = await Immeuble.findByPk(campagne.batiment_id);

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
            token: locataire.token_acces
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
        id_campagne: campagne.id,
        id_locataire: locataire.id,
        destinataire: locataire.email,
        sujet: template.sujet,
        corps: template.corps,
        type,
        statut: success ? 'envoye' : 'echec',
        erreur: error || null
      });

      resultats.push({
        locataire_id: locataire.id,
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

exports.envoyerRelances = async (req, res) => {
  try {
    const immeubles = await Immeuble.findAll({
      where: { id_entrepreneur: req.entrepreneur.id }
    });
    const immeubleIds = immeubles.map(i => i.id);

    const campagne = await Campagne.findOne({
      where: { id: req.params.id, batiment_id: { [Op.in]: immeubleIds } }
    });

    if (!campagne) {
      return res.status(404).json({ message: 'Campagne introuvable ou non autorisée' });
    }

    const logements = await Logement.findAll({
      where: { batiment_id: campagne.batiment_id, selectionne_visite: true },
      include: [{ model: Locataire }]
    });

    const locatairesAvecEmail = logements
      .filter(l => l.locataire && l.locataire.email)
      .map(l => l.locataire);

    if (locatairesAvecEmail.length === 0) {
      return res.status(400).json({ message: 'Aucun locataire avec email sélectionné pour visite' });
    }

    const creneaux = await Creneau.findAll({
      where: { id_campagne: campagne.id }
    });
    const logementIdsAvecCreneau = creneaux.map(c => c.id_logement);
    const logementsAvecCreneau = await Logement.findAll({
      where: { id: logementIdsAvecCreneau }
    });
    const locatairesAvecCreneau = new Set(logementsAvecCreneau.map(l => l.locataire_id));

    let nonRepondants = locatairesAvecEmail.filter(l => !locatairesAvecCreneau.has(l.id));

    if (req.body.ids && Array.isArray(req.body.ids) && req.body.ids.length > 0) {
      const ids = req.body.ids.map(Number);
      nonRepondants = nonRepondants.filter(l => ids.includes(l.id));
    }

    if (nonRepondants.length === 0) {
      return res.json({ message: 'Tous les locataires ont déjà répondu', total: 0, total_envoyes: 0, total_erreurs: 0, details: [] });
    }

    const immeuble = await Immeuble.findByPk(campagne.batiment_id);
    const resultats = [];

    for (const locataire of nonRepondants) {
      const template = templateRelance({
        prenom: locataire.prenom,
        nom: locataire.nom,
        nom_campagne: campagne.nom,
        nom_immeuble: immeuble ? immeuble.nom : '',
        token: locataire.token_acces
      });

      const { success, error } = await sendMail({
        to: locataire.email,
        subject: template.sujet,
        html: template.corps
      });

      const emailRecord = await EmailEnvoye.create({
        id_campagne: campagne.id,
        id_locataire: locataire.id,
        destinataire: locataire.email,
        sujet: template.sujet,
        corps: template.corps,
        type: 'relance',
        statut: success ? 'envoye' : 'echec',
        erreur: error || null
      });

      resultats.push({
        locataire_id: locataire.id,
        email: locataire.email,
        type: 'relance',
        statut: emailRecord.statut,
        erreur: error || null
      });
    }

    const totalEnvoyes = resultats.filter(r => r.statut === 'envoye').length;
    const totalErreurs = resultats.filter(r => r.statut === 'echec').length;

    res.json({
      message: `${totalEnvoyes} relance(s) envoyée(s), ${totalErreurs} erreur(s)`,
      total: resultats.length,
      total_envoyes: totalEnvoyes,
      total_erreurs: totalErreurs,
      details: resultats
    });
  } catch (err) {
    console.error('Erreur envoyerRelances:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi des relances' });
  }
};
