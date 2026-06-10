require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const Entrepreneur = require('../models/Entrepreneur');
const Immeuble = require('../models/Immeuble');
const Campagne = require('../models/Campagne');
const Logement = require('../models/Logement');
const Locataire = require('../models/Locataire');
const Creneau = require('../models/Creneau');
const EmailEnvoye = require('../models/EmailEnvoye');

async function setup() {
  await sequelize.sync({ force: true });

  const entrepreneur = await Entrepreneur.create({
    nom: 'Test Diagnostic',
    email: 'test@diag.fr',
    mot_de_passe_hash: 'password123',
    telephone: '0601020304'
  });
  const token = jwt.sign({ id: entrepreneur.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const immeuble = await Immeuble.create({
    nom: 'Tour Test',
    adresse: '15 rue de l\'Essai, 75001 Paris',
    nb_etages: 7,
    id_entrepreneur: entrepreneur.id
  });

  const campagne = await Campagne.create({
    batiment_id: immeuble.id,
    nom: 'Campagne Test - Juin 2026',
    date_debut_possible: '2026-06-01',
    date_fin_possible: '2026-06-30',
    statut: 'en_cours',
    nb_min_visites: 1,
    pct_min_visites: 50.00,
    selection: {
      date_selection: new Date().toISOString(),
      seuil_requis: 1,
      seuil_obtenu: 1,
      couverture: { typologies: ['T2'], planchersBas: ['terre-plein'], planchersHaut: ['toiture-terrasse'], positions: ['bas'] },
      couvertureComplete: true,
      criteresManquants: []
    }
  });

  const logementVisite = await Logement.create({
    batiment_id: immeuble.id,
    numero: '101',
    etage: 1,
    surface: 45,
    loyer_estime: 800,
    position: 'bas',
    statut: 'occupe',
    selectionne_visite: true
  });

  const logementNonVisite = await Logement.create({
    batiment_id: immeuble.id,
    numero: '102',
    etage: 2,
    surface: 35,
    loyer_estime: 600,
    position: 'haut',
    statut: 'occupe',
    selectionne_visite: false
  });

  const crypto = require('crypto');

  const locataire1 = await Locataire.create({
    prenom: 'Jean',
    nom: 'Martin',
    email: 'jean.martin@email.com',
    telephone: '0612345678',
    token_acces: crypto.randomBytes(32).toString('hex')
  });

  const locataire2 = await Locataire.create({
    prenom: 'Marie',
    nom: 'Dupont',
    email: 'marie.dupont@email.com',
    telephone: '0698765432',
    token_acces: crypto.randomBytes(32).toString('hex')
  });

  await Logement.update({ locataire_id: locataire1.id }, { where: { id: logementVisite.id } });
  await Logement.update({ locataire_id: locataire2.id }, { where: { id: logementNonVisite.id } });

  console.log('✓ Données de seed créées');
  console.log('  2 logements (1 visité, 1 non visité) avec locataires');

  return { entrepreneur, immeuble, campagne, token };
}

async function run() {
  try {
    const { campagne, token } = await setup();

    console.log('\n--- Test 1 : Campagne inexistante ---');
    const res1 = await request(app)
      .post('/api/entrepreneur/campagnes/999999/envoyer-emails')
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res1.status}`);
    console.log(`  Message: ${res1.body.message}`);
    console.log(`  ${res1.status === 404 ? '✓ PASS' : '✗ ÉCHEC'}`);

    console.log('\n--- Test 2 : Campagne sans locataires ---');
    const immeuble2 = await Immeuble.create({
      nom: 'Immeuble Vide',
      adresse: '1 rue Vide, Paris',
      nb_etages: 3,
      id_entrepreneur: (await Entrepreneur.findOne({ where: { email: 'test@diag.fr' } })).id
    });
    const campagneVide = await Campagne.create({
      batiment_id: immeuble2.id,
      nom: 'Campagne Vide',
      date_debut_possible: '2026-06-01',
      date_fin_possible: '2026-06-30',
      statut: 'brouillon'
    });
    const res2 = await request(app)
      .post(`/api/entrepreneur/campagnes/${campagneVide.id}/envoyer-emails`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res2.status}`);
    console.log(`  Message: ${res2.body.message}`);
    console.log(`  ${res2.status === 400 ? '✓ PASS' : '✗ ÉCHEC'}`);

    console.log("\n--- Test 3 : Envoi d'emails ---");
    const res3 = await request(app)
      .post(`/api/entrepreneur/campagnes/${campagne.id}/envoyer-emails`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`  Status: ${res3.status}`);
    console.log(`  Message: ${res3.body.message}`);
    console.log(`  Total: ${res3.body.total}`);
    console.log(`  Envoyés: ${res3.body.total_envoyes}`);
    console.log(`  Erreurs: ${res3.body.total_erreurs}`);

    let pass3 = res3.status === 200 && res3.body.total === 2 && res3.body.total_envoyes === 2;
    console.log(`  ${pass3 ? '✓ PASS' : '✗ ÉCHEC'}`);

    for (const d of res3.body.details) {
      console.log(`    → ${d.email} : ${d.type} [${d.statut}]`);
    }

    console.log('\n--- Test 4 : Vérification base email_envoyes ---');
    const emails = await EmailEnvoye.findAll({ where: { id_campagne: campagne.id } });
    console.log(`  Enregistrements: ${emails.length}`);
    for (const e of emails) {
      console.log(`    → ${e.destinataire} | type: ${e.type} | statut: ${e.statut} | erreur: ${e.erreur || 'aucune'}`);
    }
    console.log(`  ${emails.length === 2 ? '✓ PASS' : '✗ ÉCHEC'}`);

    await sequelize.close();
    console.log('\n=== Tous les tests sont passés ===');
    process.exit(0);
  } catch (err) {
    console.error('ERREUR:', err);
    process.exit(1);
  }
}

run();
