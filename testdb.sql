-- =============================================
-- VERSION SIMPLIFIÉE (sans index optionnels)
-- Pour bien démarrer
-- =============================================

CREATE DATABASE IF NOT EXISTS audit_energetique;
USE audit_energetique;

-- TABLE : locataires
CREATE TABLE locataires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE : batiments
CREATE TABLE batiments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    nb_etages INT DEFAULT 0
);

-- TABLE : appartements
CREATE TABLE appartements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batiment_id INT NOT NULL,
    numero VARCHAR(50) NOT NULL,
    etage INT NOT NULL,
    locataire_id INT,
    FOREIGN KEY (batiment_id) REFERENCES batiments(id) ON DELETE CASCADE,
    FOREIGN KEY (locataire_id) REFERENCES locataires(id) ON DELETE SET NULL,
    UNIQUE KEY unique_appartement_par_batiment (batiment_id, numero)
);

-- TABLE : campagnes_audit
CREATE TABLE campagnes_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batiment_id INT NOT NULL,
    date_debut_possible DATE NOT NULL,
    date_fin_possible DATE NOT NULL,
    statut ENUM('ouverte', 'planification_terminee') DEFAULT 'ouverte',
    FOREIGN KEY (batiment_id) REFERENCES batiments(id) ON DELETE CASCADE
);

-- TABLE : disponibilites_locataires
CREATE TABLE disponibilites_locataires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appartement_id INT NOT NULL,
    campagne_id INT NOT NULL,
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    FOREIGN KEY (appartement_id) REFERENCES appartements(id) ON DELETE CASCADE,
    FOREIGN KEY (campagne_id) REFERENCES campagnes_audit(id) ON DELETE CASCADE,
    UNIQUE KEY unique_disponibilite (appartement_id, campagne_id, date, heure_debut)
);

-- TABLE : plannings_optimises
CREATE TABLE plannings_optimises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campagne_id INT NOT NULL,
    appartement_id INT NOT NULL,
    date_visite DATE NOT NULL,
    heure_debut TIME NOT NULL,
    ordre_visite INT NOT NULL,
    statut ENUM('propose', 'confirme', 'effectue', 'annule') DEFAULT 'propose',
    FOREIGN KEY (campagne_id) REFERENCES campagnes_audit(id) ON DELETE CASCADE,
    FOREIGN KEY (appartement_id) REFERENCES appartements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_visite_par_appartement (campagne_id, appartement_id),
    UNIQUE KEY unique_horaire_par_campagne (campagne_id, date_visite, heure_debut),
    UNIQUE KEY unique_ordre_par_campagne (campagne_id, ordre_visite)
);




-- Insertion d'un locataire
INSERT INTO locataires (nom, email, telephone) VALUES 
('Jean Martin', 'jean.martin@email.com', '0612345678');

-- Insertion d'un immeuble
INSERT INTO batiments (nom, adresse, nb_etages) VALUES 
('Résidence des Fleurs', '12 rue de Paris, 75001 Paris', 5);

-- Insertion d'un appartement
INSERT INTO appartements (batiment_id, numero, etage, locataire_id) VALUES 
(1, '101', 1, 1);

-- Insertion d'une campagne
INSERT INTO campagnes_audit (batiment_id, date_debut_possible, date_fin_possible, statut) VALUES 
(1, '2026-03-10', '2026-03-20', 'ouverte');

-- Insertion d'une disponibilité
INSERT INTO disponibilites_locataires (appartement_id, campagne_id, date, heure_debut, heure_fin) VALUES 
(1, 1, '2026-03-12', '09:00', '11:00');


-- Voir tous les locataires
SELECT * FROM locataires;

-- Voir tous les immeubles
SELECT * FROM batiments;

-- Voir tous les appartements avec le nom du locataire
SELECT a.numero, a.etage, l.nom AS locataire 
FROM appartements a
JOIN locataires l ON l.id = a.locataire_id;

-- Voir les disponibilités avec les infos complètes
SELECT 
    b.nom AS immeuble,
    a.numero AS appartement,
    a.etage,
    l.nom AS locataire,
    dl.date,
    dl.heure_debut,
    dl.heure_fin
FROM disponibilites_locataires dl
JOIN appartements a ON a.id = dl.appartement_id
JOIN locataires l ON l.id = a.locataire_id
JOIN campagnes_audit c ON c.id = dl.campagne_id
JOIN batiments b ON b.id = a.batiment_id;

-- =============================================
-- 7. Tester une contrainte d'unicité (doit échouer)
-- =============================================

