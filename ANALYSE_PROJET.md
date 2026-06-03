# Analyse complète du projet — Planif'Audit

**Application de planification d'audits énergétiques (DPE collectifs)**
**Version : 3.0 — Juin 2026**

---

## Vue d'ensemble

Planif'Audit est une application web qui aide un diagnostiqueur (entrepreneur en audits énergétiques) à organiser des campagnes de visites dans des immeubles collectifs. L'application permet de :

1. Créer des campagnes de visites (immeuble + logements + locataires)
2. Sélectionner automatiquement les logements à visiter (algorithme set cover)
3. Gérer les disponibilités du diagnostiqueur et des locataires
4. Générer un planning optimisé (tri par étage, pause 15 min, pas de chevauchement)
5. Envoyer des emails différenciés (visité / non visité)

**Stack technique :** Node.js / Express (backend) + HTML/CSS/JS vanilla (frontend) + MongoDB (Mongoose) + MariaDB (cible future)

---

## 1. ARCHITECTURE GÉNÉRALE

```
projet-audit-energetique/
├── index.html                     # Frontend — SPA (dashboard, campagne, planning, auth, RDV)
├── styles.css                     # Styles CSS (responsive, thème, page RDV)
├── script.js                      # Logique frontend (API réelle + fallback mock)
├── backend/                       # Serveur Node.js (API REST)
│   ├── server.js                  # Point d'entrée : démarre Express + MongoDB + statique
│   ├── app.js                     # Middleware CORS/JSON/rate-limit + montage des routes + error handler
│   ├── config/                    # (dossier vide — connexion DB à configurer)
│   ├── middlewares/
│   │   ├── auth.js                # Authentification JWT
│   │   └── errorHandler.js        # Gestion globale des erreurs (AppError + handler)
│   ├── models/                    # Schémas Mongoose (MongoDB)
│   │   ├── Entrepreneur.js
│   │   ├── Immeuble.js
│   │   ├── Campagne.js
│   │   ├── Logement.js
│   │   ├── Locataire.js
│   │   └── Creneau.js             # Créneaux horaires réservés par les locataires
│   ├── controllers/
│   │   ├── authController.js      # Inscription, connexion, profil
│   │   ├── immeubleController.js  # CRUD immeubles
│   │   ├── campagneController.js  # CRUD campagnes + lancer sélection set cover
│   │   ├── logementController.js  # CRUD logements
│   │   ├── campagneJoursController.js  # Jours disponibles du diagnostiqueur
│   │   ├── referentielController.js    # Listes statiques (typologies, planchers)
│   │   └── lienController.js      # Lien public RDV (infos locataire + réservation créneau)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── immeubleRoutes.js
│   │   ├── campagneRoutes.js
│   │   ├── campagneJoursRoutes.js
│   │   ├── referentielRoutes.js
│   │   └── lienRoutes.js          # Routes publiques avec rate limiting dédié
│   ├── services/
│   │   └── setCoverService.js     # Algorithme de sélection (cœur métier)
│   ├── validations/               # Schémas Joi
│   │   ├── campagne.js
│   │   ├── campagneJours.js
│   │   ├── immeuble.js
│   │   ├── logement.js
│   │   └── lien.js                # Validation créneau (date, heure_debut, heure_fin)
│   └── tests/
│       └── lien.test.js           # Tests unitaires + intégration (22 tests)
├── specifications/                # Cahier des charges complet
├── docs/                          # Documentation projet
├── Agent.ia/                      # Configuration agent IA (OpenCode)
├── exemple-set-cover.js           # Démo pédagogique de l'algorithme
├── exemple-set-cover.test.js      # Tests unitaires de l'algorithme (18 tests)
├── testdb.sql                     # Script SQL (migration MariaDB — cible future)
└── package.json                   # Dépendances Node.js
```

---

## 2. FRONTEND (interface utilisateur)

### 2.1 `index.html` — Page principale

**Rôle :** Structure de l'interface utilisateur (SPA — Single Page Application).

