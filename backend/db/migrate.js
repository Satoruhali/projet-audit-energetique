require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { sequelize } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connecté');

    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS nom VARCHAR(255) NOT NULL DEFAULT ''`);
    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS selection TEXT NULL`);
    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL`);

    // Mise à jour de l'ENUM statut pour inclure tous les statuts du modèle
    await sequelize.query(`ALTER TABLE campagnes MODIFY COLUMN statut ENUM('brouillon','en_cours','ouverte','planification_terminee','termine') DEFAULT 'brouillon'`);

    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS surface FLOAT NULL`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS loyer_estime FLOAT NULL`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS statut ENUM('libre','occupe','reserve') DEFAULT 'libre'`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL`);

    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS typologie VARCHAR(10) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS annee_construction INT NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_bas VARCHAR(100) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_haut VARCHAR(100) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS surface_totale FLOAT NULL`);

    await sequelize.query(`ALTER TABLE locataires ADD COLUMN IF NOT EXISTS prenom VARCHAR(255) NOT NULL DEFAULT ''`);

    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
}

migrate();
