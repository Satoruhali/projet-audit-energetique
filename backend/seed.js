require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Entrepreneur = require('./models/Entrepreneur');
const Immeuble = require('./models/Immeuble');
const Campagne = require('./models/Campagne');
const Logement = require('./models/Logement');
const Locataire = require('./models/Locataire');
const Creneau = require('./models/Creneau');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connecté');

  // Nettoyage
  await Promise.all([
    Entrepreneur.deleteMany({}),
    Immeuble.deleteMany({}),
    Campagne.deleteMany({}),
    Logement.deleteMany({}),
    Locataire.deleteMany({}),
    Creneau.deleteMany({})
  ]);
  console.log('Anciennes données supprimées');

  // 1. Entrepreneur
  const entrepreneur = await Entrepreneur.create({
    nom: 'Test Diagnostic',
    email: 'test@diag.fr',
    motDePasse: 'password123',
    telephone: '0601020304',
    entreprise: 'Test Diagnostic SARL',
    role: 'entrepreneur'
  });
  console.log('Entrepreneur créé:', entrepreneur.email);

  // 2. Immeuble
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
  console.log('Immeuble créé:', immeuble.nom);

  // 3. Campagne
  const campagne = await Campagne.create({
    immeuble_id: immeuble._id,
    nom: 'Campagne Test - Juin 2026',
    statut: 'en_cours',
    jours_disponibles: [
      new Date('2026-06-05'),
      new Date('2026-06-06'),
      new Date('2026-06-08'),
    ],
    selection: {
      date_selection: new Date(),
      seuil_requis: 3,
      seuil_obtenu: 3,
      couverture: {
        typologies: ['T2'],
        planchersBas: ['terre-plein'],
        planchersHaut: ['toiture-terrasse'],
        positions: ['bas']
      },
      couvertureComplete: true,
      criteresManquants: []
    }
  });
  console.log('Campagne créée:', campagne.nom);

  // 4. Logement
  const logement = await Logement.create({
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
  console.log('Logement créé:', logement.numero);

  // 5. Locataire
  const locataire = await Locataire.create({
    campagne_id: campagne._id,
    logement_id: logement._id,
    nom: 'Martin',
    prenom: 'Jean',
    email: 'jean.martin@email.com',
    telephone: '0612345678',
    date_entree: new Date('2020-01-15'),
    token: require('crypto').randomBytes(32).toString('hex')
  });
  console.log('Locataire créé:', locataire.prenom, locataire.nom);

  // 6. Créneau
  await Creneau.create({
    locataire_id: locataire._id,
    campagne_id: campagne._id,
    date_visite: new Date('2026-06-05'),
    heure_debut: '09:00',
    heure_fin: '10:00',
    statut: 'reserve'
  });
  console.log('Créneau créé');

  // 7. Référentiels (typologies + types plancher)
  console.log('\n=== Données insérées avec succès ===');
  console.log('Entrepreneur:', 'test@diag.fr / password123');
  console.log('Immeuble:', immeuble.nom);
  console.log('Campagne:', campagne.nom);
  console.log('Logements: 1 (101 - T2)');
  console.log('Locataire: Jean Martin');
  console.log('Jours disponibles: 05/06, 06/06, 08/06/2026');
  console.log('Créneau: 05/06/2026 09:00-10:00');
  console.log('\nRéférentiels disponibles (côté application) :');
  console.log('Typologies: T1, T2, T3, T4, T5, T6');
  console.log('Planchers bas: terre-plein, vide-sanitaire, dalle-béton, sous-sol');
  console.log('Planchers haut: combles-perdus, toiture-terrasse, rampants');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