**Vues disponibles :**
- **Authentification** (`#view-auth`) : formulaire connexion / inscription
- **Tableau de bord** (`#view-dashboard`) : stats + liste des campagnes + création (2 étapes)
- **Détail campagne** (`#view-detail`) : réponses des locataires + planning + onglets
- **Planning optimisé** (`#view-planning`) : timeline visuelle + tableau détaillé
- **Page RDV publique** (`#view-rdv`) : sélection jour/heure par le locataire (token)

**Navigation :** Hash routing (`#dashboard`, `#campaign/{id}`, `#planning/{id}`, `#rendez-vous/{token}`).

**Dépendances :** `styles.css` + `script.js`.

---

### 2.2 `styles.css` — Feuille de styles

**Rôle :** Design responsive de l'application.

**Responsabilités :**
- Palette de couleurs : vert (#2ecc71) / orange (#e67e22) / bleu (#3498db)
- Composants : topbar, stats, cards, tables, tabs, timeline, badges, form, toasts, auth form, RDV page
- Responsive mobile-first (breakpoints : 480px, 768px, 1024px)
- Animations (toasts slideIn, spinner charges)

---

### 2.3 `script.js` — Logique frontend

**Rôle :** Contrôleur principal (~1200 lignes). Connecté aux **API réelles** avec **fallback mock** en cas d'absence du serveur.

**Responsabilités :**
- **Authentification :** inscription, connexion, stockage du token JWT (localStorage), déconnexion
- **Routing SPA :** navigation par hash, protection des routes (redirection si non connecté)
- **Tableau de bord :** stats réelles, liste des campagnes, création (2 étapes)
- **Détail campagne :** onglets (Réponses / Planning), relance, génération de liens
- **Planning optimisé :** timeline visuelle, tableau détaillé, modification de créneaux
- **Page RDV publique :** infos locataire, sélecteur jour/heure, réservation, confirmation
- **Règles métier intégrées :** RG3 (tri étage), RG4 (pas chevauchement), RG9 (pause 15 min)
- **Fallback :** si l'API n'est pas joignable, utilise les 3 campagnes mockées

**Fonctions clés :**
| Fonction | Rôle |
|---|---|
| `navigate(hash)` | Routage SPA |
| `renderAuth()` | Affiche le formulaire login/register |
| `handleLogin/Register` | Appelle les API auth + stocke le token |
| `renderDashboard()` | Affiche le tableau de bord |
| `renderDetail(id)` | Affiche le détail d'une campagne |
| `renderPlanning(id)` | Affiche le planning optimisé |
| `renderRdv(token)` | Affiche la page publique RDV |
| `generatePlanning(locataires)` | Applique RG3 + RG4 + RG9 |
| `apiFetch(url, options)` | Wrapper fetch avec token + fallback mock |
| `toast(message, type)` | Notification utilisateur |

---

## 3. BACKEND (API REST)

### 3.1 `server.js` — Point d'entrée

**Rôle :** Démarre le serveur Express + connexion MongoDB + sert les fichiers statiques.

**Responsabilités :**
- Charge le fichier `.env` (variables d'environnement)
- Sert les fichiers statiques du frontend (index.html, script.js, styles.css)
- Redirige toutes les routes non-API vers index.html (SPA fallback)
- Se connecte à MongoDB via Mongoose
- Lance le serveur sur le port configuré (3000 par défaut)

**Dépendances :** `mongoose`, `dotenv`, `app.js`

---

### 3.2 `app.js` — Application Express

**Rôle :** Configure les middlewares et monte les routes.

**Responsabilités :**
- Middleware CORS (autorise les requêtes cross-origin)
- Middleware `express.json()` (parse le JSON)
- **Rate limiting** (express-rate-limit) : limite à 100 requêtes/15 min sur `/api/` (configurable via `.env`)
- Route de santé : `GET /api/health`
- Montage des routes :
  - `/api/auth` → authentification
  - `/api/entrepreneur/immeubles` → immeubles
  - `/api/entrepreneur/campagnes` → campagnes + logements
  - `/api/entrepreneur/campagnes/:id` → jours disponibles
  - `/api/liens` → liens publics RDV (avec rate limiting dédié : 10 req/min)
  - `/api/referentiel` → référentiels
- Middleware global de gestion d'erreurs (`errorHandler`)

**Dépendances :** `cors`, `express`, `express-rate-limit`, `routes/*`, `middlewares/errorHandler`

---

### 3.3 `middlewares/auth.js` — Authentification JWT

**Rôle :** Vérifie que l'utilisateur est authentifié avant d'accéder aux routes protégées.

**Responsabilités :**
- Extrait le token JWT du header `Authorization: Bearer <token>`
- Vérifie le token avec `jsonwebtoken`
- Récupère l'entrepreneur correspondant dans MongoDB
- Attache `req.entrepreneur` (id, nom, email, role) pour les contrôleurs

**Dépendances :** `jsonwebtoken`, `models/Entrepreneur`

---

### 3.4 `middlewares/errorHandler.js` — Gestionnaire d'erreurs global

**Rôle :** Capture et formate toutes les erreurs de l'application.

**Responsabilités :**
- **AppError** : classe d'erreur métier avec code HTTP (`new AppError(message, 400)`)
- Gère les erreurs Mongoose (ValidationError → 400, code 11000 doublon → 409)
- Erreurs non gérées → 500 avec log console

**Exports :** `AppError`, `errorHandler`

---

### 3.5 Contrôleurs (la logique métier)

#### `controllers/authController.js`
**Rôle :** Gère l'inscription, la connexion et le profil.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `register` | POST | /api/auth/register | Crée un compte entrepreneur (nom, email, motDePasse, telephone, entreprise) |
| `login` | POST | /api/auth/login | Connecte un entrepreneur (email + motDePasse) → retourne un token JWT |
| `getMe` | GET | /api/auth/me | Retourne le profil de l'utilisateur connecté (protégé) |

**Dépendances :** `models/Entrepreneur`

---

#### `controllers/immeubleController.js`
**Rôle :** CRUD des immeubles.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `list` | GET | /api/entrepreneur/immeubles | Liste tous les immeubles de l'entrepreneur connecté |
| `create` | POST | /api/entrepreneur/immeubles | Crée un immeuble (nom, adresse, typologie, nb_etages, planchers, etc.) |

**Dépendances :** `models/Immeuble`, `validations/immeuble`

---

#### `controllers/campagneController.js`
**Rôle :** Gère les campagnes de visites et l'algorithme de sélection.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `store` | POST | /api/entrepreneur/campagnes | Crée une campagne liée à un immeuble |
| `index` | GET | /api/entrepreneur/campagnes | Liste les campagnes de l'entrepreneur |
| `show` | GET | /api/entrepreneur/campagnes/:id | Détail d'une campagne (avec logements et locataires) |
| `lancerSelection` | POST | /api/entrepreneur/campagnes/:id/lancer-selection | Lance l'algorithme set cover |

**Algorithme de sélection :** Utilise `setCoverService.js` pour :
1. Déterminer les critères obligatoires (typologies, planchers, position étage)
2. Choisir le **minimum de logements** qui couvre tous les critères (glouton)
3. Compléter jusqu'au seuil minimal réglementaire (RG15)
4. Marquer les logements sélectionnés (`selectionne_visite: true`)

**Dépendances :** `models/Campagne`, `models/Immeuble`, `models/Logement`, `services/setCoverService`

---

#### `controllers/campagneJoursController.js`
**Rôle :** Gère les jours de disponibilité du diagnostiqueur pour une campagne.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `recupererJours` | GET | /api/entrepreneur/campagnes/:id/jours-disponibles | Récupère les jours disponibles |
| `remplacerJours` | PUT | /api/entrepreneur/campagnes/:id/jours-disponibles | Remplace les jours disponibles (validation intervalle + doublons) |

**Dépendances :** `models/Campagne`, `validations/campagneJours`

---

#### `controllers/logementController.js`
**Rôle :** CRUD des logements (appartements) dans une campagne.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `storeBatch` | POST | /api/entrepreneur/campagnes/:id/logements | Crée plusieurs logements en une requête |
| `update` | PUT | /api/entrepreneur/campagnes/:campagne_id/logements/:logement_id | Modifie un logement |
| `delete` | DELETE | /api/entrepreneur/campagnes/:campagne_id/logements/:logement_id | Suppression logique (soft delete) |

**Champ `position` :** Chaque logement a une position d'étage (`bas`, `intermediaire`, `haut`) utilisée par l'algorithme set cover pour la règle RG14.

**Dépendances :** `models/Logement`, `models/Campagne`, `validations/logement`

---

#### `controllers/referentielController.js`
**Rôle :** Fournit les listes de référentiels (données statiques).

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `getTypologies` | GET | /api/referentiel/typologies | Liste [T1, T2, T3, T4, T5, T6] |
| `getPlancherBas` | GET | /api/referentiel/plancher-bas | Types de plancher bas |
| `getPlancherHaut` | GET | /api/referentiel/plancher-haut | Types de plancher haut |

---

#### `controllers/lienController.js` — **NOUVEAU**

**Rôle :** Gère les liens publics permettant aux locataires de réserver un créneau de visite.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `getLien` | GET | /api/liens/:token | Retourne les infos du locataire et les jours disponibles |
| `postCreneau` | POST | /api/liens/:token/creneaux | Réserve un créneau (date + heure début/fin) |

**Fonctions utilitaires exportées :**
- `timeToMinutes(t)` : convertit "HH:MM" en minutes (ex: "09:00" → 540)
- `chevauche(d1, f1, d2, f2)` : détecte le chevauchement entre deux plages horaires

**Règles appliquées :**
- Validation Joi : date ISO, heures au format HH:MM, heure_fin > heure_debut
- Vérification que la date est dans les jours disponibles de la campagne
- Vérification qu'aucun créneau n'existe déjà pour ce locataire
- Détection des chevauchements avec les créneaux existants sur la même date
- Email simulé dans la console (nodemailer installé mais pas encore branché)

**Dépendances :** `models/Locataire`, `models/Campagne`, `models/Creneau`, `validations/lien`

---

### 3.6 Routes (définition des URL)

Chaque fichier de routes monte les chemins et associe les contrôleurs :

| Fichier | Routes | Middleware | Rate limit |
|---|---|---|---|
| `routes/authRoutes.js` | POST /register, POST /login, GET /me | `auth` sur GET /me | Global |
| `routes/immeubleRoutes.js` | GET /, POST / | `auth` | Global |
| `routes/campagneRoutes.js` | POST /, GET /, GET /:id, POST /:id/logements, PUT /:campagne_id/logements/:logement_id, DELETE /:campagne_id/logements/:logement_id, POST /:id/lancer-selection | `auth` | Global |
| `routes/campagneJoursRoutes.js` | PUT /jours-disponibles, GET /jours-disponibles | `auth` (mergeParams) | Global |
| `routes/referentielRoutes.js` | GET /typologies, GET /plancher-bas, GET /plancher-haut | Aucun (public) | Global |
| `routes/lienRoutes.js` | GET /:token, POST /:token/creneaux | Aucun (public) | **Dédié : 10 req/min** |

---

### 3.7 Modèles Mongoose (schémas MongoDB)

| Fichier | Collection | Champs principaux |
|---|---|---|
| `models/Entrepreneur.js` | entrepreneurs | nom, email, motDePasse (hashé bcrypt), telephone, entreprise, role |
| `models/Immeuble.js` | immeubles | nom, adresse, typologie, annee_construction, plancher_bas, plancher_haut, surface_totale, nombre_etages, id_entrepreneur |
| `models/Campagne.js` | campagnes | immeuble_id, nom, date_debut, date_fin, statut (brouillon/en_cours/termine), jours_disponibles, deletedAt |
| `models/Logement.js` | logements | campagne_id, numero, etage, position (bas/intermediaire/haut), surface, loyer_estime, typologie, plancher_bas, plancher_haut, statut, selectionne_visite, deletedAt |
| `models/Locataire.js` | locataires | campagne_id, logement_id, nom, prenom, email, telephone, date_entree, token (pour lien RDV) |
| `models/Creneau.js` | creneaux | locataire_id, campagne_id, date_visite, heure_debut, heure_fin, statut (reserve/confirme/annule) |

**Virtuals :** Campagne a des virtuals `logements` et `locataires` qui peuplent les données liées.

**Index clés (Creneau) :**
- `{ campagne_id, date_visite, heure_debut }` — unicité d'un créneau
- `{ locataire_id, campagne_id }` — un seul créneau par locataire par campagne

---

### 3.8 Validations (schémas Joi)

| Fichier | Schéma | Valide |
|---|---|---|
| `validations/campagne.js` | `creerCampagne` | immeuble_id, nom, dates, statut |
| `validations/campagneJours.js` | `mettreAJoursDisponibles` | tableau de dates ISO (min 1) |
| `validations/immeuble.js` | `creerImmeuble` | nom, adresse, typologie (T1-T6), annee, planchers, surface, étages |
| `validations/logement.js` | `creerLogements` | tableau de logements (numero, etage, position, surface, typologie, planchers) |
| `validations/lien.js` | `creneauSchema` | date_visite (ISO), heure_debut (HH:MM), heure_fin (HH:MM) |

---

### 3.9 Services métier

#### `services/setCoverService.js` — Algorithme de sélection (cœur métier)

**Rôle :** Implémente l'algorithme **set cover** (couverture par ensembles) pour sélectionner automatiquement les logements à visiter selon la réglementation DPE collectif.

**Règles appliquées :**
| Règle | Description | Implémentation |
|---|---|---|
| **RG11** | 1 logement par typologie (T1-T6) | `construireCriteres()` ajoute `typo:T1`, `typo:T2`, ... |
| **RG12** | 1 logement par type de plancher bas | `construireCriteres()` ajoute `pb:terre-plein`, etc. |
| **RG13** | 1 logement par type de plancher haut | `construireCriteres()` ajoute `ph:combles`, etc. |
| **RG14** | 1 logement étage intermédiaire | `construireCriteres()` ajoute `position:intermediaire` si nbEtages > 2 |
| **RG15** | Seuil minimal de visites | `calculerSeuilMinimal()` : <31 = 0, 31-100 = 10%, >100 = 5% (min 10) |

**Fonctions clés :**
| Fonction | Rôle |
|---|---|
| `construireCriteres(logements, nbEtages)` | Construit l'ensemble des critères obligatoires |
| `criteresCouvertPar(logement, nbEtages)` | Détermine quels critères un logement couvre (utilise `position` au lieu de `etage`) |
| `selectionSetCover(logements, nbEtages)` | Algorithme glouton : choisit à chaque étape le logement qui couvre le plus de critères |
| `calculerSeuilMinimal(nbLogements)` | Calcule le nombre minimum de visites requis |
| `completerJusquaSeuil(selection, logements, seuil)` | Complète la sélection si le seuil n'est pas atteint |
| `lancerSelection(logements, nbEtages)` | Fonction principale : set cover + seuil → résultat structuré |

**Principe de l'algorithme glouton :**
1. On liste tous les critères obligatoires (typologies, planchers, position intermédiaire)
2. Tant qu'il reste des critères à couvrir, on sélectionne le logement qui en couvre le maximum
3. On vérifie le seuil minimal et on complète si nécessaire

---

## 4. FICHIERS D'EXEMPLE ET TESTS

### 4.1 `exemple-set-cover.js`

**Rôle :** Script pédagogique autonome qui démontre l'algorithme set cover avec 10 logements de démonstration.

Peut s'exécuter avec : `node exemple-set-cover.js`

Affiche étape par étape : les critères, ce que chaque logement couvre, la sélection gloutonne, le seuil.

---

### 4.2 `exemple-set-cover.test.js`

**Rôle :** Tests unitaires de l'algorithme set cover (utilise le module `node:test`).

**Tests :** 6 suites, 18 tests (construireCriteres, criteresCouvertPar, selectionSetCover, calculerSeuilMinimal, completerJusquaSeuil, cas extrêmes).

**Exécution :** `node --test exemple-set-cover.test.js`

---

### 4.3 `backend/tests/lien.test.js` — **NOUVEAU**

**Rôle :** Tests unitaires et d'intégration pour la fonctionnalité de réservation de créneaux (liens publics RDV).

**Infrastructure :** Utilise `mongodb-memory-server` pour une base MongoDB temporaire isolée + `supertest` pour tester l'API HTTP.

**Tests (3 suites, 22 tests) :**

| Suite | Tests |
|---|---|
| `timeToMinutes` (5 tests) | Conversion "00:00"→0, "01:00"→60, "23:59"→1439, "12:30"→750, "09:15"→555 |
| `chevauche` (6 tests) | Identique, contenu, adjacents (non), disjoints (non), partiel croisé |
| `API /api/liens` (11 tests) | GET 404 token inconnu, GET 200 token valide, POST 400 date manquante, POST 400 format heure, POST 400 heure_fin <= heure_debut, POST 404 token inconnu, POST 400 date hors dispo, POST 201 succès, POST 400 doublon locataire, POST 409 chevauchement, POST 201 autre date |

**Exécution :** `npm test` (lance les 22 tests)

---

## 5. SPÉCIFICATIONS (CAHIER DES CHARGES)

| Fichier | Contenu |
|---|---|
| `specifications/brief-projet.md` | Contexte, problème, objectifs, acteurs, contraintes réglementaires DPE collectif |
| `specifications/user-stories.md` | 22 user stories (14 entrepreneur + 6 locataire + 2 occupant) |
| `specifications/personas.md` | 5 personas (Antoine, Mme Dubois, M. Lefèvre, Sarah, M. Camara) |
| `specifications/wireframes.md` | 8 écrans ASCII (dashboard, création, détail, planning, etc.) |
| `specifications/regles-gestion.md` | 17 règles métier (RG1 à RG17) |
| `specifications/cas-utilisation.md` | 13 cas d'utilisation (UC1 à UC13) |
| `specifications/glossaire.md` | 35 termes définis |

---

## 6. DOCUMENTATION PROJET

| Fichier | Contenu |
|---|---|
| `docs/01_Plan_Organisation_Projet.md` | Plan complet (phases A-F, calendrier, livrables, risques) |
| `docs/02_Specifications.md` | Dossier de conception complet |
| `docs/03_Journal_de_Bord.md` | Journal de toutes les séances de travail |
| `docs/04_Suivi_Modifications.md` | Historique des versions (v1.0 → v3.0) |
| `docs/05_Documentation_Technique.md` | Documentation technique (architecture, endpoints, modèles) |
| `docs/db_documentation.md` | Documentation complète de la BDD MariaDB (10 tables + schéma Mermaid) |
| `docs/TODO_LIST.md` | Liste des tâches à réaliser (phases 1-7 avec statuts) |

---

## 7. BASE DE DONNÉES (SQL)

### `testdb.sql` — Script SQL complet (570 lignes)

**Rôle :** Script de migration et de test pour MariaDB (cible future).

**Contenu :** Création base `audit_energetique`, 10 tables, données de test, contraintes, requêtes de vérification.

**Attention :** Le projet utilise actuellement **MongoDB** (via Mongoose). MariaDB est la cible de migration future.

---

## 8. SÉCURITÉ — **NOUVEAU**

### Rate limiting
- **Global** : 100 requêtes / 15 minutes sur toutes les routes `/api/` (configurable via `.env` : `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`)
- **Liens publics** : 10 requêtes / minute sur les routes `/api/liens` (configurable via `.env` : `RATE_LIMIT_PUBLIC_WINDOW_MS`, `RATE_LIMIT_PUBLIC_MAX`)
- Désactivé en mode test (`NODE_ENV=testing` → limite à 1000 req)

### Gestion d'erreurs
- Middleware global `errorHandler` qui capture toutes les erreurs
- Classe `AppError` pour les erreurs métier avec code HTTP
- Gestion des erreurs Mongoose (validation, doublons)
- Pas de fuite d'information dans les réponses d'erreur

### Authentification
- Mots de passe hashés avec **bcrypt**
- Tokens JWT pour les sessions
- Routes protégées par le middleware `auth.js`

---

## 9. CONFIGURATION AGENT IA

### `Agent.ia/` — Dossier de configuration OpenCode

| Fichier | Rôle |
|---|---|
| `config.json` | Configuration de l'agent IA spécialisé Planif'Audit |
| `regle-acces-fichiers.md` | Restreint les accès en écriture de l'IA |
| `regle-analyse-pre-tache.md` | Oblige l'IA à produire une analyse avant toute modification |
| `regle-journal-de-bord.md` | Automatise la mise à jour du journal de bord |

---

## 10. DÉPENDANCES (package.json)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",                 // Hash des mots de passe
    "cors": "^2.8.5",                   // Cross-Origin Resource Sharing
    "dotenv": "^16.3.1",                // Variables d'environnement
    "express": "^4.18.2",               // Framework web
    "express-rate-limit": "^8.5.2",     // Rate limiting (sécurité)
    "joi": "^17.11.0",                  // Validation des entrées
    "jsonwebtoken": "^9.0.2",           // Tokens JWT (authentification)
    "mongoose": "^9.6.2",               // ODM MongoDB
    "mysql2": "^3.6.5",                 // Client MySQL/MariaDB (migration future)
    "nodemailer": "^6.9.7"              // Envoi d'emails (simulé pour l'instant)
  },
  "devDependencies": {
    "mongodb-memory-server": "^11.2.0", // Base MongoDB temporaire pour les tests
    "nodemon": "^3.0.2",                // Rechargement automatique du serveur
    "supertest": "^7.2.2"               // Tests HTTP
  }
}
```

**Scripts disponibles :**
| Commande | Description |
|---|---|
| `npm start` | Démarre le serveur (`node backend/server.js`) |
| `npm run dev` | Démarre avec rechargement automatique (`nodemon`) |
| `npm test` | Lance les 22 tests (unitaires + intégration) |
| `npm run test:unit` | Lance uniquement les tests unitaires (timeToMinutes + chevauche) |
| `npm run test:int` | Lance uniquement les tests d'intégration (API /api/liens) |

---

## 11. DIAGRAMME DE LIENS ENTRE FICHIERS

```
[Client Navigateur]
    │
    ├── index.html ──→ styles.css
    │                ──→ script.js (API réelle + fallback mock)
    │
