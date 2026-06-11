# Analyse complète du projet — Planif'Audit

**Application de planification d'audits énergétiques (DPE collectifs)**
**Version : 3.1 — Juin 2026**

---

## Vue d'ensemble

Planif'Audit est une application web qui aide un diagnostiqueur (entrepreneur en audits énergétiques) à organiser des campagnes de visites dans des immeubles collectifs. L'application permet de :

1. Créer des campagnes de visites (immeuble + logements + locataires)
2. Sélectionner automatiquement les logements à visiter (algorithme set cover)
3. Gérer les disponibilités du diagnostiqueur et des locataires
4. Générer un planning optimisé (tri par étage, pause 15 min, pas de chevauchement)
5. Envoyer des emails différenciés (visité / non visité / relance)

**Stack technique :** Node.js / Express (backend) + HTML/CSS/JS vanilla multi-page (frontend) + **MySQL (Sequelize)** — SQLite en mémoire pour les tests

---

## 1. ARCHITECTURE GÉNÉRALE

```
projet-audit-energetique/
├── .env                            # Variables d'environnement (DB, SMTP, JWT, rate-limit)
├── .env.template                   # Template des variables requises
├── package.json                    # Dépendances Node.js
├── opencode.json                   # Configuration OpenCode
├── ANALYSE_PROJET.md               # Ce fichier
├── analyse-deploiement.md          # Analyse des prérequis déploiement
├── exemple-set-cover.js            # Démo pédagogique de l'algorithme
├── exemple-set-cover.test.js       # Tests unitaires de l'algorithme (18 tests)
├── testdb.sql                      # Script SQL MariaDB (migration initiale)
│
├── frontend/                       # Interface utilisateur (multi-page)
│   ├── auth.html                   # Connexion / Inscription
│   ├── dashboard.html              # Tableau de bord + création campagne
│   ├── detail.html                 # Détail campagne (onglets)
│   ├── jours.html                  # Gestion jours disponibles
│   ├── planning.html               # Planning optimisé
│   ├── rdv.html                    # Page publique RDV (locataire)
│   ├── css/
│   │   └── style.css               # Design responsive
│   └── js/
│       ├── api.js                  # Helper API (fetch, auth, campagnes)
│       ├── auth.js                 # Login / Register UI
│       ├── dashboard.js            # Tableau de bord UI
│       ├── detail.js               # Détail campagne UI
│       ├── jours.js                # Jours disponibles UI
│       ├── planning.js             # Planning UI
│       ├── rdv.js                  # Page RDV publique UI
│       └── utils.js                # Utilitaires, RG3/RG4/RG9, mock data
│
├── backend/                        # Serveur Node.js (API REST)
│   ├── server.js                   # Point d'entrée : validation .env + Express + Sequelize
│   ├── app.js                      # Middleware CORS/JSON/rate-limit + routes + error handler
│   ├── config/
│   │   └── database.js             # Connexion Sequelize (MySQL / SQLite test)
│   ├── middlewares/
│   │   ├── auth.js                 # Authentification JWT
│   │   └── errorHandler.js         # Gestion globale (AppError, Sequelize errors)
│   ├── models/
│   │   ├── index.js                # Centralisation + associations Sequelize
│   │   ├── Entrepreneur.js         # entrepreneurs (bcrypt, JWT)
│   │   ├── Immeuble.js             # immeubles
│   │   ├── Campagne.js             # campagnes (JSON selection, soft delete)
│   │   ├── Logement.js             # logements (soft delete, FK typologie/planchers)
│   │   ├── Locataire.js            # locataires (token_acces unique)
│   │   ├── Creneau.js              # creneaux (contraintes unicité)
│   │   ├── JoursDisponible.js      # jours_disponibles (entrepreneur dispo)
│   │   ├── EmailEnvoye.js          # emails_envoyes (historique envois)
│   │   ├── Typologie.js            # typologies (référentiel T1-T6)
│   │   └── TypePlancher.js         # types_plancher (bas/haut référentiel)
│   ├── controllers/
│   │   ├── authController.js       # Inscription, connexion, profil
│   │   ├── immeubleController.js   # CRUD immeubles
│   │   ├── campagneController.js   # CRUD + sélection set cover + emails
│   │   ├── campagneJoursController.js  # Jours disponibles
│   │   ├── logementController.js   # CRUD logements
│   │   ├── locataireController.js  # Création batch locataires
│   │   ├── lienController.js       # Lien public RDV
│   │   └── referentielController.js# Listes statiques (typologies, planchers, positions)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── immeubleRoutes.js
│   │   ├── campagneRoutes.js       # Inclut logements, locataires, emails, relance
│   │   ├── campagneJoursRoutes.js
│   │   ├── referentielRoutes.js
│   │   └── lienRoutes.js           # Rate limiting dédié
│   ├── services/
│   │   ├── setCoverService.js      # Algorithme set cover (critères typo/pb/ph/pos)
│   │   └── emailService.js         # Templates email + envoi SMTP / Mailpit
│   ├── validations/                # Schémas Joi
│   │   ├── campagne.js
│   │   ├── campagneJours.js
│   │   ├── immeuble.js
│   │   ├── logement.js
│   │   └── lien.js
│   ├── tests/
│   │   ├── lien.test.js            # Tests unitaires + intégration (22 tests)
│   │   └── envoyer-emails.test.js  # Tests d'envoi d'emails (4 scénarios)
│   ├── db/
│   │   ├── migration.sql           # Script SQL colonnes supplémentaires
│   │   └── migrate.js              # Script Node.js de migration
│   ├── seed.js                     # Seed complet (référentiels + données test)
│   └── seed-campagne-test.js       # Seed campagne avancée (10 logements, 7 locataires)
│
├── specifications/                 # Cahier des charges complet
├── docs/                           # Documentation projet
├── image/                          # Captures d'écran (dashboard, détail, planning)
├── tools/
│   └── mailpit.exe                 # Serveur SMTP de test (Mailpit)
├── prompts/
│   └── prompts.log                 # Historique des prompts IA
├── backup/                         # Sauvegardes (vide)
└── node_modules/
```

