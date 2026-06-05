-- =============================================
-- Migration : colonnes supplémentaires
-- pour la compatibilité avec la logique métier
-- =============================================

USE audit_energetique;

-- Campagnes : ajout des colonnes manquantes
ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS nom VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS selection JSON NULL;
ALTER TABLE campagnes ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

-- Logements : ajout des colonnes métier
ALTER TABLE logements ADD COLUMN IF NOT EXISTS surface FLOAT NULL;
ALTER TABLE logements ADD COLUMN IF NOT EXISTS loyer_estime FLOAT NULL;
ALTER TABLE logements ADD COLUMN IF NOT EXISTS statut ENUM('libre','occupe','reserve') DEFAULT 'libre';
ALTER TABLE logements ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL;

-- Immeubles : ajout des colonnes métier (provenant de MongoDB)
ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS typologie VARCHAR(10) NULL;
ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS annee_construction INT NULL;
ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_bas VARCHAR(100) NULL;
ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS plancher_haut VARCHAR(100) NULL;
ALTER TABLE immeubles ADD COLUMN IF NOT EXISTS surface_totale FLOAT NULL;