[backend/server.js] ──→ .env (PORT, MONGODB_URI, JWT_SECRET, RATE_LIMIT_*, SMTP_*)
    │                ──→ sert les fichiers statiques (frontend)
    │
    └── app.js
        │  (CORS, JSON, rate limiting global)
        │
        ├── middlewares/errorHandler.js ← middleware global
        │
        ├── routes/authRoutes.js
        │   └── controllers/authController.js
        │       └── models/Entrepreneur.js
        │
        ├── routes/immeubleRoutes.js
        │   └── controllers/immeubleController.js
        │       ├── models/Immeuble.js
        │       └── validations/immeuble.js (Joi)
        │
        ├── routes/campagneRoutes.js
        │   └── controllers/campagneController.js
        │   │   ├── models/Campagne.js
        │   │   ├── models/Immeuble.js
        │   │   ├── models/Logement.js
        │   │   ├── models/Locataire.js
        │   │   ├── validations/campagne.js (Joi)
        │   │   └── services/setCoverService.js ← CŒUR MÉTIER
        │   │
        │   └── controllers/logementController.js
        │       ├── models/Logement.js
        │       └── validations/logement.js (Joi)
        │
        ├── routes/campagneJoursRoutes.js
        │   └── controllers/campagneJoursController.js
        │       ├── models/Campagne.js
        │       └── validations/campagneJours.js (Joi)
        │
        ├── routes/lienRoutes.js ← PUBLIC (rate limiting dédié)
        │   └── controllers/lienController.js
        │       ├── models/Locataire.js
        │       ├── models/Campagne.js
        │       ├── models/Creneau.js       ← NOUVEAU
        │       └── validations/lien.js (Joi) ← NOUVEAU
        │
        ├── routes/referentielRoutes.js
        │   └── controllers/referentielController.js
        │
        └── middlewares/auth.js (JWT)
            ├── jsonwebtoken
            └── models/Entrepreneur.js
