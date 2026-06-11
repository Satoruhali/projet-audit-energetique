require('dotenv').config();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize } = require('./models');
const Entrepreneur = require('./models/Entrepreneur');
const Immeuble = require('./models/Immeuble');
const Campagne = require('./models/Campagne');
const Logement = require('./models/Logement');
const Locataire = require('./models/Locataire');
const JoursDisponible = require('./models/JoursDisponible');
const Typologie = require('./models/Typologie');
const TypePlancher = require('./models/TypePlancher');
const { lancerSelection } = require('./services/setCoverService');

async function seed() {
  await sequelize.authenticate();
  console.log('Base de données connectée\n');

  // 1. Référentiels
  const typologiesData = [
    { code: 'T1', nb_pieces: 1, surface_min_m2: 20, surface_max_m2: 35 },
    { code: 'T2', nb_pieces: 2, surface_min_m2: 35, surface_max_m2: 50 },
    { code: 'T3', nb_pieces: 3, surface_min_m2: 50, surface_max_m2: 70 },
    { code: 'T4', nb_pieces: 4, surface_min_m2: 70, surface_max_m2: 90 },
    { code: 'T5', nb_pieces: 5, surface_min_m2: 90, surface_max_m2: 110 },
    { code: 'T6', nb_pieces: 6, surface_min_m2: 110, surface_max_m2: 130 }
  ];
  for (const data of typologiesData) {
    await Typologie.findOrCreate({ where: { code: data.code }, defaults: data });
  }

  const typesPlancherData = [
    { categorie: 'bas', nom: 'terre-plein', description: 'Sur terre-plein' },
    { categorie: 'bas', nom: 'vide-sanitaire', description: 'Sur vide sanitaire' },
    { categorie: 'bas', nom: 'dalle-beton', description: 'Dalle béton' },
    { categorie: 'bas', nom: 'sous-sol', description: 'Sur sous-sol' },
    { categorie: 'haut', nom: 'combles-perdus', description: 'Combles non aménagés' },
    { categorie: 'haut', nom: 'toiture-terrasse', description: 'Toiture terrasse' },
    { categorie: 'haut', nom: 'rampants', description: 'Rampants' }
  ];
  for (const data of typesPlancherData) {
    await TypePlancher.findOrCreate({ where: { nom: data.nom }, defaults: data });
  }
  console.log('✔ Référentiels OK');

  // 2. Entrepreneur
  const [entrepreneur] = await Entrepreneur.findOrCreate({
    where: { email: 'test@diag.fr' },
    defaults: {
      nom: 'Test Diagnostic',
      email: 'test@diag.fr',
      mot_de_passe_hash: 'password123',
      telephone: '0601020304'
    }
  });
  console.log('✔ Entrepreneur : test@diag.fr / password123');

  // 3. Jours disponibles (3 jours dans le futur)
  const today = new Date();
  const jours = [];
  for (let i = 3; i <= 10; i += 3) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    jours.push(d.toISOString().split('T')[0]);
  }
  await JoursDisponible.destroy({ where: { id_entrepreneur: entrepreneur.id } });
  await JoursDisponible.bulkCreate(
    jours.map(date => ({ id_entrepreneur: entrepreneur.id, date, est_disponible: true }))
  );
  console.log('✔ Jours disponibles :', jours.join(', '));

  // 4. Immeuble
  const immeubleNom = 'Résidence Test - ' + today.toISOString().split('T')[0];
  const [immeuble] = await Immeuble.findOrCreate({
    where: { nom: immeubleNom, id_entrepreneur: entrepreneur.id },
    defaults: {
      nom: immeubleNom,
      adresse: '25 avenue des Tests, 74000 Annecy',
      nb_etages: 5,
      id_entrepreneur: entrepreneur.id
    }
  });
  console.log('✔ Immeuble :', immeuble.nom);

  // 5. Campagne
  const campagneNom = 'Campagne Email Test - ' + today.toISOString().split('T')[0];
  const [campagne] = await Campagne.findOrCreate({
    where: { nom: campagneNom, batiment_id: immeuble.id },
    defaults: {
      batiment_id: immeuble.id,
      nom: campagneNom,
      date_debut_possible: today.toISOString().split('T')[0],
      date_fin_possible: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statut: 'en_cours',
      nb_min_visites: 3,
      pct_min_visites: 50.00
    }
  });
  console.log('✔ Campagne :', campagne.nom, '(id:', campagne.id, ')');

  // 6. Logements avec diversité
  await Logement.destroy({ where: { batiment_id: immeuble.id } });

  const logementsData = [
    { numero: '101', etage: 0, surface: 45, loyer_estime: 800, id_typologie: 2, id_type_plancher_bas: 1, id_type_plancher_haut: 5, position: 'bas', statut: 'occupe' },
    { numero: '201', etage: 1, surface: 55, loyer_estime: 950, id_typologie: 3, id_type_plancher_bas: 1, id_type_plancher_haut: 5, position: 'bas', statut: 'occupe' },
    { numero: '301', etage: 2, surface: 30, loyer_estime: 600, id_typologie: 1, id_type_plancher_bas: 2, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe' },
    { numero: '401', etage: 3, surface: 42, loyer_estime: 780, id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe' },
    { numero: '501', etage: 4, surface: 60, loyer_estime: 1050, id_typologie: 3, id_type_plancher_bas: 4, id_type_plancher_haut: 7, position: 'intermediaire', statut: 'libre' },
    { numero: '601', etage: 5, surface: 28, loyer_estime: 580, id_typologie: 1, id_type_plancher_bas: 2, id_type_plancher_haut: 5, position: 'intermediaire', statut: 'occupe' },
    { numero: '701', etage: 6, surface: 48, loyer_estime: 880, id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 7, position: 'intermediaire', statut: 'occupe' },
    { numero: '801', etage: 7, surface: 65, loyer_estime: 1150, id_typologie: 3, id_type_plancher_bas: 1, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe' },
    { numero: '901', etage: 8, surface: 44, loyer_estime: 820, id_typologie: 2, id_type_plancher_bas: 4, id_type_plancher_haut: 5, position: 'intermediaire', statut: 'libre' },
    { numero: '1001', etage: 9, surface: 70, loyer_estime: 1250, id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 7, position: 'haut', statut: 'occupe' },
  ];

  const logements = [];
  for (const data of logementsData) {
    const l = await Logement.create({ ...data, batiment_id: immeuble.id });
    logements.push(l);
  }
  console.log('✔ 10 logements créés');

  // 7. Locataires (7 sur 10 logements)
  const locatairesEmails = [
    'marie.dupont@email.com',
    'pierre.durand@email.com',
    'sophie.leroy@email.com',
    'lucas.moreau@email.com',
    'emma.fournier@email.com',
    'hugo.bernard@email.com',
    'camille.petit@email.com',
  ];
  await Locataire.destroy({ where: { email: locatairesEmails } });

  const locatairesData = [
    { prenom: 'Marie', nom: 'Dupont', email: 'marie.dupont@email.com', telephone: '0612345678' },
    { prenom: 'Pierre', nom: 'Durand', email: 'pierre.durand@email.com', telephone: '0623456789' },
    { prenom: 'Sophie', nom: 'Leroy', email: 'sophie.leroy@email.com', telephone: '0634567890' },
    { prenom: 'Lucas', nom: 'Moreau', email: 'lucas.moreau@email.com', telephone: '0645678901' },
    { prenom: 'Emma', nom: 'Fournier', email: 'emma.fournier@email.com', telephone: '0656789012' },
    { prenom: 'Hugo', nom: 'Bernard', email: 'hugo.bernard@email.com', telephone: '0667890123' },
    { prenom: 'Camille', nom: 'Petit', email: 'camille.petit@email.com', telephone: '0678901234' },
  ];

  const logementsAvecLocataire = [0, 1, 2, 3, 5, 6, 7];

  for (let i = 0; i < locatairesData.length; i++) {
    const idx = logementsAvecLocataire[i];
    const locataire = await Locataire.create({
      ...locatairesData[i],
      token_acces: crypto.randomBytes(32).toString('hex')
    });
    await Logement.update(
      { locataire_id: locataire.id },
      { where: { id: logements[idx].id } }
    );
    await logements[idx].reload();
  }
  console.log('✔ 7 locataires créés et liés aux logements');

  // 8. Lancer la sélection (set-cover)
  const allLogements = await Logement.findAll({
    where: { batiment_id: immeuble.id },
    include: [
      { model: Typologie, attributes: ['code'] },
      { model: TypePlancher, as: 'plancherBas', attributes: ['nom'] },
      { model: TypePlancher, as: 'plancherHaut', attributes: ['nom'] }
    ]
  });

  const logementsDataForSelection = allLogements.map(l => {
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

  const resultat = lancerSelection(logementsDataForSelection);

  await Logement.update(
    { selectionne_visite: true },
    { where: { id: { [Op.in]: resultat.selectionnes }, batiment_id: immeuble.id } }
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

  console.log(`✔ Sélection terminée : ${resultat.selectionnes.length} logements sélectionnés pour visite`);

  // Résumé
  console.log('\n═══════════════════════════════════════');
  console.log('  CAMPAGNE PRÊTE — Plus qu\'à envoyer !');
  console.log('═══════════════════════════════════════\n');
  console.log('  Login  : test@diag.fr');
  console.log('  Mot de passe : password123');
  console.log('  Campagne ID  :', campagne.id);
  console.log('\n  Étapes :');
  console.log('  1. Lance le serveur : npm run dev');
  console.log('  2. Connecte-toi sur http://localhost:3001/auth');
  console.log('  3. Va sur la campagne : http://localhost:3001/detail?id=' + campagne.id);
  console.log('  4. Onglet "Échantillonnage" → vérifie la sélection');
  console.log('  5. Onglet "Emails" → clique "Envoyer les emails"');
  console.log('\n  Les emails partiront via Mailtrap (sandbox).');
  console.log('  Voir les logs dans le terminal du serveur.\n');

  await sequelize.close();
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
