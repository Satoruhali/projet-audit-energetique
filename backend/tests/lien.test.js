const assert = require('node:assert/strict');
const { describe, it, before, after } = require('node:test');
const request = require('supertest');
const app = require('../app');

const { timeToMinutes, chevauche } = require('../controllers/lienController');
const { sequelize } = require('../models');
const Locataire = require('../models/Locataire');
const Campagne = require('../models/Campagne');
const Immeuble = require('../models/Immeuble');
const Logement = require('../models/Logement');
const Creneau = require('../models/Creneau');
const JoursDisponible = require('../models/JoursDisponible');
const Entrepreneur = require('../models/Entrepreneur');

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
  before(async () => {
    await sequelize.sync({ force: true });

    const entrepreneur = await Entrepreneur.create({
      nom: 'Test',
      email: 'test@test.com',
      mot_de_passe_hash: 'password'
    });

    await JoursDisponible.create({
      id_entrepreneur: entrepreneur.id,
      date: '2026-06-10',
      est_disponible: true
    });
    await JoursDisponible.create({
      id_entrepreneur: entrepreneur.id,
      date: '2026-06-11',
      est_disponible: true
    });
    await JoursDisponible.create({
      id_entrepreneur: entrepreneur.id,
      date: '2026-06-12',
      est_disponible: true
    });

    const immeuble = await Immeuble.create({
      nom: 'Immeuble test',
      adresse: '1 rue Test',
      nb_etages: 3,
      id_entrepreneur: entrepreneur.id
    });

    await Logement.create({
      batiment_id: immeuble.id,
      numero: '101',
      etage: 1
    });

    await Campagne.create({
      batiment_id: immeuble.id,
      nom: 'Campagne test jours',
      date_debut_possible: '2026-06-01',
      date_fin_possible: '2026-06-30',
      statut: 'en_cours'
    });

    const locataire = await Locataire.create({
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@example.com',
      token_acces: 'token-valide-abc'
    });

    await Logement.update(
      { locataire_id: locataire.id },
      { where: { numero: '101' } }
    );
  });

  after(async () => {
    await sequelize.close();
  });

  describe('GET /api/liens/:token', () => {
    it('retourne 404 pour un token inconnu', async () => {
      const res = await request(app).get('/api/liens/token-inconnu');
      assert.equal(res.status, 404);
      assert.equal(res.body.message, 'Lien invalide ou expiré');
    });

    it('retourne 200 avec les infos pour un token valide', async () => {
      const res = await request(app).get('/api/liens/token-valide-abc');
      assert.equal(res.status, 200);
      assert.equal(res.body.locataire.nom, 'Dupont');
      assert.equal(res.body.campagne.nom, 'Campagne test jours');
      assert.ok(res.body.jours_disponibles.length > 0);
      assert.ok(res.body.jours_disponibles.includes('2026-06-10'));
    });
  });

  describe('POST /api/liens/:token/creneaux', () => {
    let creneauCampagne, creneauLogement, entrepreneur;

    before(async () => {
      await sequelize.sync({ force: true });

      entrepreneur = await Entrepreneur.create({
        nom: 'Test',
        email: 'test2@test.com',
        mot_de_passe_hash: 'password'
      });

      await JoursDisponible.create({
        id_entrepreneur: entrepreneur.id,
        date: '2026-07-01',
        est_disponible: true
      });
      await JoursDisponible.create({
        id_entrepreneur: entrepreneur.id,
        date: '2026-07-02',
        est_disponible: true
      });
      await JoursDisponible.create({
        id_entrepreneur: entrepreneur.id,
        date: '2026-07-03',
        est_disponible: true
      });

      const immeuble = await Immeuble.create({
        nom: 'Immeuble creneaux',
        adresse: '2 rue Test',
        nb_etages: 3,
        id_entrepreneur: entrepreneur.id
      });

      creneauCampagne = await Campagne.create({
        batiment_id: immeuble.id,
        nom: 'Campagne test creneaux',
        date_debut_possible: '2026-07-01',
        date_fin_possible: '2026-07-31',
        statut: 'en_cours'
      });

      creneauLogement = await Logement.create({
        batiment_id: immeuble.id,
        numero: '201',
        etage: 2
      });

      const locataire = await Locataire.create({
        prenom: 'Sophie',
        nom: 'Martin',
        email: 'sophie.martin@example.com',
        token_acces: 'token-creneaux-valid'
      });

      await Logement.update(
        { locataire_id: locataire.id },
        { where: { id: creneauLogement.id } }
      );
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
      const autreLogement = await Logement.create({
        batiment_id: creneauCampagne.batiment_id,
        numero: '301',
        etage: 3
      });

      const autreLocataire = await Locataire.create({
        prenom: 'Pierre',
        nom: 'Durand',
        email: 'pierre.durand@example.com',
        token_acces: 'token-autre-locataire'
      });

      await Logement.update(
        { locataire_id: autreLocataire.id },
        { where: { id: autreLogement.id } }
      );

      const res = await request(app)
        .post('/api/liens/token-autre-locataire/creneaux')
        .send({ date_visite: '2026-07-01', heure_debut: '09:30', heure_fin: '10:30' });
      assert.equal(res.status, 409);
      assert.ok(res.body.message.includes('chevauche'));
    });
  });
});