```

---

## 12. TESTS AUTOMATISÉS

L'application dispose de **40 tests** automatisés :

| Suite de tests | Fichier | Nombre de tests | Type |
|---|---|---|---|
| Set cover (unitaire) | `exemple-set-cover.test.js` | 18 | `node:test` |
| Liens RDV (unitaire) | `backend/tests/lien.test.js` | 11 (timeToMinutes + chevauche) | `node:test` |
| Liens RDV (intégration API) | `backend/tests/lien.test.js` | 11 | `supertest` + `mongodb-memory-server` |

**Exécution :** `npm test` (configure `NODE_ENV=testing` et lance les 22 tests du fichier lien.test.js)

---

## 13. RÉSUMÉ DU FLUX MÉTIER COMPLET

```
 1. ENTREPRENEUR S'INSCRIT / SE CONNECTE          ✅ IMPLÉMENTÉ
    └── POST /api/auth/register ou /login → token JWT

 2. CRÉE UN IMMEUBLE                               ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/immeubles

 3. CRÉE UNE CAMPAGNE                              ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes

 4. AJOUTE LES LOGEMENTS À LA CAMPAGNE             ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/logements

 5. LANCE L'ALGORITHME DE SÉLECTION (set cover)    ✅ IMPLÉMENTÉ
    └── POST /api/entrepreneur/campagnes/:id/lancer-selection
    └── Algorithme : couvre RG11-RG15 → marque les logements sélectionnés

 6. CHOISIT SES JOURS DISPONIBLES                  ✅ IMPLÉMENTÉ
    └── PUT /api/entrepreneur/campagnes/:id/jours-disponibles

 7. GÉNÈRE LES LIENS POUR LES LOCATAIRES           ✅ IMPLÉMENTÉ
    └── (généré côté frontend via token présent dans Locataire)

 8. LES LOCATAIRES SAISISSENT LEURS CRÉNEAUX       ✅ IMPLÉMENTÉ
    └── GET /api/liens/:token → infos + jours dispo
    └── POST /api/liens/:token/creneaux → réservation

 9. GÉNÈRE LE PLANNING OPTIMISÉ                     🔜 À VENIR
    └── Algorithme de planification (tri étage, pause 15 min, pas chevauchement)

