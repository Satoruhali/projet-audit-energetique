# 1. Plan d'Organisation de Projet

**Projet :** Planif'Audit — Application de planification de visites pour audit énergétique  
**Version :** 1.0 — 21/05/2026  
**Auteur :** Wassi

---

## 1. État des lieux

### Séances réalisées (10 séances en 3 jours)

| Séance | Date | Durée | Objet |
|--------|------|-------|-------|
| 1 | 18/05 | — | Création du dossier professionnel v1.0 |
| 2 | 18/05 | — | Restructuration du dossier (1 fichier → 5 fichiers) |
| 3 | 19/05 | — | Spécifications complètes (personas, stories, wireframes, cas d'usage, règles de gestion, glossaire) |
| 4 | 19/05 | — | Génération frontend complet (HTML/CSS/JS), 3 vues, mobile-first |
| 5 | 19/05 | — | Rédaction `index.html` (SPA, hash routing, formulaires, tableaux) |
| 6 | 19/05 | — | Rédaction `styles.css` (reset, variables, responsive, composants) |
| 7 | 19/05 | — | Rédaction `script.js` (mock data, CRUD, planning RG3/RG4/RG9, toasts) |
| 8 | 20/05 | — | Restructuration arborescence (Agent.ia/, skills/, prompts/, specifications/, docs/, backup/) |
| 9 | 20/05 | — | Refonte formulaire création campagne (2 étapes, champs locataires) |
| 10 | 20/05 | 3h | Organisation de la base de données MariaDB (5 tables) |

### Avancement global estimé

| Lot | Statut | % estimé |
|-----|--------|----------|
| Spécifications / Conception | ✅ Terminé | 100 % |
| Frontend (HTML/CSS/JS) | ✅ Terminé (v1 avec mock data) | 100 % |
| Modèle de données (schéma BDD) | ✅ Terminé | 100 % |
| Backend (API Node.js + Express) | ⬜ Structure vide | 0 % |
| Base de données (script SQL) | ✅ Script de test existant | 50 % |
| Documentation technique | ⬜ Non commencé | 0 % |
| Tests d'intégration | ⬜ Non commencé | 0 % |
| Déploiement | ⬜ Non commencé | 0 % |

---

## 2. Structure recommandée du projet

```
C:\Users\wassi\projet-audit-energetique\
│
├── index.html                 # Frontend — Vue principale (SPA)
├── styles.css                 # Frontend — Styles
├── script.js                  # Frontend — Logique métier (mock data actuellement)
│
├── backend\
│   ├── config\                # Connexion base de données
│   │   └── db.js              # (à créer)
│   ├── models\                # Modèles Sequelize ou queries SQL
│   │   ├── entrepreneurs.js   # (à créer)
│   │   ├── immeubles.js       # (à créer)
│   │   ├── campagnes.js       # (à créer)
│   │   ├── locataires.js      # (à créer)
│   │   └── creneaux.js        # (à créer)
│   ├── routes\                # Routes API REST
│   │   ├── auth.js            # (à créer)
│   │   ├── campagnes.js       # (à créer)
│   │   ├── locataires.js      # (à créer)
│   │   └── creneaux.js        # (à créer)
│   ├── controllers\           # Logique des endpoints
│   │   ├── authController.js  # (à créer)
│   │   ├── campagneController.js  # (à créer)
│   │   ├── locataireController.js # (à créer)
│   │   └── creneauController.js   # (à créer)
│   ├── middleware\            # Authentification, validation
│   │   └── auth.js            # (à créer)
│   ├── validations\           # Schémas de validation (Joi/Zod)
│   │   └── campagne.js        # (à créer)
│   └── server.js              # (à créer) Point d'entrée Express
│
├── database\
│   ├── schema.sql             # Schéma final de la base de données
│   ├── seed.sql               # Données de test (à créer)
│   └── migrations\            # Migrations versionnées (à créer si besoin)
│
├── docs\
│   ├── 01_Plan_Organisation_Projet.md   # Ce fichier
│   ├── 02_Specifications.md             # Synthèse des specs (ou lien vers specifications/)
│   ├── 03_Journal_de_Bord.md            # Suivi des séances
│   ├── 04_Suivi_Modifications.md        # Historique des modifications
│   ├── 05_Documentation_Technique.md    # Documentation finale
│   └── TODO_LIST.md                     # To-do list quotidienne
│
├── specifications\            # Fiches de conception modulaires
│   ├── brief-projet.md
│   ├── user-stories.md
│   ├── personas.md
│   ├── wireframes.md
│   ├── regles-gestion.md
│   ├── cas-utilisation.md
│   └── glossaire.md
│
├── Agent.ia\                 # Configuration agent IA (OpenCode)
│   └── config.json
│
├── prompts\                  # Log des prompts utilisés
│   └── prompts.log
│
├── skills\                   # Skills OpenCode (à définir)
│
├── testdb.sql                # Script SQL de test (existant)
│
├── backup\                   # Sauvegardes du projet
│
├── image\                    # Captures d'écran, schémas, maquettes
│
├── package.json              # (à créer) Dépendances Node.js
├── .env                      # (à créer) Variables d'environnement
└── .gitignore                # (à créer) Fichiers à ignorer
```

---

## 3. Checklist des tâches restantes

### Phase A — Backend (API REST)

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| A1 | Initialiser le projet Node.js (`npm init`, `package.json`) | Haute | 30 min |
| A2 | Installer les dépendances (express, mariadb, dotenv, cors, bcrypt, jsonwebtoken) | Haute | 15 min |
| A3 | Créer la configuration de connexion MariaDB (`backend/config/db.js`) | Haute | 30 min |
| A4 | Mettre à jour le script SQL final (`database/schema.sql`) aligné avec le schéma journal séance 10 | Haute | 1h |
| A5 | Créer les modèles SQL (requêtes paramétrées) pour les 5 tables | Haute | 2h |
| A6 | Créer les routes et controllers REST (CRUD campagnes, locataires, créneaux) | Haute | 3h |
| A7 | Implémenter l'authentification entrepreneur (inscription / connexion JWT) | Haute | 2h |
| A8 | Implémenter la validation des entrées (middleware Joi ou validation manuelle) | Moyenne | 1h |
| A9 | Créer le point d'entrée `server.js` avec montage des routes | Haute | 30 min |
| A10 | Tester les endpoints avec curl ou Postman | Haute | 1h |

### Phase B — Connexion Frontend / Backend

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| B1 | Remplacer les mock data dans `script.js` par des appels fetch à l'API | Haute | 2h |
| B2 | Gérer les états de chargement et les erreurs API dans le frontend | Haute | 1h |
| B3 | Ajouter un formulaire de connexion pour les entrepreneurs | Moyenne | 1h |
| B4 | Implémenter la persistance des sessions (token JWT stocké localStorage) | Haute | 1h |

### Phase C — Tests

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| C1 | Écrire des tests d'intégration backend (supertest + jest) | Moyenne | 2h |
| C2 | Tester les contraintes métier (RG3 tri étage, RG4 pas chevauchement, RG9 pause 15 min) en backend | Haute | 1h30 |
| C3 | Tester les scénarios de bout en bout (création campagne → saisie locataires → génération planning) | Moyenne | 1h30 |
| C4 | Vérifier la compatibilité mobile du frontend (responsive) | Basse | 1h |

### Phase D — Documentation

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| D1 | Alimenter `05_Documentation_Technique.md` (architecture, modèle de données, guide d'installation, déploiement) | Haute | 2h |
| D2 | Compléter `04_Suivi_Modifications.md` avec l'historique | Moyenne | 30 min |
| D3 | Remplir le `TODO_LIST.md` avec les objectifs quotidiens | Basse | 15 min |
| D4 | Rédiger un README.md à la racine du projet (présentation, installation, usage) | Moyenne | 1h |

### Phase E — Fonctionnalités avancées

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| E1 | Portail locataire (page publique pour choisir un créneau) | Moyenne | 3h |
| E2 | Envoi d'emails d'invitation (nodemailer) | Basse | 2h |
| E3 | Import CSV des locataires | Basse | 2h |
| E4 | Export du planning en PDF | Basse | 2h |
| E5 | Dashboard avec statistiques réelles (au lieu des mock data) | Moyenne | 1h30 |

### Phase F — Déploiement

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| F1 | Préparer le `.env` et le `gitignore` | Haute | 15 min |
| F2 | Configurer un environnement de production (hébergement, base de données distante) | Basse | 2h |
| F3 | Mettre en place HTTPS et variables d'environnement | Basse | 1h |
| F4 | Déployer l'application (Render / Railway / VPS) | Basse | 2h |

---

## 4. Calendrier prévisionnel

Rythme observé : **~2-3 séances par jour**, séances de **~3h**.  
Estimation basée sur une disponibilité de **2 à 3 créneaux par jour**.

| Phase | Début | Fin | Séances estimées |
|-------|-------|-----|------------------|
| **A — Backend** | 21/05 | 23/05 | 4 séances |
| **B — Frontend/API** | 23/05 | 24/05 | 2 séances |
| **C — Tests** | 24/05 | 25/05 | 2 séances |
| **D — Documentation** | 25/05 | 26/05 | 1 séance |
| **E — Fonctionnalités avancées** | 26/05 | 29/05 | 4 séances |
| **F — Déploiement** | 29/05 | 30/05 | 1 séance |
| **Livraison finale** | **30/05** | — | — |

### Plan détaillé par jour

| Date | Séances | Objectif principal |
|------|---------|--------------------|
| 21/05 | 1 | Initialisation Node.js, dépendances, `db.js`, `schema.sql` final |
| 21/05 | 2 | Modèles SQL (5 tables) + routes campagnes |
| 22/05 | 3 | Routes locataires + créneaux + controllers |
| 22/05 | 4 | Authentification JWT + middleware |
| 23/05 | 5 | Connexion API → frontend (remplacement mock data) |
| 23/05 | 6 | Gestion erreurs, états chargement, formulaire connexion |
| 24/05 | 7 | Tests d'intégration backend + tests contraintes métier |
| 24/05 | 8 | Tests E2E (parcours complet) |
| 25/05 | 9 | Documentation technique + README + suivi |
| 26/05 | 10 | Portail locataire (choix créneau public) |
| 26/05 | 11 | Emails d'invitation |
| 27/05 | 12 | Import CSV |
| 27/05 | 13 | Export planning PDF |
| 28/05 | 14 | Dashboard stats réelles, finitions UI |
| 28/05 | 15 | Déploiement, `.env`, HTTPS, mise en production |
| 29/05 | 16 | Tests finaux, corrections, livraison |

---

## 5. Livrables intermédiaires et finaux

| Livrable | Format | Échéance | Statut |
|----------|--------|----------|--------|
| Cahier des charges / Spécifications | Markdown (`specifications/*.md`) | J1 (18/05) | ✅ Livré |
| Maquettes (wireframes) | ASCII dans Markdown | J1 (18/05) | ✅ Livré |
| Frontend v1 (mock data) | HTML/CSS/JS | J2 (19/05) | ✅ Livré |
| Schéma de base de données | Markdown + SQL | J2 (20/05) | ✅ Livré |
| Backend API REST | Node.js / Express | J4 (23/05) | ⬜ À faire |
| Frontend v2 (API réelle) | HTML/CSS/JS | J5 (24/05) | ⬜ À faire |
| Rapport de tests | Markdown | J5 (25/05) | ⬜ À faire |
| Documentation technique | `05_Documentation_Technique.md` | J6 (26/05) | ⬜ À faire |
| Portail locataire | HTML/JS (page publique) | J7 (27/05) | ⬜ À faire |
| Application déployée | URL accessible | J9 (29/05) | ⬜ À faire |
| **Livrable final complet** | Dossier structuré + code + docs | **J10 (30/05)** | ⬜ À faire |

---

## 6. Outils et bonnes pratiques

### Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | HTML5 + CSS3 + JavaScript (vanilla) | Léger, pas de dépendances, SPA par hash routing |
| Backend | Node.js + Express | Rapide à mettre en place, grande communauté |
| Base de données | MariaDB 10.11+ | Gratuit, proche de MySQL, fiable |
| Authentification | JWT (jsonwebtoken + bcrypt) | Sans état, facile à intégrer |
| Validation | Joi ou validation manuelle | Cohérence des données API |

### Bonnes pratiques recommandées

- **Versionnement Git** : commiter après chaque séance fonctionnelle (messages descriptifs)
- **Fichier `.env`** : stocker les variables sensibles (mot de passe BDD, secret JWT) — ne jamais commiter
- **`.gitignore`** : exclure `node_modules/`, `.env`, `backup/`
- **Convention de nommage** :
  - SQL : `snake_case` (tables, colonnes)
  - JavaScript : `camelCase` (variables, fonctions), `PascalCase` (classes)
  - Fichiers : `kebab-case` (dossiers et fichiers)
- **Tests** : tester au moins les routes critiques (création campagne, génération planning)
- **Sécurité** : valider toutes les entrées, utiliser des requêtes paramétrées (pas de concaténation SQL), hacher les mots de passe
- **Organisation des séances** : une tâche par séance, noter la durée dans le journal de bord

---

## 7. Points d'attention / risques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Incohérence schéma BDD** : le script `testdb.sql` utilise une structure différente (batiments, appartements) du schéma décrit en séance 10 (immeubles, entrepreneurs) | Élevé | Haute | Aligner le script SQL final sur le schéma du journal (séance 10) avant de commencer le backend |
| **Mock data vs données réelles** : le frontend est figé avec des données simulées, le branchement API demandera des adaptations | Moyen | Haute | Prévoir une couche de service dans `script.js` pour remplacer progressivement les fetch |
| **Absence de package.json** : le projet n'a pas encore de fichier de dépendances | Élevé | Haute | Initialiser `npm init` en début de phase A |
| **Rythme soutenu** : 3j de travail intensif, risque d'essoufflement | Faible | Moyenne | Prioriser les phases A→B→C avant les options (E) |
| **Pas de tests automatisés** actuellement | Moyen | Haute | Ajouter les tests en phase C avant les fonctionnalités avancées |
| **Sécurité** : mot de passe BDD en dur dans le code | Élevé | Moyenne | Utiliser `.env` dès le début du backend |
| **Dépendance à OpenCode** : certaines parties ont été générées par IA | Faible | Faible | Relire et comprendre le code généré avant de le modifier |

---

## 8. Prochaine action immédiate

**Priorité n°1 :** Initialiser le projet Node.js et aligner le schéma SQL final.

- `npm init -y` dans le dossier racine
- Copier/coller la structure du schéma séance 10 dans `database/schema.sql`
- Supprimer ou archiver `testdb.sql` (structure provisoire)
- Installer les dépendances : `npm install express mariadb dotenv cors bcrypt jsonwebtoken`
- Ajouter `node_modules/` et `.env` au `.gitignore`
- Créer `backend/config/db.js` avec la connexion MariaDB

---

*Plan généré le 21/05/2026 à partir du journal de bord (10 séances).*
