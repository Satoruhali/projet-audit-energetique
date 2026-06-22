require('dotenv').config();
const crypto = require('crypto');
const { sequelize } = require('./models');
const Entrepreneur = require('./models/Entrepreneur');
const Immeuble = require('./models/Immeuble');
const Campagne = require('./models/Campagne');
const Logement = require('./models/Logement');
const Locataire = require('./models/Locataire');
const Creneau = require('./models/Creneau');
const EmailEnvoye = require('./models/EmailEnvoye');
const JoursDisponible = require('./models/JoursDisponible');
const Typologie = require('./models/Typologie');
const TypePlancher = require('./models/TypePlancher');

async function seed() {
  await sequelize.authenticate();
  console.log('MySQL connecté');

  await sequelize.sync({ force: true });
  console.log('Tables créées');

  // ── 1. Référentiels ──────────────────────────────────────────
  await Typologie.bulkCreate([
    { code: 'T1', nb_pieces: 1, surface_min_m2: 20, surface_max_m2: 35 },
    { code: 'T2', nb_pieces: 2, surface_min_m2: 35, surface_max_m2: 50 },
    { code: 'T3', nb_pieces: 3, surface_min_m2: 50, surface_max_m2: 70 },
    { code: 'T4', nb_pieces: 4, surface_min_m2: 70, surface_max_m2: 90 },
    { code: 'T5', nb_pieces: 5, surface_min_m2: 90, surface_max_m2: 110 },
    { code: 'T6', nb_pieces: 6, surface_min_m2: 110, surface_max_m2: 130 }
  ]);

  await TypePlancher.bulkCreate([
    { categorie: 'bas', nom: 'terre-plein', description: 'Sur terre-plein' },
    { categorie: 'bas', nom: 'vide-sanitaire', description: 'Sur vide sanitaire' },
    { categorie: 'bas', nom: 'dalle-beton', description: 'Dalle béton' },
    { categorie: 'bas', nom: 'sous-sol', description: 'Sur sous-sol' },
    { categorie: 'haut', nom: 'combles-perdus', description: 'Combles non aménagés' },
    { categorie: 'haut', nom: 'toiture-terrasse', description: 'Toiture terrasse' },
    { categorie: 'haut', nom: 'rampants', description: 'Rampants' }
  ]);

  console.log('Référentiels créés');

  // ── 2. Entrepreneur ──────────────────────────────────────────
  const entrepreneur = await Entrepreneur.create({
    nom: 'Nadir Diagnostics',
    email: 'nadir@diagnostic.fr',
    mot_de_passe_hash: 'test123',
    telephone: '0601020304'
  });
  console.log('Entrepreneur créé:', entrepreneur.email);

  // ── 3. Jours disponibles ─────────────────────────────────────
  await JoursDisponible.bulkCreate([
    { id_entrepreneur: entrepreneur.id, date: '2026-06-05', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-06', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-09', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-10', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-11', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-12', est_disponible: true }
  ]);

  // ── 4. Immeubles ─────────────────────────────────────────────
  const immeuble1 = await Immeuble.create({
    nom: 'Résidence des Cèdres',
    adresse: '42 avenue de la République, 75011 Paris',
    nb_etages: 5,
    id_entrepreneur: entrepreneur.id,
    typologie: 'collectif',
    annee_construction: 1985,
    plancher_bas: 'terre-plein',
    plancher_haut: 'toiture-terrasse',
    surface_totale: 3200
  });
  console.log('Immeuble créé:', immeuble1.nom);

  const immeuble2 = await Immeuble.create({
    nom: 'Le Belvédère',
    adresse: '8 rue des Alpes, 93100 Montreuil',
    nb_etages: 8,
    id_entrepreneur: entrepreneur.id,
    typologie: 'collectif',
    annee_construction: 2003,
    plancher_bas: 'vide-sanitaire',
    plancher_haut: 'toiture-terrasse',
    surface_totale: 5200
  });
  console.log('Immeuble créé:', immeuble2.nom);

  // ── 5. Campagnes ─────────────────────────────────────────────
  const campagne1 = await Campagne.create({
    batiment_id: immeuble1.id,
    nom: 'Campagne DPE - Résidence des Cèdres',
    date_debut_possible: '2026-06-05',
    date_fin_possible: '2026-06-30',
    statut: 'ouverte',
    nb_min_visites: 5,
    pct_min_visites: 50.00
  });
  campagne1.selection = {
    date_selection: new Date().toISOString(),
    seuil_requis: 5,
    seuil_obtenu: 5,
    couverture: {
      typologies: ['T1', 'T2', 'T3', 'T4'],
      planchersBas: ['terre-plein', 'dalle-beton'],
      planchersHaut: ['dalle-beton', 'toiture-terrasse'],
      positions: ['bas', 'intermediaire', 'haut']
    },
    couvertureComplete: true,
    criteresManquants: []
  };
  await campagne1.save();
  console.log('Campagne créée:', campagne1.nom);

  const campagne2 = await Campagne.create({
    batiment_id: immeuble2.id,
    nom: 'Campagne DPE - Le Belvédère',
    date_debut_possible: '2026-06-01',
    date_fin_possible: '2026-06-28',
    statut: 'planification_terminee',
    nb_min_visites: 4,
    pct_min_visites: 50.00
  });
  campagne2.selection = {
    date_selection: '2026-06-02T10:00:00.000Z',
    seuil_requis: 4,
    seuil_obtenu: 4,
    couverture: {
      typologies: ['T2', 'T3', 'T4'],
      planchersBas: ['vide-sanitaire', 'dalle-beton'],
      planchersHaut: ['dalle-beton', 'toiture-terrasse'],
      positions: ['bas', 'intermediaire', 'haut']
    },
    couvertureComplete: true,
    criteresManquants: []
  };
  await campagne2.save();
  console.log('Campagne créée:', campagne2.nom);

  // ── 6. Locataires et Logements ───────────────────────────────
  // Résidence des Cèdres — 10 logements
  const locatairesR1 = await Locataire.bulkCreate([
    { prenom: 'Sophie',    nom: 'Moreau',   email: 'sophie.moreau@email.com',    telephone: '0612345601', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Antoine',   nom: 'Petit',    email: 'antoine.petit@email.com',    telephone: '0612345602', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Claire',    nom: 'Leroy',    email: 'claire.leroy@email.com',     telephone: '0612345603', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Marc',      nom: 'Bernard',  email: 'marc.bernard@email.com',     telephone: '0612345604', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Élodie',    nom: 'Dubois',   email: 'elodie.dubois@email.com',    telephone: '0612345605', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Hassan',    nom: 'Said',     email: 'hassan.said@email.com',      telephone: '0612345606', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Jeanne',    nom: 'Laurent',  email: 'jeanne.laurent@email.com',   telephone: '0612345607', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Philippe',  nom: 'Roux',     email: 'philippe.roux@email.com',    telephone: '0612345608', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Amina',     nom: 'Diallo',   email: 'amina.diallo@email.com',     telephone: '0612345609', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Gérard',    nom: 'Lambert',  email: 'gerard.lambert@email.com',   telephone: '0612345610', token_acces: crypto.randomBytes(32).toString('hex') }
  ]);

  const logements1 = await Logement.bulkCreate([
    { batiment_id: immeuble1.id, numero: '01',  etage: 0,  surface: 28,  loyer_estime: 550,  id_typologie: 1, id_type_plancher_bas: 1, id_type_plancher_haut: 3, position: 'bas',          statut: 'occupe', locataire_id: locatairesR1[0].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '02',  etage: 0,  surface: 38,  loyer_estime: 650,  id_typologie: 2, id_type_plancher_bas: 1, id_type_plancher_haut: 3, position: 'bas',          statut: 'occupe', locataire_id: locatairesR1[1].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '11',  etage: 1,  surface: 45,  loyer_estime: 720,  id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[2].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '12',  etage: 1,  surface: 60,  loyer_estime: 850,  id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[3].id, selectionne_visite: false },
    { batiment_id: immeuble1.id, numero: '21',  etage: 2,  surface: 65,  loyer_estime: 880,  id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[4].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '22',  etage: 2,  surface: 42,  loyer_estime: 700,  id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[5].id, selectionne_visite: false },
    { batiment_id: immeuble1.id, numero: '31',  etage: 3,  surface: 55,  loyer_estime: 800,  id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[6].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '32',  etage: 3,  surface: 78,  loyer_estime: 1050, id_typologie: 4, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR1[7].id, selectionne_visite: false },
    { batiment_id: immeuble1.id, numero: '41',  etage: 4,  surface: 82,  loyer_estime: 1100, id_typologie: 4, id_type_plancher_bas: 3, id_type_plancher_haut: 6, position: 'haut',         statut: 'occupe', locataire_id: locatairesR1[8].id, selectionne_visite: true  },
    { batiment_id: immeuble1.id, numero: '42',  etage: 4,  surface: 95,  loyer_estime: 1250, id_typologie: 5, id_type_plancher_bas: 3, id_type_plancher_haut: 6, position: 'haut',         statut: 'occupe', locataire_id: locatairesR1[9].id, selectionne_visite: true  }
  ]);
  console.log('Logements créés pour', immeuble1.nom, ':', logements1.length);

  // Le Belvédère — 6 logements
  const locatairesR2 = await Locataire.bulkCreate([
    { prenom: 'Nathalie',  nom: 'Fournier', email: 'nathalie.fournier@email.com', telephone: '0612345611', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Youssef',   nom: 'Benali',   email: 'youssef.benali@email.com',    telephone: '0612345612', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Caroline',  nom: 'Girard',   email: 'caroline.girard@email.com',   telephone: '0612345613', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Lucien',    nom: 'Mercier',  email: 'lucien.mercier@email.com',    telephone: '0612345614', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Fatima',    nom: 'Zahra',    email: 'fatima.zahra@email.com',      telephone: '0612345615', token_acces: crypto.randomBytes(32).toString('hex') },
    { prenom: 'Olivier',   nom: 'Renard',   email: 'olivier.renard@email.com',    telephone: '0612345616', token_acces: crypto.randomBytes(32).toString('hex') }
  ]);

  const logements2 = await Logement.bulkCreate([
    { batiment_id: immeuble2.id, numero: '101', etage: 1, surface: 48,  loyer_estime: 780,  id_typologie: 2, id_type_plancher_bas: 2, id_type_plancher_haut: 3, position: 'bas',          statut: 'occupe', locataire_id: locatairesR2[0].id, selectionne_visite: true  },
    { batiment_id: immeuble2.id, numero: '202', etage: 2, surface: 65,  loyer_estime: 920,  id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR2[1].id, selectionne_visite: false },
    { batiment_id: immeuble2.id, numero: '303', etage: 3, surface: 72,  loyer_estime: 980,  id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR2[2].id, selectionne_visite: true  },
    { batiment_id: immeuble2.id, numero: '404', etage: 4, surface: 85,  loyer_estime: 1100, id_typologie: 4, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR2[3].id, selectionne_visite: true  },
    { batiment_id: immeuble2.id, numero: '505', etage: 5, surface: 52,  loyer_estime: 830,  id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 3, position: 'intermediaire', statut: 'occupe', locataire_id: locatairesR2[4].id, selectionne_visite: false },
    { batiment_id: immeuble2.id, numero: '601', etage: 6, surface: 90,  loyer_estime: 1200, id_typologie: 4, id_type_plancher_bas: 3, id_type_plancher_haut: 6, position: 'haut',         statut: 'occupe', locataire_id: locatairesR2[5].id, selectionne_visite: true  }
  ]);
  console.log('Logements créés pour', immeuble2.nom, ':', logements2.length);

  // ── 7. Créneaux (Planning) ────────────────────────────────────
  // Résidence des Cèdres — 8 créneaux sur 2 jours
  const creneaux1 = [
    { id_logement: logements1[0].id, id_campagne: campagne1.id, date_visite: '2026-06-05', heure_debut: '09:00', heure_fin: '09:30', ordre_visite: 1, statut: 'reserve'   },
    { id_logement: logements1[1].id, id_campagne: campagne1.id, date_visite: '2026-06-05', heure_debut: '09:30', heure_fin: '10:00', ordre_visite: 2, statut: 'reserve'   },
    { id_logement: logements1[2].id, id_campagne: campagne1.id, date_visite: '2026-06-05', heure_debut: '10:00', heure_fin: '10:30', ordre_visite: 3, statut: 'confirme'  },
    { id_logement: logements1[3].id, id_campagne: campagne1.id, date_visite: '2026-06-05', heure_debut: '10:30', heure_fin: '11:00', ordre_visite: 4, statut: 'effectue'  },
    { id_logement: logements1[4].id, id_campagne: campagne1.id, date_visite: '2026-06-05', heure_debut: '11:00', heure_fin: '11:30', ordre_visite: 5, statut: 'propose'   },
    { id_logement: logements1[5].id, id_campagne: campagne1.id, date_visite: '2026-06-06', heure_debut: '09:00', heure_fin: '09:30', ordre_visite: 6, statut: 'reserve'   },
    { id_logement: logements1[6].id, id_campagne: campagne1.id, date_visite: '2026-06-06', heure_debut: '09:30', heure_fin: '10:00', ordre_visite: 7, statut: 'propose'   },
    { id_logement: logements1[7].id, id_campagne: campagne1.id, date_visite: '2026-06-06', heure_debut: '10:00', heure_fin: '10:30', ordre_visite: 8, statut: 'propose'   }
  ];
  await Creneau.bulkCreate(creneaux1);
  console.log('Créneaux créés pour', campagne1.nom, ':', creneaux1.length);

  // Le Belvédère — 4 créneaux
  const creneaux2 = [
    { id_logement: logements2[0].id, id_campagne: campagne2.id, date_visite: '2026-06-10', heure_debut: '09:00', heure_fin: '09:30', ordre_visite: 1, statut: 'effectue' },
    { id_logement: logements2[2].id, id_campagne: campagne2.id, date_visite: '2026-06-10', heure_debut: '09:30', heure_fin: '10:00', ordre_visite: 2, statut: 'effectue' },
    { id_logement: logements2[3].id, id_campagne: campagne2.id, date_visite: '2026-06-10', heure_debut: '10:00', heure_fin: '10:30', ordre_visite: 3, statut: 'confirme' },
    { id_logement: logements2[5].id, id_campagne: campagne2.id, date_visite: '2026-06-10', heure_debut: '10:30', heure_fin: '11:00', ordre_visite: 4, statut: 'confirme' }
  ];
  await Creneau.bulkCreate(creneaux2);
  console.log('Créneaux créés pour', campagne2.nom, ':', creneaux2.length);

  // ── 8. Emails envoyés (pour l'onglet Émails) ─────────────────
  await EmailEnvoye.bulkCreate([
    { id_locataire: locatairesR1[0].id, id_campagne: campagne1.id, type: 'visite_programmee', statut: 'envoye',  destinataire: locatairesR1[0].email, sujet: 'Visite programmée - Résidence des Cèdres' },
    { id_locataire: locatairesR1[1].id, id_campagne: campagne1.id, type: 'visite_programmee', statut: 'ouvert',  destinataire: locatairesR1[1].email, sujet: 'Visite programmée - Résidence des Cèdres' },
    { id_locataire: locatairesR1[2].id, id_campagne: campagne1.id, type: 'visite_programmee', statut: 'clique',  destinataire: locatairesR1[2].email, sujet: 'Visite programmée - Résidence des Cèdres' },
    { id_locataire: locatairesR1[3].id, id_campagne: campagne1.id, type: 'pas_de_visite',      statut: 'envoye',  destinataire: locatairesR1[3].email, sujet: 'Information - Pas de visite programmée' },
    { id_locataire: locatairesR1[4].id, id_campagne: campagne1.id, type: 'visite_programmee', statut: 'envoye',  destinataire: locatairesR1[4].email, sujet: 'Visite programmée - Résidence des Cèdres' },
    { id_locataire: locatairesR1[5].id, id_campagne: campagne1.id, type: 'pas_de_visite',      statut: 'echoue',  destinataire: locatairesR1[5].email, sujet: 'Information - Pas de visite programmée' },
    { id_locataire: locatairesR2[0].id, id_campagne: campagne2.id, type: 'visite_programmee', statut: 'effectue', destinataire: locatairesR2[0].email, sujet: 'Visite programmée - Le Belvédère' }
  ]);
  console.log('Emails créés');

  // ── Résumé ───────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  Données insérées avec succès !');
  console.log('========================================');
  console.log('Entrepreneur:    nadir@diagnostic.fr / test123');
  console.log('Immeubles:       Résidence des Cèdres, Le Belvédère');
  console.log('Campagnes:       2 (1 ouverte, 1 planifiée)');
  console.log('Logements:       Résidence des Cèdres: 10, Le Belvédère: 6');
  console.log('Locataires:      16');
  console.log('Jours dispo:     6');
  console.log('Créneaux:        Résidence des Cèdres: 8, Le Belvédère: 4');
  console.log('Emails:          7');
  console.log('========================================\n');

  await sequelize.close();
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
