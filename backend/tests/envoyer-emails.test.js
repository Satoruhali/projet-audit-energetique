require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const Entrepreneur = require('../models/Entrepreneur');
const Immeuble = require('../models/Immeuble');
const Campagne = require('../models/Campagne');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const Creneau = require('../models/Creneau');
const EmailEnvoye = require('../models/EmailEnvoye');

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    Entrepreneur.deleteMany({}),
    Immeuble.deleteMany({}),
    Campagne.deleteMany({}),
    Logement.deleteMany({}),
    Locataire.deleteMany({}),
    Creneau.deleteMany({}),
    EmailEnvoye.deleteMany({})
  ]);
  console.log('✓ Base nettoyée');

  const entrepreneur = await Entrepreneur.create({
    nom: 'Test Diagnostic',
    email: 'test@diag.fr',
    motDePasse: 'password123',
    telephone: '0601020304',
    entreprise: 'Test Diagnostic SARL',
    role: 'entrepreneur'
  });
  const token = jwt.sign({ id: entrepreneur._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const immeuble = await Immeuble.create({
    nom: 'Tour Test',
    adresse: '15 rue de l\'Essai, 75001 Paris',
    typologie: 'T2',
    annee_construction: 2000,
    plancher_bas: 'terre-plein',
    plancher_haut: 'toiture-terrasse',
    surface_totale: 2500,
    nombre_etages: 7,
    id_entrepreneur: entrepreneur._id
  });

  const campagne = await Campagne.create({
    immeuble_id: immeuble._id,
    nom: 'Campagne Test - Juin 2026',
    statut: 'en_cours',
    jours_disponibles: [new Date('2026-06-05'), new Date('2026-06-06')],
    selection: {
      date_selection: new Date(),
      seuil_requis: 1,
      seuil_obtenu: 1,
      couverture: { typologies: ['T2'], planchersBas: ['terre-plein'], planchersHaut: ['toiture-terrasse'], positions: ['bas'] },
      couvertureComplete: true,
      criteresManquants: []
    }
  });

  // Logement VISITÉ (selectionne_visite: true)
  const logementVisite = await Logement.create({
    campagne_id: campagne._id,
    numero: '101',
    etage: 1,
    surface: 45,
    loyer_estime: 800,
    typologie: 'T2',
    plancher_bas: 'terre-plein',
    plancher_haut: 'toiture-terrasse',
    position: 'bas',
    statut: 'occupe',
    selectionne_visite: true
  });

  // Logement NON VISITÉ (selectionne_visite: false)
  const logementNonVisite = await Logement.create({
    campagne_id: campagne._id,
    numero: '102',
    etage: 2,
    surface: 35,
    loyer_estime: 600,
    typologie: 'T1',
    plancher_bas: 'terre-plein',
    plancher_haut: 'toiture-terrasse',
    position: 'haut',
    statut: 'occupe',
    selectionne_visite: false
  });

  const crypto = require('crypto');

  // Locataire du logement VISITÉ (avec email)
  await Locataire.create({
    campagne_id: campagne._id,
    logement_id: logementVisite._id,
    nom: 'Martin',
    prenom: 'Jean',
    email: 'jean.martin@email.com',
    telephone: '0612345678',
    date_entree: new Date('2020-01-15'),
    token: crypto.randomBytes(32).toString('hex')
  });

  // Locataire du logement NON VISITÉ (avec email)
  await Locataire.create({
    campagne_id: campagne._id,
    logement_id: logementNonVisite._id,
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@email.com',
    telephone: '0698765432',
    date_entree: new Date('2019-06-01'),
    token: crypto.randomBytes(32).toString('hex')
  });

  console.log('✓ Données de seed créées');
  console.log('  2 logements (1 visité, 1 non visité) avec locataires');

  return { entrepreneur, immeuble, campagne, token };
}

async function run() {
  try {
    const { campagne, token } = await setup();

    // Test 1 : Campagne inexistante => 404
    console.log('\n--- Test 1 : Campagne inexistante ---');
    const res1 = await request(app)
      .post('/api/entrepreneur/campagnes/000000000000000000000000/envoyer-emails')
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res1.status}`);
    console.log(`  Message: ${res1.body.message}`);
    console.log(`  ${res1.status === 404 ? '✓ PASS' : '✗ ÉCHEC'}`);

    // Test 2 : Aucun locataire (créer une campagne vide)
    console.log('\n--- Test 2 : Aucun locataire avec email ---');
    const immeuble2 = await Immeuble.create({
      nom: 'Immeuble Vide',
      adresse: '1 rue Vide, Paris',
      typologie: 'T1',
      annee_construction: 2010,
      plancher_bas: 'dalle-béton',
      plancher_haut: 'toiture-terrasse',
      surface_totale: 500,
      nombre_etages: 3,
      id_entrepreneur: (await Entrepreneur.findOne({ email: 'test@diag.fr' }))._id
    });
    const campagneVide = await Campagne.create({
      immeuble_id: immeuble2._id,
      nom: 'Campagne Vide',
      statut: 'brouillon'
    });
    const res2 = await request(app)
      .post(`/api/entrepreneur/campagnes/${campagneVide._id}/envoyer-emails`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res2.status}`);
    console.log(`  Message: ${res2.body.message}`);
    console.log(`  ${res2.status === 400 ? '✓ PASS' : '✗ ÉCHEC'}`);

    // Test 3 : Envoi réussi avec les 2 types de template
    console.log("\n--- Test 3 : Envoi d'emails ---");
    const res3 = await request(app)
      .post(`/api/entrepreneur/campagnes/${campagne._id}/envoyer-emails`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res3.status}`);
    console.log(`  Message: ${res3.body.message}`);
    console.log(`  Total: ${res3.body.total}`);
    console.log(`  Envoyés: ${res3.body.total_envoyes}`);
    console.log(`  Erreurs: ${res3.body.total_erreurs}`);

    let pass3 = res3.status === 200 && res3.body.total === 2 && res3.body.total_envoyes === 2;
    console.log(`  ${pass3 ? '✓ PASS' : '✗ ÉCHEC'}`);

    // Afficher les détails
    for (const d of res3.body.details) {
      console.log(`    → ${d.email} : ${d.type} [${d.statut}]`);
    }

    // Test 4 : Vérifier les enregistrements en base
    console.log('\n--- Test 4 : Vérification base email_envoyes ---');
    const emails = await EmailEnvoye.find({ campagne_id: campagne._id }).lean();
    console.log(`  Enregistrements: ${emails.length}`);
    for (const e of emails) {
      console.log(`    → ${e.destinataire} | type: ${e.type} | statut: ${e.statut} | erreur: ${e.erreur || 'aucune'}`);
    }
    console.log(`  ${emails.length === 2 ? '✓ PASS' : '✗ ÉCHEC'}`);

    // Nettoyage
    await Promise.all([
      Entrepreneur.deleteMany({}),
      Immeuble.deleteMany({}),
      Campagne.deleteMany({}),
      Logement.deleteMany({}),
      Locataire.deleteMany({}),
      Creneau.deleteMany({}),
      EmailEnvoye.deleteMany({})
    ]);
    console.log('\n✓ Nettoyage terminé');

    await mongoose.disconnect();
    console.log('\n=== Tous les tests sont passés ===');
    process.exit(0);
  } catch (err) {
    console.error('ERREUR:', err);
    process.exit(1);
  }
}

run();