-- Tentative d'insertion d'un doublon de disponibilité (même date/heure/appartement/campagne)
-- Normalement, cette requête doit échouer avec une erreur "Duplicate entry"
INSERT INTO disponibilites_locataires (appartement_id, campagne_id, date, heure_debut, heure_fin) VALUES 
(1, 1, '2026-03-12', '09:00:00', '11:00:00');

-- =============================================
-- 8. Nettoyer (optionnel - supprime toutes les données de test)
-- =============================================

-- DANGER : supprime tout ce qu'on a inséré
 DELETE FROM disponibilites_locataires;
 DELETE FROM plannings_optimises;
 DELETE FROM campagnes_audit;
 DELETE FROM appartements;
 DELETE FROM batiments;
 DELETE FROM locataires;


-- =============================================
-- MIGRATION : ancien schéma → nouveau schéma
-- (RG11 à RG17 compatibles)
-- =============================================

-- 1. Création des nouvelles tables (indépendantes)

CREATE TABLE entrepreneurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE typologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE, -- T1, T2, T3, T4, T5, T6
    nb_pieces INT NOT NULL CHECK (nb_pieces BETWEEN 1 AND 6),
    surface_min_m2 INT NOT NULL,
    surface_max_m2 INT NOT NULL
);

CREATE TABLE types_plancher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie ENUM('bas', 'haut') NOT NULL,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 2. Renommer / modifier les tables existantes

-- Renommer batiments → immeubles
RENAME TABLE batiments TO immeubles;

-- Ajouter id_entrepreneur à immeubles (clé étrangère)
ALTER TABLE immeubles ADD COLUMN id_entrepreneur INT NULL;
ALTER TABLE immeubles ADD FOREIGN KEY (id_entrepreneur) REFERENCES entrepreneurs(id) ON DELETE SET NULL;

-- Renommer appartements → logements
RENAME TABLE appartements TO logements;

-- Ajouter les nouvelles colonnes à logements
ALTER TABLE logements 
    ADD COLUMN id_typologie INT NULL,
    ADD COLUMN id_type_plancher_bas INT NULL,
    ADD COLUMN id_type_plancher_haut INT NULL,
    ADD COLUMN position ENUM('rez_de_chaussee', 'intermediaire', 'dernier_etage') NULL,
    ADD COLUMN selectionne_visite BOOLEAN DEFAULT FALSE;

-- Ajouter les clés étrangères
ALTER TABLE logements ADD FOREIGN KEY (id_typologie) REFERENCES typologies(id);
ALTER TABLE logements ADD FOREIGN KEY (id_type_plancher_bas) REFERENCES types_plancher(id);
ALTER TABLE logements ADD FOREIGN KEY (id_type_plancher_haut) REFERENCES types_plancher(id);

-- Renommer campagnes_audit → campagnes
RENAME TABLE campagnes_audit TO campagnes;

-- Ajouter les nouvelles colonnes
ALTER TABLE campagnes 
    ADD COLUMN nb_min_visites INT DEFAULT 1,
    ADD COLUMN pct_min_visites DECIMAL(5,2) DEFAULT 50.00,
    ADD COLUMN nom VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN selection TEXT NULL,
    ADD COLUMN deleted_at DATETIME NULL;

-- Mettre à jour l'ENUM statut pour inclure les valeurs du modèle
ALTER TABLE campagnes 
    MODIFY COLUMN statut ENUM('brouillon','en_cours','ouverte','planification_terminee','termine') DEFAULT 'brouillon';

-- Ajouter token_acces à locataires
ALTER TABLE locataires ADD COLUMN token_acces VARCHAR(64) UNIQUE NULL;

-- 3. Créer les tables de disponibilités (RG16)

-- Table des jours disponibles par entrepreneur
CREATE TABLE jours_disponibles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_entrepreneur INT NOT NULL,
    date DATE NOT NULL,
    est_disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_entrepreneur) REFERENCES entrepreneurs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dispo_entrepreneur_date (id_entrepreneur, date)
);

-- Table des créneaux (fusion disponibilités_locataires + plannings_optimises)
CREATE TABLE creneaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_logement INT NOT NULL,
    id_campagne INT NOT NULL,
    id_jour_disponible INT NULL,
    date_visite DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    ordre_visite INT NULL,
    statut ENUM('propose', 'confirme', 'effectue', 'annule') DEFAULT 'propose',
    FOREIGN KEY (id_logement) REFERENCES logements(id) ON DELETE CASCADE,
    FOREIGN KEY (id_campagne) REFERENCES campagnes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_jour_disponible) REFERENCES jours_disponibles(id) ON DELETE SET NULL,
    UNIQUE KEY unique_creneau_par_logement_campagne (id_campagne, id_logement),
    UNIQUE KEY unique_horaire_par_campagne (id_campagne, date_visite, heure_debut)
);

