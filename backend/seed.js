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

  // 3. Jours disponibles
  await JoursDisponible.bulkCreate([
    { id_entrepreneur: entrepreneur.id, date: '2026-06-05', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-06', est_disponible: true },
    { id_entrepreneur: entrepreneur.id, date: '2026-06-08', est_disponible: true }
  ]);

  // 4. Immeuble
  const immeuble = await Immeuble.create({
    nom: 'Tour Test',
    adresse: '15 rue de l\'Essai, 75001 Paris',
    nb_etages: 7,
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
    nb_min_visites: 3,
    pct_min_visites: 60.00,
    selection: {
      date_selection: new Date().toISOString(),
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

  // 6. Logement
  const logement = await Logement.create({
    batiment_id: immeuble.id,
    numero: '101',
    etage: 1,
    surface: 45,
    loyer_estime: 800,
    id_typologie: 2,
    id_type_plancher_bas: 1,
    id_type_plancher_haut: 6,
    position: 'bas',
    statut: 'occupe',
    selectionne_visite: true
  });
  console.log('Logement créé:', logement.numero);

  // 7. Locataire
  const locataire = await Locataire.create({
    prenom: 'Jean',
    nom: 'Martin',
    email: 'jean.martin@email.com',
    telephone: '0612345678',
    token_acces: crypto.randomBytes(32).toString('hex')
  });
  console.log('Locataire créé:', locataire.nom);

  // Lier locataire au logement
  await Logement.update(
    { locataire_id: locataire.id },
    { where: { id: logement.id } }
  );

  // 8. Créneau
  await Creneau.create({
    id_logement: logement.id,
    id_campagne: campagne.id,
    date_visite: '2026-06-05',
    heure_debut: '09:00',
    heure_fin: '10:00',
    ordre_visite: 1,
    statut: 'reserve'
  });
  console.log('Créneau créé');

  console.log('\n=== Données insérées avec succès ===');
  console.log('Entrepreneur:', 'test@diag.fr / password123');
  console.log('Immeuble:', immeuble.nom);
  console.log('Campagne:', campagne.nom);
  console.log('Logements: 1 (101)');
  console.log('Locataire: Jean Martin');
  console.log('Jours disponibles: 05/06, 06/06, 08/06/2026');
  console.log('Créneau: 05/06/2026 09:00-10:00');

  await sequelize.close();
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
