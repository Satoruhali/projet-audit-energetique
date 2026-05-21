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