-- 4. Table des emails envoyés (RG17)
CREATE TABLE emails_envoyes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_locataire INT NOT NULL,
    id_campagne INT NOT NULL,
    type ENUM('invitation_visite', 'rappel_visite', 'non_visite', 'relance_generique') NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('envoye', 'echoue', 'ouvert', 'clique') DEFAULT 'envoye',
    FOREIGN KEY (id_locataire) REFERENCES locataires(id) ON DELETE CASCADE,
    FOREIGN KEY (id_campagne) REFERENCES campagnes(id) ON DELETE CASCADE
);

-- 5. Supprimer les anciennes tables (après migration des données si besoin)
DROP TABLE IF EXISTS disponibilites_locataires;
DROP TABLE IF EXISTS plannings_optimises;

-- 6. Créer les index pour performance
CREATE INDEX idx_logements_id_immeuble ON logements(batiment_id);
CREATE INDEX idx_logements_id_typologie ON logements(id_typologie);
CREATE INDEX idx_creneaux_id_logement ON creneaux(id_logement);
CREATE INDEX idx_creneaux_id_campagne ON creneaux(id_campagne);
CREATE INDEX idx_creneaux_id_jour_disponible ON creneaux(id_jour_disponible);
CREATE INDEX idx_locataires_token_acces ON locataires(token_acces);
CREATE INDEX idx_emails_envoyes_locataire ON emails_envoyes(id_locataire);
CREATE INDEX idx_emails_envoyes_campagne ON emails_envoyes(id_campagne);


-- Liste toutes les tables de la base
SHOW TABLES;

-- Voir la structure de chaque table (exécuter une par une)
DESCRIBE entrepreneurs;
DESCRIBE immeubles;
DESCRIBE typologies;
DESCRIBE types_plancher;
DESCRIBE logements;
DESCRIBE locataires;
DESCRIBE campagnes;
DESCRIBE jours_disponibles;
DESCRIBE creneaux;
DESCRIBE emails_envoyes;


-- Afficher toutes les clés étrangères de la base
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_SCHEMA = 'audit_energetique'
    AND REFERENCED_TABLE_NAME IS NOT NULL;


INSERT INTO entrepreneurs (nom, email, mot_de_passe_hash, telephone) 
VALUES ('Test Diagnostic', 'test@diag.fr', 'hash_mot_de_passe_123', '0601020304');

-- Vérifier si les identifiants sont corrects
SELECT id, nom, email, telephone, date_creation 
FROM entrepreneurs 
WHERE email = 'test@diag.fr' AND mot_de_passe_hash = 'hash_mot_de_passe_123';

SELECT * FROM entrepreneurs;

-- Cette requête doit générer une erreur "Duplicate entry"
INSERT INTO entrepreneurs (nom, email, mot_de_passe_hash) 
VALUES ('Doublon', 'test@diag.fr', 'hash_456');

INSERT INTO immeubles (nom, adresse, nb_etages, id_entrepreneur) 
VALUES ('Tour Test', '15 rue de l\'Essai, 75001 Paris', 7, 1);

SELECT * FROM immeubles WHERE id_entrepreneur = 1;

INSERT INTO typologies (code, nb_pieces, surface_min_m2, surface_max_m2) VALUES
('T1', 1, 20, 35),
('T2', 2, 35, 50),
('T3', 3, 50, 70),
('T4', 4, 70, 90),
('T5', 5, 90, 110);

-- Planchers bas
INSERT INTO types_plancher (categorie, nom, description) VALUES
('bas', 'terre-plein', 'Sur terre-plein'),
('bas', 'vide-sanitaire', 'Sur vide sanitaire');

-- Planchers hauts
INSERT INTO types_plancher (categorie, nom, description) VALUES
('haut', 'combles-perdus', 'Combles non aménagés'),
('haut', 'toiture-terrasse', 'Toiture terrasse');

