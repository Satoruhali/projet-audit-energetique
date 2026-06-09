require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sequelize } = require('./models');
const Entrepreneur = require('./models/Entrepreneur');
const Immeuble = require('./models/Immeuble');
const Campagne = require('./models/Campagne');
const Logement = require('./models/Logement');
const Locataire = require('./models/Locataire');
const Creneau = require('./models/Creneau');
const JoursDisponible = require('./models/JoursDisponible');
const Typologie = require('./models/Typologie');
const TypePlancher = require('./models/TypePlancher');

async function seed() {
  await sequelize.authenticate();
  console.log('MySQL connecté');

  await sequelize.sync({ force: true });
  console.log('Tables créées');

  // 1. Référentiels
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
    { categorie: 'bas', nom: 'dalle-béton', description: 'Dalle béton' },
    { categorie: 'bas', nom: 'sous-sol', description: 'Sur sous-sol' },
    { categorie: 'haut', nom: 'combles-perdus', description: 'Combles non aménagés' },
    { categorie: 'haut', nom: 'toiture-terrasse', description: 'Toiture terrasse' },
    { categorie: 'haut', nom: 'rampants', description: 'Rampants' }
  ]);

  console.log('Référentiels créés');

  // 2. Entrepreneur
  const entrepreneur = await Entrepreneur.create({
    nom: 'Test Diagnostic',
    email: 'test@diag.fr',
    mot_de_passe_hash: 'password123',
    telephone: '0601020304'
  });
  console.log('Entrepreneur créé:', entrepreneur.email);

  // 3. Jours disponibles (3 jours)
  await JoursDisponible.bulkCreate([
    { id_entrepreneur: entrepreneur.id, date: '2026-06-10', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-12', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-15', est_disponible: true }
  ]);
  console.log('3 jours disponibles créés');

  // 4. Immeuble
  const immeuble = await Immeuble.create({
    nom: 'Résidence des Alpes',
    adresse: '25 avenue des Sommets, 74000 Annecy',
    nb_etages: 10,
    id_entrepreneur: entrepreneur.id
  });
  console.log('Immeuble créé:', immeuble.nom);

  // 5. Campagne
  const campagne = await Campagne.create({
    batiment_id: immeuble.id,
    nom: 'Campagne Test - Juin 2026',
    date_debut_possible: '2026-06-01',
    date_fin_possible: '2026-06-30',
    statut: 'en_cours',
    nb_min_visites: 5,
    pct_min_visites: 60.00,
    selection: {
      date_selection: new Date().toISOString(),
      seuil_requis: 3,
      seuil_obtenu: 5,
      couverture: {
        typologies: ['T1', 'T2', 'T3'],
        planchersBas: ['terre-plein', 'vide-sanitaire', 'dalle-béton', 'sous-sol'],
        planchersHaut: ['combles-perdus', 'toiture-terrasse', 'rampants'],
        positions: ['bas', 'intermediaire', 'haut']
      },
      couvertureComplete: true,
      criteresManquants: []
    }
  });
  console.log('Campagne créée:', campagne.nom);

  // 6. Dix logements avec diversité de critères
  const logementsData = [
    { numero: '101', etage: 0, surface: 45, loyer_estime: 800, id_typologie: 2, id_type_plancher_bas: 1, id_type_plancher_haut: 5, position: 'bas', statut: 'occupe', selectionne_visite: true },
    { numero: '201', etage: 1, surface: 55, loyer_estime: 950, id_typologie: 3, id_type_plancher_bas: 1, id_type_plancher_haut: 5, position: 'bas', statut: 'occupe', selectionne_visite: true },
    { numero: '301', etage: 2, surface: 30, loyer_estime: 600, id_typologie: 1, id_type_plancher_bas: 2, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe', selectionne_visite: true },
    { numero: '401', etage: 3, surface: 42, loyer_estime: 780, id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe', selectionne_visite: true },
    { numero: '501', etage: 4, surface: 60, loyer_estime: 1050, id_typologie: 3, id_type_plancher_bas: 4, id_type_plancher_haut: 7, position: 'intermediaire', statut: 'libre', selectionne_visite: false },
    { numero: '601', etage: 5, surface: 28, loyer_estime: 580, id_typologie: 1, id_type_plancher_bas: 2, id_type_plancher_haut: 5, position: 'intermediaire', statut: 'occupe', selectionne_visite: false },
    { numero: '701', etage: 6, surface: 48, loyer_estime: 880, id_typologie: 2, id_type_plancher_bas: 3, id_type_plancher_haut: 7, position: 'intermediaire', statut: 'occupe', selectionne_visite: true },
    { numero: '801', etage: 7, surface: 65, loyer_estime: 1150, id_typologie: 3, id_type_plancher_bas: 1, id_type_plancher_haut: 6, position: 'intermediaire', statut: 'occupe', selectionne_visite: false },
    { numero: '901', etage: 8, surface: 44, loyer_estime: 820, id_typologie: 2, id_type_plancher_bas: 4, id_type_plancher_haut: 5, position: 'intermediaire', statut: 'libre', selectionne_visite: false },
    { numero: '1001', etage: 9, surface: 70, loyer_estime: 1250, id_typologie: 3, id_type_plancher_bas: 3, id_type_plancher_haut: 7, position: 'haut', statut: 'occupe', selectionne_visite: true },
  ];

  const logements = [];
  for (const data of logementsData) {
    const l = await Logement.create({ ...data, batiment_id: immeuble.id });
    logements.push(l);
  }
  console.log('10 logements créés');

  // 7. Sept locataires — on associe les logements 0,1,2,3,5,6,7
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
  const locataires = [];

  for (let i = 0; i < locatairesData.length; i++) {
    const locataire = await Locataire.create({
      ...locatairesData[i],
      token_acces: crypto.randomBytes(32).toString('hex')
    });
    locataires.push(locataire);

    await Logement.update(
      { locataire_id: locataire.id },
      { where: { id: logements[logementsAvecLocataire[i]].id } }
    );
  }
  console.log('7 locataires créés et liés aux logements');

  // 8. Cinq créneaux pour simuler des réservations
  const creneauxData = [
    { logementIdx: 0, date: '2026-06-10', debut: '09:00', fin: '09:30' },
    { logementIdx: 1, date: '2026-06-10', debut: '09:45', fin: '10:15' },
    { logementIdx: 2, date: '2026-06-10', debut: '10:30', fin: '11:00' },
    { logementIdx: 3, date: '2026-06-12', debut: '09:00', fin: '09:30' },
    { logementIdx: 6, date: '2026-06-12', debut: '09:45', fin: '10:15' },
  ];

  for (const cd of creneauxData) {
    await Creneau.create({
      id_logement: logements[cd.logementIdx].id,
      id_campagne: campagne.id,
      date_visite: cd.date,
      heure_debut: cd.debut,
      heure_fin: cd.fin,
      ordre_visite: 0,
      statut: 'reserve'
    });
  }
  console.log('5 créneaux créés (3 le 10/06, 2 le 12/06)');

  // Résumé
  console.log('\n=== RÉSUMÉ ===');
  console.log('Entrepreneur:       test@diag.fr / password123');
  console.log('Immeuble:          ' + immeuble.nom);
  console.log('Campagne:          ' + campagne.nom);
  console.log('Logements:         10');
  console.log('  Sélectionnés:    ' + logements.filter(l => l.selectionne_visite).length);
  console.log('  Avec locataire:  ' + locataires.length);
  console.log('  Avec créneau:    ' + creneauxData.length);

  console.log('\n--- Locataires ---');
  for (let i = 0; i < locataires.length; i++) {
    const li = logementsAvecLocataire[i];
    const l = logements[li];
    const loc = locataires[i];
    const creneau = creneauxData.find(cd => cd.logementIdx === li);
    console.log('  ' + l.numero + ' → ' + loc.prenom + ' ' + loc.nom + ' (' + loc.email + ')' + (creneau ? ' [créneau]' : ''));
  }

  console.log('\nPour envoyer les emails (5+ attendus) :');
  console.log('  1. Lance le serveur: npm run dev');
  console.log('  2. Login: test@diag.fr / password123');
  console.log('  3. Va sur /detail?id=' + campagne.id);
  console.log('  4. Onglet "Emails" → cliquer "Envoyer les emails"');
  console.log('  Ou via curl :');
  const port = process.env.PORT || 3000;
  console.log(`    curl -X POST http://localhost:${port}/api/auth/login \\`);
  console.log('      -H "Content-Type: application/json" \\');
  console.log('      -d \'{"email":"test@diag.fr","mot_de_passe":"password123"}\'');
  console.log('    (récupérer le token, puis)');
  console.log(`    curl -X POST http://localhost:${port}/api/entrepreneur/campagnes/${campagne.id}/envoyer-emails \\`);
  console.log('      -H "Authorization: Bearer <TOKEN>"');

  console.log('\nPour voir le planning optimisé :');
  console.log(`  http://localhost:${port}/planning?id=${campagne.id}`);
  console.log('  5 locataires ont des créneaux → ils apparaîtront dans le planning');
  console.log('  2 locataires sans créneau → en "attente"');

  await sequelize.close();
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
