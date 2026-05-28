const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Entrepreneur = require('./models/Entrepreneur');
const Immeuble = require('./models/Immeuble');

const API_BASE = 'http://localhost:3001';
let TOKEN = '';
let ENTREPRENEUR = null;
let IMMEUBLE = null;
let CAMPAGNE_ID = null;
let PASS = 0;
let FAIL = 0;

function log(msg) { console.log(`  ${msg}`); }
function success(msg) { console.log(`  ✅ ${msg}`); PASS++; }
function fail(msg) { console.log(`  ❌ ${msg}`); FAIL++; }

function requete(method, path, body = null) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost', port: 3001,
      path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (TOKEN) opts.headers['Authorization'] = `Bearer ${TOKEN}`;
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: `Erreur réseau: ${e.message}` }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('\n========================================');
  console.log('  TEST AUTOMATIQUE DES ROUTES API');
  console.log('========================================\n');

  // 1. Connexion MongoDB
  console.log('[1] Connexion à MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    success('Connecté à MongoDB');
  } catch (e) {
    fail(`Impossible de se connecter à MongoDB: ${e.message}`);
    process.exit(1);
  }

  // 2. Récupération d'un entrepreneur existant
  console.log('\n[2] Recherche d\'un entrepreneur...');
  ENTREPRENEUR = await Entrepreneur.findOne().select('+motDePasse');
  if (!ENTREPRENEUR) {
    fail('Aucun entrepreneur trouvé dans la base');
    console.log('\nCréation d\'un entrepreneur de test...');
    ENTREPRENEUR = await Entrepreneur.create({
      nom: 'Test Entrepreneur', email: 'test@test.com',
      motDePasse: 'password123', telephone: '0102030405',
      entreprise: 'Test SAS'
    });
    success('Entrepreneur de test créé');
  } else {
    success(`Entrepreneur trouvé: ${ENTREPRENEUR.nom} (${ENTREPRENEUR.email})`);
  }

  // 3. Génération du token JWT
  console.log('\n[3] Génération du token JWT...');
  TOKEN = ENTREPRENEUR.genererToken();
  success('Token JWT généré');

  // 4. Récupération d'un immeuble existant (ou création)
  console.log('\n[4] Recherche d\'un immeuble...');
  IMMEUBLE = await Immeuble.findOne({ id_entrepreneur: ENTREPRENEUR._id });
  if (!IMMEUBLE) {
    log('Aucun immeuble trouvé, création...');
    IMMEUBLE = await Immeuble.create({
      nom: 'Test Immeuble', adresse: '1 rue de Test, Paris',
      typologie: 'T2', annee_construction: 2020,
      plancher_bas: 'Dalle béton', plancher_haut: 'Toiture terrasse',
      surface_totale: 500, nombre_etages: 3,
      id_entrepreneur: ENTREPRENEUR._id
    });
    success('Immeuble de test créé');
  } else {
    success(`Immeuble trouvé: ${IMMEUBLE.nom} (${IMMEUBLE._id})`);
  }

  // ======================== TESTS API ========================
  console.log('\n========================================');
  console.log('  EXÉCUTION DES REQUÊTES API');
  console.log('========================================\n');

  // --- A) POST /api/entrepreneur/campagnes ---
  console.log('[A] POST /api/entrepreneur/campagnes');
  {
    const payload = {
      immeuble_id: IMMEUBLE._id.toString(),
      nom: `Campagne test ${Date.now()}`,
      date_debut: '2026-06-01',
      date_fin: '2026-06-30'
    };
    const rep = await requete('POST', '/api/entrepreneur/campagnes/', payload);
    if (rep.status === 201) {
      CAMPAGNE_ID = rep.body._id;
      success(`Campagne créée (ID: ${CAMPAGNE_ID})`);
    } else {
      fail(`Erreur ${rep.status}: ${JSON.stringify(rep.body)}`);
    }
  }

  // --- B) GET /api/entrepreneur/campagnes ---
  console.log('\n[B] GET /api/entrepreneur/campagnes');
  {
    const rep = await requete('GET', '/api/entrepreneur/campagnes/');
    if (rep.status === 200) {
      success(`${rep.body.length} campagne(s) trouvée(s)`);
    } else {
      fail(`Erreur ${rep.status}: ${JSON.stringify(rep.body)}`);
    }
  }

  // --- C) GET /api/entrepreneur/campagnes/:id ---
  console.log('\n[C] GET /api/entrepreneur/campagnes/:id');
  if (CAMPAGNE_ID) {
    const rep = await requete('GET', `/api/entrepreneur/campagnes/${CAMPAGNE_ID}`);
    if (rep.status === 200) {
      success(`Campagne récupérée: ${rep.body.nom}`);
    } else {
      fail(`Erreur ${rep.status}: ${JSON.stringify(rep.body)}`);
    }
  } else {
    fail('ID campagne non disponible (étape A échouée)');
  }

  // --- D) POST /api/entrepreneur/campagnes/:id/logements ---
  console.log('\n[D] POST /api/entrepreneur/campagnes/:id/logements');
  if (CAMPAGNE_ID) {
    const payload = [
      { numero: 'A1', etage: 0, surface: 45, loyer_estime: 800 },
      { numero: 'A2', etage: 1, surface: 55, loyer_estime: 950 },
      { numero: 'A3', etage: 2, surface: 35, loyer_estime: 650 }
    ];
    const rep = await requete('POST', `/api/entrepreneur/campagnes/${CAMPAGNE_ID}/logements`, payload);
    if (rep.status === 201) {
      success(`${rep.body.length} logement(s) créé(s)`);
    } else {
      fail(`Erreur ${rep.status}: ${JSON.stringify(rep.body)}`);
    }
  } else {
    fail('ID campagne non disponible (étape A échouée)');
  }

  // ======================== BILAN ========================
  console.log('\n========================================');
  console.log('  BILAN DES TESTS');
  console.log('========================================');
  console.log(`  ✅ Réussis: ${PASS}`);
  console.log(`  ❌ Échecs:  ${FAIL}`);
  console.log(`  📊 Total:   ${PASS + FAIL}`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(FAIL > 0 ? 1 : 0);
})();
