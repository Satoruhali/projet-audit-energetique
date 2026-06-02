const assert = require('node:assert/strict');
const { describe, it, before, after } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');

const { timeToMinutes, chevauche } = require('../controllers/lienController');
const Locataire = require('../models/Locataire');
const Campagne = require('../models/Campagne');
const Creneau = require('../models/Creneau');

const { Types: { ObjectId } } = mongoose;
const id = () => new ObjectId();

/* =============================================
   TESTS UNITAIRES — timeToMinutes
   ============================================= */
describe('timeToMinutes', () => {
  it('convertit "00:00" en 0', () => {
    assert.equal(timeToMinutes('00:00'), 0);
  });

  it('convertit "01:00" en 60', () => {
    assert.equal(timeToMinutes('01:00'), 60);
  });

  it('convertit "23:59" en 1439', () => {
    assert.equal(timeToMinutes('23:59'), 1439);
  });

  it('convertit "12:30" en 750', () => {
    assert.equal(timeToMinutes('12:30'), 750);
  });

  it('convertit "09:15" en 555', () => {
    assert.equal(timeToMinutes('09:15'), 555);
  });
});

/* =============================================
   TESTS UNITAIRES — chevauche
   ============================================= */
describe('chevauche', () => {
  it('deux créneaux identiques se chevauchent', () => {
    assert.ok(chevauche('09:00', '10:00', '09:00', '10:00'));
  });

  it('un créneau contenu dans un autre se chevauche', () => {
    assert.ok(chevauche('09:00', '11:00', '09:30', '10:30'));
  });

  it('créneaux adjacents (fin = début) ne se chevauchent PAS', () => {
    assert.ok(!chevauche('09:00', '10:00', '10:00', '11:00'));
  });

  it('créneaux disjoints ne se chevauchent pas', () => {
    assert.ok(!chevauche('09:00', '10:00', '10:30', '11:30'));
  });

  it('chevauchenent partiel : début du premier dans le second', () => {
    assert.ok(chevauche('09:30', '10:30', '09:00', '10:00'));
  });

  it('chevauchenent partiel : fin du premier dans le second', () => {
    assert.ok(chevauche('09:00', '10:00', '09:30', '10:30'));
  });
});

/* =============================================
   TESTS D'INTÉGRATION — API /api/liens
   ============================================= */
describe('API /api/liens', () => {
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  /* -------------------------------------------
     GET /api/liens/:token
     ------------------------------------------- */
  describe('GET /api/liens/:token', () => {
    before(async () => {
      const campagneId = id();
      const logementId = id();

      await Campagne.create({
        _id: campagneId,
        immeuble_id: id(),
        nom: 'Campagne test jours',
        statut: 'en_cours',
        jours_disponibles: [
          new Date('2026-06-10'),
          new Date('2026-06-11'),
          new Date('2026-06-12')
        ]
      });

      await Locataire.create({
        _id: id(),
        campagne_id: campagneId,
        logement_id: logementId,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        token: 'token-valide-abc'
      });
    });

    it('retourne 404 pour un token inconnu', async () => {
      const res = await request(app).get('/api/liens/token-inconnu');
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'Lien invalide ou expiré');
    });

    it('retourne 200 avec les infos pour un token valide', async () => {
      const res = await request(app).get('/api/liens/token-valide-abc');
      assert.equal(res.status, 200);
      assert.equal(res.body.locataire.nom, 'Dupont');
      assert.equal(res.body.locataire.prenom, 'Jean');
      assert.equal(res.body.campagne.nom, 'Campagne test jours');
      assert.equal(res.body.jours_disponibles.length, 3);
      assert.ok(res.body.jours_disponibles.includes('2026-06-10'));
    });
  });

  /* -------------------------------------------
     POST /api/liens/:token/creneaux
     ------------------------------------------- */
  describe('POST /api/liens/:token/creneaux', () => {
    let campagne, locataire;

    before(async () => {
      const campagneId = id();
      const logementId = id();

      campagne = await Campagne.create({
        _id: campagneId,
        immeuble_id: id(),
        nom: 'Campagne test creneaux',
        statut: 'en_cours',
        jours_disponibles: [
          new Date('2026-07-01'),
          new Date('2026-07-02'),
          new Date('2026-07-03')
        ]
      });

      locataire = await Locataire.create({
        _id: id(),
        campagne_id: campagneId,
        logement_id: logementId,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@example.com',
        token: 'token-creneaux-valid'
      });
    });

    it('retourne 400 si la date est manquante', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ heure_debut: '09:00', heure_fin: '10:00' });
      assert.equal(res.status, 400);
    });

    it('retourne 400 si le format heure est invalide', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '9:00', heure_fin: '10:00' });
      assert.equal(res.status, 400);
    });

    it('retourne 400 si heure_debut >= heure_fin', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '10:00', heure_fin: '09:00' });
      assert.equal(res.status, 400);
      assert.ok(res.body.message.includes('postérieure'));
    });

    it('retourne 404 pour un token inconnu', async () => {
      const res = await request(app)
        .post('/api/liens/token-inconnu/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '09:00', heure_fin: '10:00' });
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'Lien invalide ou expiré');
    });

    it('retourne 400 si la date n\'est pas dans les jours disponibles', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ date_visite: '2026-08-01', heure_debut: '09:00', heure_fin: '10:00' });
      assert.equal(res.status, 400);
      assert.ok(res.body.message.includes('pas disponible'));
    });

    it('crée un créneau avec succès', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '09:00', heure_fin: '10:00' });
      assert.equal(res.status, 201);
      assert.equal(res.body.message, 'Créneau réservé avec succès');
      assert.equal(res.body.creneau.date_visite, '2026-07-01');
      assert.equal(res.body.creneau.heure_debut, '09:00');
      assert.equal(res.body.creneau.heure_fin, '10:00');
      assert.equal(res.body.creneau.statut, 'reserve');
    });

    it('retourne 400 si un créneau existe déjà pour ce locataire (doublon)', async () => {
      const res = await request(app)
        .post('/api/liens/token-creneaux-valid/creneaux')
        .send({ date_visite: '2026-07-02', heure_debut: '14:00', heure_fin: '15:00' });
      assert.equal(res.status, 400);
      assert.ok(res.body.message.includes('déjà été réservé'));
    });

    it('retourne 409 si le créneau chevauche un existant sur la même date', async () => {
      const autreLocataire = await Locataire.create({
        _id: id(),
        campagne_id: campagne._id,
        logement_id: id(),
        nom: 'Durand',
        prenom: 'Pierre',
        token: 'token-autre-locataire'
      });

      const res = await request(app)
        .post('/api/liens/token-autre-locataire/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '09:30', heure_fin: '10:30' });
      assert.equal(res.status, 409);
      assert.ok(res.body.message.includes('chevauche'));
    });

    it('permet un créneau non-chevauchement sur une autre date pour un autre locataire', async () => {
      const res = await request(app)
        .post('/api/liens/token-autre-locataire/creneaux')
        .send({ date_visite: '2026-07-02', heure_debut: '09:00', heure_fin: '10:00' });
      assert.equal(res.status, 201);
    });
  });
});