INSERT INTO logements (
    batiment_id, numero, etage, locataire_id,
    id_typologie, id_type_plancher_bas, id_type_plancher_haut,
    position, selectionne_visite
) VALUES (
    (SELECT id FROM immeubles LIMIT 1),  -- prend le 1er ID existant
    '101',
    1,
    (SELECT id FROM locataires LIMIT 1),  -- prend le 1er locataire existant
    (SELECT id FROM typologies WHERE code = 'T2' LIMIT 1),
    (SELECT id FROM types_plancher WHERE categorie = 'bas' LIMIT 1),
    (SELECT id FROM types_plancher WHERE categorie = 'haut' LIMIT 1),
    'rez_de_chaussee',
    TRUE
);

SELECT 
    i.nom AS immeuble,
    l.numero AS logement,
    l.etage,
    l.position,
    t.code AS typologie,
    t.nb_pieces,
    t.surface_min_m2,
    pb.nom AS plancher_bas,
    ph.nom AS plancher_haut,
    loc.nom AS locataire,
    CASE WHEN l.selectionne_visite THEN 'Oui' ELSE 'Non' END AS selectionne
FROM logements l
JOIN immeubles i ON i.id = l.batiment_id
LEFT JOIN typologies t ON t.id = l.id_typologie
LEFT JOIN types_plancher pb ON pb.id = l.id_type_plancher_bas
LEFT JOIN types_plancher ph ON ph.id = l.id_type_plancher_haut
LEFT JOIN locataires loc ON loc.id = l.locataire_id;


INSERT INTO campagnes (
    batiment_id, date_debut_possible, date_fin_possible, 
    statut, nb_min_visites, pct_min_visites
) VALUES (
    (SELECT id FROM immeubles LIMIT 1),  -- prend le 1er ID existant
    '2026-06-01', 
    '2026-06-30', 
    'ouverte', 
    3, 
    60.00
);


-- Pour un immeuble avec 10 logements sélectionnés
SELECT 
    c.id AS campagne_id,
    c.nb_min_visites AS min_absolu,
    c.pct_min_visites AS min_pourcentage,
    COUNT(l.id) AS total_logements_selectionnes,
    GREATEST(
        c.nb_min_visites,
        CEIL(COUNT(l.id) * c.pct_min_visites / 100)
    ) AS visites_requises
FROM campagnes c
JOIN logements l ON l.batiment_id = c.batiment_id
WHERE c.id = 1 AND l.selectionne_visite = TRUE
GROUP BY c.id;


SELECT 
    c.*,
    i.nom AS immeuble,
    i.adresse,
    i.nb_etages,
    e.nom AS entrepreneur
FROM campagnes c
JOIN immeubles i ON i.id = c.batiment_id
LEFT JOIN entrepreneurs e ON e.id = i.id_entrepreneur;


INSERT INTO jours_disponibles (id_entrepreneur, date, est_disponible) VALUES
(1, '2026-06-05', TRUE),
(1, '2026-06-06', TRUE),
(1, '2026-06-07', FALSE),  -- jour indisponible
(1, '2026-06-08', TRUE);


SELECT * FROM jours_disponibles 
WHERE id_entrepreneur = 1 AND date >= CURDATE()
ORDER BY DATE;


-- Insertion d'un doublon (même entrepreneur, même date)
INSERT INTO jours_disponibles (id_entrepreneur, date, est_disponible) 
VALUES (1, '2026-06-05', TRUE);  -- DOIT ÉCHOUER


-- 1. Vérifier les campagnes existantes
SELECT id FROM campagnes;

-- 2. Utiliser un ID qui existe vraiment
INSERT INTO creneaux (
    id_logement, id_campagne, id_jour_disponible,
    date_visite, heure_debut, heure_fin, ordre_visite, statut
) VALUES (
    (SELECT id FROM logements LIMIT 1),  -- prend le 1er ID existant
    3,  -- campagne 3
    NULL,  -- jour dispo peut être NULL
    '2026-06-05', '09:00:00', '10:00:00', 1, 'propose'
);


UPDATE creneaux 
SET statut = 'confirme' 
WHERE id = 1;

UPDATE creneaux 
SET statut = 'effectue' 
WHERE id = 1;

UPDATE creneaux 
SET statut = 'annule' 
WHERE id = 1;






SELECT 
    c.id AS campagne_id,
    l.numero AS logement,
    l.etage,
    loc.nom AS locataire,
    cr.date_visite,
    cr.heure_debut,
    cr.heure_fin,
    cr.ordre_visite,
    cr.statut,
    jd.est_disponible AS entrepreneur_dispo