---

## 2. FRONTEND (interface utilisateur)

### 2.1 Architecture multi-page

Le frontend est passé d'une **SPA** (single page avec hash routing) à une **architecture multi-page** avec 6 pages HTML indépendantes, chacune ayant son propre fichier JS dédié.

| Page | Fichier HTML | Fichier JS | Rôle |
|---|---|---|---|
| Authentification | `auth.html` | `auth.js` | Connexion / Inscription |
| Tableau de bord | `dashboard.html` | `dashboard.js` | Stats + liste campagnes + création |
| Détail campagne | `detail.html` | `detail.js` | Onglets (Réponses/Planning/Emails) |
| Jours disponibles | `jours.html` | `jours.js` | Gestion des jours de visite |
| Planning | `planning.html` | `planning.js` | Timeline visuelle + tableau |
| RDV public | `rdv.html` | `rdv.js` | Réservation créneau par locataire |

**Modules partagés :**
- `api.js` — Wrapper fetch avec token JWT, fonctions API auth + campagnes
- `utils.js` — Utilitaires DOM, toast, formatage, RG3/RG4/RG9, mock data (dev), chargement référentiels

### 2.2 `frontend/css/style.css`

**Rôle :** Design responsive de l'application (même palette que l'ancien SPA).

**Responsabilités :**
- Palette : vert (#2ecc71) / orange (#e67e22) / bleu (#3498db)
- Composants : topbar, stats, cards, tables, tabs, timeline, badges, forms, toasts
- Responsive mobile-first (breakpoints : 480px, 768px, 1024px)

### 2.3 Utilitaires (`utils.js`)

**Rôle :** Fonctions partagées entre toutes les pages (~307 lignes).

**Règles métier intégrées :**
- **RG3** : Tri par étage croissant (`sortByFloor`)
- **RG4** : Pas de chevauchement des créneaux
- **RG9** : Pause 15 min entre visites (`generatePlanning`)

**Données mockées (dev uniquement) :** 3 campagnes fictives dans `APP.campaigns` activées uniquement si `location.hostname === 'localhost'`.

---

## 3. BACKEND (API REST)

### 3.1 `server.js` — Point d'entrée

**Rôle :** Démarre le serveur Express + connexion MySQL + sert les fichiers statiques.

**Responsabilités :**
- **Validation au démarrage** : vérifie que `JWT_SECRET` et `BASE_URL` sont définis (exit si absent)
- Sert les fichiers statiques du frontend (`frontend/`)
- Routes dédiées : `/auth`, `/dashboard`, `/detail`, `/jours`, `/planning`, `/rendez-vous/:token`
- Catch-all API : `GET /api/*` → 404
- Connecte MySQL via Sequelize, synchronise les modèles, puis démarre le serveur

### 3.2 `app.js` — Application Express

**Rôle :** Configure les middlewares et monte les routes.

**Responsabilités :**
- CORS (permissif)
- `express.json()`
- Rate limiting global (100 req/15 min, désactivable en test)
- Route santé : `GET /api/health`
- Montage des routes (voir §3.6)
- Middleware global `errorHandler`

### 3.3 Middlewares

#### `middlewares/auth.js`
JWT : vérifie `Authorization: Bearer <token>`, attache `req.entrepreneur`.

#### `middlewares/errorHandler.js`
Gère `AppError`, `ValidationError` (Sequelize), `UniqueConstraintError`.

---

### 3.4 Modèles Sequelize (MySQL)

| Fichier | Table | Champs principaux |
|---|---|---|
| `models/Entrepreneur.js` | entrepreneurs | nom, email, mot_de_passe_hash (bcrypt), telephone, date_creation |
| `models/Immeuble.js` | immeubles | nom, adresse, nb_etages, id_entrepreneur, typologie, annee_construction, plancher_bas, plancher_haut, surface_totale |
| `models/Campagne.js` | campagnes | batiment_id, nom, date_debut_possible, date_fin_possible, statut (brouillon/en_cours/ouverte/planification_terminee/termine), nb_min_visites, pct_min_visites, selection (JSON), deleted_at |
| `models/Logement.js` | logements | batiment_id, numero, etage, locataire_id, id_typologie, id_type_plancher_bas, id_type_plancher_haut, position, selectionne_visite, surface, loyer_estime, statut, deleted_at |
| `models/Locataire.js` | locataires | prenom, nom, email, telephone, date_inscription, token_acces (unique) |
| `models/Creneau.js` | creneaux | id_logement, id_campagne, id_jour_disponible, date_visite, heure_debut, heure_fin, ordre_visite, statut (propose/reserve/confirme/effectue/annule) |
| `models/JoursDisponible.js` | jours_disponibles | id_entrepreneur, date, est_disponible (unicité id_entrepreneur+date) |
| `models/EmailEnvoye.js` | emails_envoyes | id_locataire, id_campagne, type (visite_programmee/pas_de_visite/relance/...), date_envoi, statut, destinataire, sujet, corps, erreur |
| `models/Typologie.js` | typologies | code (T1-T6), nb_pieces, surface_min_m2, surface_max_m2 |
| `models/TypePlancher.js` | types_plancher | categorie (bas/haut), nom, description |

**Associations clés (`models/index.js`) :**
- Entrepreneur → Immeubles (1:N)
- Immeuble → Logements (1:N), Campagnes (1:N)
- Logement → Typologie (N:1), TypePlancher (N:1 pour bas/haut)
- Locataire → Logement (1:N)
- Campagne → Creneaux (1:N), EmailEnvoye (1:N)
- Logement → Creneau (1:N)

---

### 3.5 Contrôleurs

#### `authController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `register` | POST | /api/auth/register |
| `login` | POST | /api/auth/login |
| `getMe` | GET | /api/auth/me |

#### `immeubleController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `list` | GET | /api/entrepreneur/immeubles |
| `create` | POST | /api/entrepreneur/immeubles |

#### `campagneController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `store` | POST | /api/entrepreneur/campagnes |
| `index` | GET | /api/entrepreneur/campagnes |
| `show` | GET | /api/entrepreneur/campagnes/:id |
| `lancerSelection` | POST | /api/entrepreneur/campagnes/:id/lancer-selection |
| `listEmails` | GET | /api/entrepreneur/campagnes/:id/emails |
| `envoyerEmails` | POST | /api/entrepreneur/campagnes/:id/envoyer-emails |
| `envoyerRelances` | POST | /api/entrepreneur/campagnes/:id/relancer |

#### `logementController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `storeBatch` | POST | /api/entrepreneur/campagnes/:id/logements |
| `update` | PUT | /api/entrepreneur/campagnes/:campagne_id/logements/:logement_id |
| `delete` | DELETE | ... (soft delete) |

#### `locataireController.js` — NOUVEAU
| Fonction | Méthode | URL |
|---|---|---|
| `storeBatch` | POST | /api/entrepreneur/campagnes/:id/locataires |

Crée plusieurs locataires en batch, génère un `token_acces` (64 hex) pour chaque, et lie chaque locataire à un logement.

#### `campagneJoursController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `recupererJours` | GET | /api/entrepreneur/campagnes/:id/jours-disponibles |
| `remplacerJours` | PUT | ... |

#### `lienController.js`
| Fonction | Méthode | URL |
|---|---|---|
| `getLien` | GET | /api/liens/:token |
| `postCreneau` | POST | /api/liens/:token/creneaux |

Envoie un **email de confirmation** au locataire après réservation (via `emailService`).

#### `referentielController.js`
| Fonction | Méthode |
|---|---|
| `getTypologies` | GET /api/referentiel/typologies |
| `getPlancherBas` | GET /api/referentiel/plancher-bas |
| `getPlancherHaut` | GET /api/referentiel/plancher-haut |
| `getPositions` | GET /api/referentiel/positions |

---

### 3.6 Routes

| Fichier | Routes | Middleware | Rate limit |
|---|---|---|---|
| `routes/authRoutes.js` | POST /register, POST /login, GET /me | `auth` sur GET /me | Global |
| `routes/immeubleRoutes.js` | GET /, POST / | `auth` | Global |
| `routes/campagneRoutes.js` | POST /, GET /, GET /:id, POST /:id/logements, PUT /:campagne_id/logements/:logement_id, DELETE /... , POST /:id/lancer-selection, GET /:id/emails, POST /:id/locataires, POST /:id/envoyer-emails, POST /:id/relancer | `auth` | Global |
| `routes/campagneJoursRoutes.js` | PUT /jours-disponibles, GET /jours-disponibles | `auth` (mergeParams) | Global |
| `routes/referentielRoutes.js` | GET /typologies, GET /plancher-bas, GET /plancher-haut, GET /positions | Aucun | Global |
| `routes/lienRoutes.js` | GET /:token, POST /:token/creneaux | Aucun | **Dédié : 10 req/min** |

---

### 3.7 Services métier

#### `services/setCoverService.js` — Algorithme set cover

Mêmes règles que l'ancienne version (RG11-RG15) mais adapté à Sequelize :

| Règle | Critère |
|---|---|
| RG11 | 1 logement par typologie (`typo:T1`, `typo:T2`, ...) |
| RG12 | 1 logement par type de plancher bas (`pb:terre-plein`, ...) |
| RG13 | 1 logement par type de plancher haut (`ph:combles`, ...) |
| RG14 | 1 logement par position (`pos:bas`, `pos:intermediaire`, `pos:haut`) |
| RG15 | Seuil minimal (0 si <31 logements, 10% si 31-100, 5% si >100) |

**Fonctions :** `construireCriteres`, `criteresCouvertPar`, `selectionSetCover` (glouton), `calculerSeuilMinimal`, `completerJusquaSeuil`, `lancerSelection`.

#### `services/emailService.js` — NOUVEAU

**Rôle :** Envoi d'emails via SMTP (ou simulation console).

**Templates :**
- `templateVisiteProgrammee` — lien pour choisir créneau
- `templatePasDeVisite` — information (pas de visite)
- `templateRelance` — relance pour non-répondants
- `templateConfirmation` — confirmation après réservation

**SMTP :** Configurable via `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Fallback sur `console.log` si non configuré. Compatible Mailpit (outil de test dans `tools/mailpit.exe`).

---

### 3.8 Validations Joi

| Fichier | Schéma | Valide |
|---|---|---|
| `validations/campagne.js` | `creerCampagne` | immeuble_id, nom, statut |
| `validations/campagneJours.js` | `mettreAJoursDisponibles` | tableau de dates ISO (min 1) |
| `validations/immeuble.js` | `creerImmeuble` | nom, adresse, typologie (T1-T6), annee, planchers, surface, étages |
| `validations/logement.js` | `creerLogements`, `updateLogement` | numero, etage, surface, typologie, planchers, position, statut |
| `validations/lien.js` | `creneauSchema` | date_visite (ISO), heure_debut, heure_fin (HH:MM) |

---

## 4. FLUX EMAIL

### 4.1 Envoi d'emails différenciés

```
POST /api/entrepreneur/campagnes/:id/envoyer-emails
  → Pour chaque logement avec locataire :
     ├── si selectionne_visite === true  → templateVisiteProgrammee (lien RDV)
     └── si selectionne_visite === false → templatePasDeVisite
  → Enregistre chaque envoi dans EmailEnvoye
  → Retourne { total, total_envoyes, total_erreurs, details }

POST /api/entrepreneur/campagnes/:id/relancer
  → Filtre les locataires sélectionnés sans créneau
  → templateRelance pour chaque non-répondant
  → Enregistre dans EmailEnvoye
```

### 4.2 Email de confirmation (réservation locataire)

```
POST /api/liens/:token/creneaux
  → Réservation + email de confirmation via templateConfirmation
```

---

## 5. CONFIGURATION ET DÉPLOIEMENT

### 5.1 Variables d'environnement (`.env`)

| Variable | Rôle |
|---|---|
| `PORT` | Port serveur (défaut 3000) |
| `BASE_URL` | URL publique (liens emails) — **obligatoire** |
| `JWT_SECRET` | Clé secrète JWT — **obligatoire** |
| `JWT_EXPIRE` | Durée validité token (défaut 7d) |
| `DB_HOST/PORT/NAME/USER/PASS` | Connexion MySQL |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Connexion SMTP |
| `RATE_LIMIT_WINDOW_MS/MAX` | Rate limiting global |
| `RATE_LIMIT_PUBLIC_WINDOW_MS/MAX` | Rate limiting routes publiques |

### 5.2 Base de données

- **MySQL** en production / développement (via Sequelize)
- **SQLite** en mémoire pour les tests (`NODE_ENV=testing`)
- Migration depuis MongoDB vers MySQL effectuée

### 5.3 Scripts npm

| Commande | Description |
|---|---|
| `npm start` | Production |
| `npm run dev` | Développement (nodemon) |
| `npm test` | Tests lien (unitaires + intégration) |
| `npm run seed` | Seed base de données (référentiels + données test) |
| `npm run migrate` | Migration colonnes supplémentaires |

---

## 6. TESTS AUTOMATISÉS

| Suite | Fichier | Nb tests | Type |
|---|---|---|---|
| Set cover (unitaire) | `exemple-set-cover.test.js` | 18 | `node:test` |
| Liens RDV (unitaire) | `backend/tests/lien.test.js` | 11 (timeToMinutes + chevauche) | `node:test` |
| Liens RDV (intégration) | `backend/tests/lien.test.js` | 11 | `supertest` + SQLite mémoire |
| Envoi emails (intégration) | `backend/tests/envoyer-emails.test.js` | 4 scénarios | `supertest` + SQLite mémoire |

**Exécution :** `npm test` → 22 tests (lien.test.js). Le test email s'exécute via `node backend/tests/envoyer-emails.test.js`.

---

## 7. SÉCURITÉ

### Rate limiting
- **Global** : 100 req / 15 min sur `/api/` (configurable)
- **Liens publics** : 10 req / min sur `/api/liens` (configurable)
- Désactivé en test (limite à 1000 req)

### Authentification
- Mots de passe hashés avec **bcrypt**
- Tokens **JWT** pour les sessions
- Validation de `JWT_SECRET` au démarrage du serveur (pas de secret vide)

### Gestion d'erreurs
- Middleware global `errorHandler`
- Classe `AppError` pour erreurs métier
- Gestion des erreurs Sequelize (validation, contrainte unicité)

---

## 8. SPÉCIFICATIONS ET DOCUMENTATION

| Fichier | Contenu |
|---|---|
| `specifications/brief-projet.md` | Contexte, objectifs, contraintes DPE |
| `specifications/user-stories.md` | 22 user stories |
| `specifications/personas.md` | 5 personas |
| `specifications/wireframes.md` | 8 écrans ASCII |
| `specifications/regles-gestion.md` | 17 règles métier (RG1-RG17) |
| `specifications/cas-utilisation.md` | 13 cas d'utilisation |
| `specifications/glossaire.md` | 35 termes |
| `docs/01_Plan_Organisation_Projet.md` | Plan complet (phases A-F) |
| `docs/02_Specifications.md` | Dossier de conception |
| `docs/03_Journal_de_Bord.md` | Journal des séances |
| `docs/04_Suivi_Modifications.md` | Historique des versions |
| `docs/05_Documentation_Technique.md` | Documentation technique |
| `docs/db_documentation.md` | Documentation BDD MariaDB |
| `docs/TODO_LIST.md` | Liste des tâches |
| `analyse-deploiement.md` | Analyse des prérequis déploiement |

---

## 9. DIAGRAMME DE LIENS

```
[Client Navigateur]
    │
    ├── frontend/auth.html ──→ js/auth.js ──→ js/api.js
    ├── frontend/dashboard.html ──→ js/dashboard.js ──→ js/api.js
    ├── frontend/detail.html ──→ js/detail.js ──→ js/api.js
    ├── frontend/jours.html ──→ js/jours.js ──→ js/api.js
    ├── frontend/planning.html ──→ js/planning.js ──→ js/api.js
    ├── frontend/rdv.html ──→ js/rdv.js (API publique)
    └── tous → css/style.css, js/utils.js

[backend/server.js] ──→ .env
    │              ──→ frontend/ (statique)
    │              ──→ sequelize.authenticate() + sync()
    │
    └── app.js (CORS, JSON, rate limiting global)
        │
        ├── middlewares/errorHandler.js
        ├── middlewares/auth.js (JWT)
        │
        ├── routes/authRoutes.js
        │   └── authController.js → Entrepreneur
        │
        ├── routes/immeubleRoutes.js
        │   └── immeubleController.js → Immeuble + validation Joi
        │
        ├── routes/campagneRoutes.js
        │   ├── campagneController.js
        │   │   ├── Campagne, Immeuble, Logement, Locataire
        │   │   ├── Creneau, EmailEnvoye, Typologie, TypePlancher
        │   │   └── setCoverService.js + emailService.js
        │   ├── logementController.js → Logement + validation Joi
        │   └── locataireController.js → Locataire
        │
        ├── routes/campagneJoursRoutes.js
        │   └── campagneJoursController.js → JoursDisponible
        │
        ├── routes/lienRoutes.js (rate limiting dédié)
        │   └── lienController.js
        │       ├── Locataire, Campagne, Immeuble, Creneau
        │       ├── JoursDisponible + validation Joi
        │       └── emailService.js (confirmation)
        │
        └── routes/referentielRoutes.js
            └── referentielController.js → Typologie, TypePlancher
```

---

## 10. RÉSUMÉ DU FLUX MÉTIER

```
 1. ENTREPRENEUR S'INSCRIT / SE CONNECTE          ✅ IMPLÉMENTÉ
    └── POST /api/auth/register ou /login → token JWT

 2. CRÉE UN IMMEUBLE                               ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/immeubles

 3. CRÉE UNE CAMPAGNE                              ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes

 4. AJOUTE LES LOGEMENTS                           ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/logements

 5. AJOUTE LES LOCATAIRES                          ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/locataires
    └── Génération automatique de token_acces

 6. LANCE L'ALGORITHME DE SÉLECTION                ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/lancer-selection
    └── Set cover (RG11-RG15) + seuil minimal

 7. CHOISIT SES JOURS DISPONIBLES                  ✅ IMPLÉMENTÉ
    └── PUT /api/entrepreneur/campagnes/:id/jours-disponibles

 8. ENVOIE LES EMAILS AUX LOCATAIRES               ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/envoyer-emails
    └── Visités → lien RDV | Non visités → information

 9. LES LOCATAIRES RÉSERVENT LEUR CRÉNEAU          ✅ IMPLÉMENTÉ
    └── GET /api/liens/:token → infos + jours dispo
    └── POST /api/liens/:token/creneaux → réservation + confirmation email

10. RELANCE LES NON-RÉPONDANTS                     ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/relancer

11. GÉNÈRE LE PLANNING OPTIMISÉ                    ✅ IMPLÉMENTÉ (côté frontend)
    └── RG3 : tri par étage
    └── RG4 : pas de chevauchement
    └── RG9 : pause 15 min entre visites
```

---

## 11. DÉPENDANCES (package.json)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",                 // Hash des mots de passe
    "cors": "^2.8.5",                   // Cross-Origin Resource Sharing
    "dotenv": "^16.3.1",                // Variables d'environnement
    "express": "^4.18.2",               // Framework web
    "express-rate-limit": "^8.5.2",     // Rate limiting
    "joi": "^17.11.0",                  // Validation des entrées
    "jsonwebtoken": "^9.0.2",           // Tokens JWT
    "mariadb": "^3.5.2",                // Driver MariaDB
    "mysql2": "^3.6.5",                 // Driver MySQL
    "nodemailer": "^6.9.7",             // Envoi d'emails
    "sequelize": "^6.37.7"              // ORM SQL
  },
  "devDependencies": {
    "nodemon": "^3.0.2",                // Rechargement automatique
    "sqlite3": "^5.1.7",                // Base SQLite pour tests
    "supertest": "^7.2.2"               // Tests HTTP
  }
}
```

**Différences clés avec l'ancienne version :**
- `mongoose` retiré (remplacé par `sequelize`)
- `mariadb` ajouté
- `sqlite3` ajouté (devDependencies, pour les tests)
- `nodemon` passé en devDependencies

---

## 12. NOTES IMPORTANTES

- **Migration MongoDB → MySQL** : le projet utilisait auparavant MongoDB (Mongoose). La migration vers MySQL (Sequelize) est terminée. SQLite est utilisé en mémoire pour les tests.
- **Frontend multi-page** : passage d'une SPA à 6 pages HTML indépendantes, chacune avec son propre fichier JS. Les fonctions partagées sont dans `api.js` et `utils.js`.
- **Envoi d'emails fonctionnel** : 4 templates HTML, envoi SMTP configurable, fallback console. Compatible Mailpit pour les tests. Email de confirmation envoyé après réservation RDV.
- **Seed et migration** : scripts dédiés pour initialiser la base (`npm run seed`) et migrer les colonnes (`npm run migrate`).
- **Sécurité** : vérification de `JWT_SECRET` et `BASE_URL` au démarrage. Rate limiting global et dédié. Gestion d'erreurs Sequelize.
- **Données mockées** : 3 campagnes fictives conservées dans `utils.js`, activées uniquement en localhost (dev).
- **Tests** : 22 tests pour le module RDV + 4 scénarios d'envoi d'emails + 18 tests set cover.
- **Algorithme set cover** : utilise 4 critères (typo, plancher_bas, plancher_haut, position). Algorithme glouton + complétion au seuil minimal.
