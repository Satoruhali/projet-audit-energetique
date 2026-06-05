require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { sequelize } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connecté');

    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS nom VARCHAR(255) NOT NULL DEFAULT ''`);
    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS selection JSON NULL`);
    await sequelize.query(`ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL`);

    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS surface FLOAT NULL`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS loyer_estime FLOAT NULL`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS statut ENUM('libre','occupe','reserve') DEFAULT 'libre'`);
    await sequelize.query(`ALTER TABLE logements ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL`);

    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS typologie VARCHAR(10) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS annee_construction INT NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_bas VARCHAR(100) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_haut VARCHAR(100) NULL`);
    await sequelize.query(`ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS surface_totale FLOAT NULL`);

    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
}

migrate();