10. ENVOIE LES EMAILS DIFFÉRENCIÉS                  🔜 À VENIR
    └── nodemailer installé → email simulé (console.log)
```

---

## 14. NOTES IMPORTANTES

- **Frontend connecté aux API réelles** : `script.js` utilise désormais `apiFetch()` qui appelle les vraies routes backend avec le token JWT. Un **fallback mock** est conservé en cas d'absence du serveur.
- **Authentification complète** : inscription + connexion + JWT côté backend, UI login/register côté frontend, stockage du token dans localStorage, protection des routes.
- **Page publique RDV** : les locataires peuvent réserver un créneau via un lien sécurisé par token. Validation complète (disponibilité, chevauchement, doublon).
- **Sécurité renforcée** : rate limiting global (100 req/15 min) et dédié (10 req/min sur les routes publiques), gestion d'erreurs centralisée, mots de passe hashés.
- **Tests d'intégration** : 22 tests avec `mongodb-memory-server` + `supertest` couvrant les créneaux de réservation.
- **Base de données en transition** : le backend utilise MongoDB (Mongoose), mais la cible est MariaDB (SQL). `testdb.sql` contient le schéma final cible.
- **Algorithme set cover** : utilise le champ `position` (bas/intermediaire/haut) plutôt que `etage` pour la règle RG14. Le code existe en version standalone (`exemple-set-cover.js`) et intégrée (`services/setCoverService.js`).
- **nodemailer** est installé mais l'envoi réel d'emails n'est pas encore branché (simulation via `console.log`).