FROM creneaux cr
JOIN logements l ON l.id = cr.id_logement
LEFT JOIN locataires loc ON loc.id = l.locataire_id
JOIN campagnes c ON c.id = cr.id_campagne
LEFT JOIN jours_disponibles jd ON jd.id = cr.id_jour_disponible
WHERE cr.id_campagne = 3  -- ✅ MODIFIÉ : 1 → 3
ORDER BY cr.ordre_visite;


-- Même logement dans même campagne (doit échouer)
INSERT INTO creneaux (id_logement, id_campagne, date_visite, heure_debut, heure_fin, statut) 
VALUES (1, 3, '2026-06-06', '10:00:00', '11:00:00', 'propose');  -- ✅ MODIFIÉ : 1 → 3

-- Même horaire dans même campagne (doit échouer)
INSERT INTO creneaux (id_logement, id_campagne, date_visite, heure_debut, heure_fin, statut) 
VALUES (2, 3, '2026-06-05', '09:00:00', '10:00:00', 'propose');  -- ✅ MODIFIÉ : 1 → 3


INSERT INTO locataires (nom, email, telephone) 
VALUES ('Locataire Test', 'test@email.com', '0612345678');

SELECT id, nom FROM locataires;


INSERT INTO emails_envoyes (id_locataire, id_campagne, type, statut) 
VALUES (2, 3, 'invitation_visite', 'envoye');

-- Étape 1: Voir les logements sélectionnés pour la campagne
SELECT l.* 
FROM logements l
JOIN campagnes c ON c.batiment_id = l.batiment_id
WHERE c.id = 3 AND l.selectionne_visite = TRUE;  -- ✅ MODIFIÉ : 1 → 3

-- Étape 2: Voir les disponibilités de l'entrepreneur
SELECT * FROM jours_disponibles 
WHERE id_entrepreneur = 1 AND est_disponible = TRUE 
AND date BETWEEN '2026-06-01' AND '2026-06-30';

-- Étape 3: Proposer des créneaux pour chaque logement
-- (à faire individuellement ou avec une procédure stockée)
SELECT id FROM logements;

INSERT INTO creneaux (id_logement, id_campagne, date_visite, heure_debut, heure_fin, statut, ordre_visite) 
VALUES (4, 3, '2026-06-10', '09:00:00', '10:00:00', 'propose', 1);


-- Étape 4: Vérifier l'avancement
SELECT 
    statut,
    COUNT(*) AS nb_creneaux
FROM creneaux
WHERE id_campagne = 3  -- ✅ MODIFIÉ : 1 → 3
GROUP BY statut;


SELECT 
    c.id AS campagne_id,
    i.nom AS immeuble,
    COUNT(DISTINCT l.id) AS total_logements,
    COUNT(DISTINCT cr.id) AS visites_planifiees,
    SUM(CASE WHEN cr.statut = 'effectue' THEN 1 ELSE 0 END) AS visites_realisees,
    SUM(CASE WHEN cr.statut = 'confirme' THEN 1 ELSE 0 END) AS visites_confirmees,
    SUM(CASE WHEN cr.statut = 'annule' THEN 1 ELSE 0 END) AS visites_annulees,
    COUNT(DISTINCT e.id) AS emails_envoyes
FROM campagnes c
JOIN immeubles i ON i.id = c.batiment_id
LEFT JOIN logements l ON l.batiment_id = i.id
LEFT JOIN creneaux cr ON cr.id_campagne = c.id AND cr.id_logement = l.id
LEFT JOIN emails_envoyes e ON e.id_campagne = c.id
WHERE c.id = 3  -- ✅ MODIFIÉ : 1 → 3
GROUP BY c.id, i.nom;

SELECT 
    l.numero,
    l.etage,
    loc.nom AS locataire,
    loc.email,
    t.code AS typologie
FROM logements l
JOIN campagnes c ON c.batiment_id = l.batiment_id
LEFT JOIN locataires loc ON loc.id = l.locataire_id
LEFT JOIN typologies t ON t.id = l.id_typologie
LEFT JOIN creneaux cr ON cr.id_logement = l.id AND cr.id_campagne = c.id
WHERE c.id = 3  -- ✅ MODIFIÉ : 1 → 3
  AND l.selectionne_visite = TRUE
  AND cr.id IS NULL;
  
  -- Voir les logements avec créneaux
SELECT l.id, l.numero, cr.id AS creneau_id
FROM logements l
JOIN campagnes c ON c.batiment_id = l.batiment_id
LEFT JOIN creneaux cr ON cr.id_logement = l.id AND cr.id_campagne = c.id
WHERE c.id = 3 AND l.selectionne_visite = TRUE;



