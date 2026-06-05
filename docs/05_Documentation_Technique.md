# 5. Documentation Technique

**Version :** 3.0 — Juin 2026  
**Projet :** Planif'Audit — Application de planification d'audits énergétiques (DPE collectifs)

---

## 5.1 Architecture générale

### Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | HTML5 + CSS3 + JavaScript vanilla | Léger, pas de dépendances lourdes, SPA par hash routing |
| Backend | Node.js + Express | Rapide, grande communauté, même langage que le frontend |
| Base de données | MongoDB (via Mongoose) | Flexibilité du schéma pour les données hétérogènes des immeubles |
| Cible future | MariaDB (via mysql2) | Migration prévue pour environnement de production |
| Authentification | JWT (jsonwebtoken + bcrypt) | Sans état, facile à intégrer |
| Validation | Joi | Cohérence des données API |
| Tests | `node:test` + `supertest` + `mongodb-memory-server` | Tests unitaires et d'intégration isolés |

### Structure du projet

```
projet-audit-energetique/
├── frontend/                       # Application cliente (SPA)
│   ├── index.html                  # Point d'entrée (redirige vers auth.html)
│   ├── auth.html                   # Connexion / inscription
│   ├── dashboard.html              # Tableau de bord + liste campagnes
│   ├── detail.html                 # Détail d'une campagne (logements, locataires)
│   ├── planning.html               # Planning optimisé (timeline + tableau)
│   ├── jours.html                  # Sélection des jours disponibles
│   ├── rdv.html                    # Page publique RDV (réservation créneau)
│   ├── css/
│   │   └── style.css               # Styles responsive (mobile-first)
│   └── js/
│       ├── api.js                  # Wrapper fetch avec token JWT + fallback mock
│       ├── utils.js                # Fonctions utilitaires (formatage, dates, toasts)
│       ├── auth.js                 # Authentification (login, register, logout)
│       ├── dashboard.js            # Tableau de bord (stats, création campagne)
│       ├── detail.js               # Détail campagne (logements, locataires, sélection)
│       ├── planning.js             # Planning optimisé (timeline, tableau)
│       ├── jours.js                # Jours disponibles du diagnostiqueur
│       └── rdv.js                  # Réservation publique de créneau
│
├── backend/                        # Serveur API REST
│   ├── server.js                   # Point d'entrée : connexion MongoDB + fichiers statiques
│   ├── app.js                      # Middleware Express (CORS, JSON, rate-limit, routes)
│   ├── config/                     # (réservé connexion DB cible MariaDB)
│   ├── middlewares/
│   │   ├── auth.js                 # Vérification JWT
│   │   └── errorHandler.js         # Gestion globale des erreurs (AppError)
│   ├── models/                     # Schémas Mongoose
│   │   ├── Entrepreneur.js         # Compte entrepreneur (nom, email, bcrypt)
│   │   ├── Immeuble.js             # Immeuble (adresse, typologie, planchers)
│   │   ├── Campagne.js             # Campagne de visites (dates, statut, virtuals)
│   │   ├── Logement.js             # Logement (étage, position, typologie, plancher)
│   │   ├── Locataire.js            # Locataire (email, token, campagne_id)
│   │   └── Creneau.js              # Créneau réservé (date, heure, statut)
│   ├── controllers/
│   │   ├── authController.js       # Inscription, connexion, profil
│   │   ├── immeubleController.js   # CRUD immeubles
│   │   ├── campagneController.js   # CRUD campagnes + lancer sélection set cover
│   │   ├── logementController.js   # CRUD logements (batch store, update, delete)
│   │   ├── locataireController.js  # CRUD locataires
│   │   ├── campagneJoursController.js  # Jours disponibles du diagnostiqueur
│   │   ├── referentielController.js    # Listes statiques (typologies, planchers)
│   │   └── lienController.js       # Lien public RDV (infos + réservation créneau)
│   ├── routes/
│   │   ├── authRoutes.js           # POST /register, /login, GET /me
│   │   ├── immeubleRoutes.js       # GET /, POST /
│   │   ├── campagneRoutes.js       # CRUD campagnes + logements + sélection + emails
│   │   ├── campagneJoursRoutes.js  # GET/PUT jours-disponibles
│   │   ├── referentielRoutes.js    # GET /typologies, /plancher-bas, /plancher-haut
│   │   └── lienRoutes.js           # GET /:token, POST /:token/creneaux (public)
│   ├── services/
│   │   └── setCoverService.js      # Algorithme de sélection set cover (RG11-RG15)
│   ├── validations/                # Schémas Joi
│   │   ├── campagne.js
│   │   ├── campagneJours.js
│   │   ├── immeuble.js
│   │   ├── logement.js
│   │   └── lien.js
│   ├── tests/
│   │   └── lien.test.js            # 22 tests (unitaires + intégration API)
│   ├── seed.js                     # Script d'initialisation des données
│   ├── check_all.js                # Script de vérification
│   └── check_campaign.js           # Script de vérification campagne
│
├── specifications/                 # Cahier des charges
│   ├── brief-projet.md
│   ├── user-stories.md
│   ├── personas.md
│   ├── wireframes.md
│   ├── regles-gestion.md
│   ├── cas-utilisation.md
│   └── glossaire.md
│
├── docs/                           # Documentation projet
│   ├── 01_Plan_Organisation_Projet.md
│   ├── 02_Specifications.md
│   ├── 03_Journal_de_Bord.md
│   ├── 04_Suivi_Modifications.md
│   ├── 05_Documentation_Technique.md
│   ├── db_documentation.md
│   └── TODO_LIST.md
│
├── Agent.ia/                       # Configuration agent IA (OpenCode)
├── exemple-set-cover.js            # Démo pédagogique de l'algorithme
├── exemple-set-cover.test.js       # Tests unitaires (18 tests)
├── testdb.sql                      # Script SQL MariaDB (cible future)
├── ANALYSE_PROJET.md               # Analyse complète du projet
├── package.json                    # Dépendances Node.js
├── .env                            # Variables d'environnement
└── .gitignore
```

---

## 5.2 Base de données

### Actuellement — MongoDB (Mongoose)

6 collections :

| Collection | Champs principaux |
|---|---|
| `entrepreneurs` | nom, email, motDePasse (hashé bcrypt), telephone, entreprise, role |
| `immeubles` | nom, adresse, typologie, annee_construction, plancher_bas, plancher_haut, surface_totale, nombre_etages, id_entrepreneur |
| `campagnes` | immeuble_id, nom, date_debut, date_fin, statut, jours_disponibles |
| `logements` | campagne_id, numero, etage, position, surface, typologie, plancher_bas, plancher_haut, statut, selectionne_visite |
| `locataires` | campagne_id, logement_id, nom, prenom, email, telephone, token |
| `creneaux` | locataire_id, campagne_id, date_visite, heure_debut, heure_fin, statut |

### Cible future — MariaDB (10 tables)

Voir `docs/db_documentation.md` pour le schéma complet (10 tables, 287 lignes de documentation).

---

## 5.3 API REST — Endpoints

### Authentification

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| POST | `/api/auth/register` | Non | Créer un compte entrepreneur |
| POST | `/api/auth/login` | Non | Connecter un entrepreneur → token JWT |
| GET | `/api/auth/me` | Oui | Profil de l'utilisateur connecté |

### Immeubles

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/entrepreneur/immeubles` | Oui | Lister les immeubles |
| POST | `/api/entrepreneur/immeubles` | Oui | Créer un immeuble |

### Campagnes

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| POST | `/api/entrepreneur/campagnes` | Oui | Créer une campagne |
| GET | `/api/entrepreneur/campagnes` | Oui | Lister les campagnes |
| GET | `/api/entrepreneur/campagnes/:id` | Oui | Détail d'une campagne (logements + locataires) |
| POST | `/api/entrepreneur/campagnes/:id/lancer-selection` | Oui | Lancer l'algorithme set cover |
| GET | `/api/entrepreneur/campagnes/:id/emails` | Oui | Lister les emails envoyés |
| POST | `/api/entrepreneur/campagnes/:id/envoyer-emails` | Oui | Envoyer les emails différenciés |
| POST | `/api/entrepreneur/campagnes/:id/locataires` | Oui | Ajouter des locataires en batch |

### Logements

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| POST | `/api/entrepreneur/campagnes/:id/logements` | Oui | Créer plusieurs logements |
| PUT | `/api/entrepreneur/campagnes/:campagne_id/logements/:logement_id` | Oui | Modifier un logement |
| DELETE | `/api/entrepreneur/campagnes/:campagne_id/logements/:logement_id` | Oui | Supprimer un logement |

### Jours disponibles (diagnostiqueur)

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/entrepreneur/campagnes/:id/jours-disponibles` | Oui | Récupérer les jours disponibles |
| PUT | `/api/entrepreneur/campagnes/:id/jours-disponibles` | Oui | Définir les jours disponibles |

### Référentiels (public)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/referentiel/typologies` | Liste des typologies (T1–T6) |
| GET | `/api/referentiel/plancher-bas` | Types de plancher bas |
| GET | `/api/referentiel/plancher-haut` | Types de plancher haut |

### Liens publics RDV (rate limiting dédié : 10 req/min)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/liens/:token` | Infos locataire + jours disponibles |
| POST | `/api/liens/:token/creneaux` | Réserver un créneau (date, heure_debut, heure_fin) |

### Health

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health` | Statut du serveur |

---

## 5.4 Flux métier complet

```
 1. ENTREPRENEUR S'INSCRIT / SE CONNECTE           ✅ IMPLÉMENTÉ
    POST /api/auth/register ou /login → token JWT

 2. CRÉE UN IMMEUBLE                                ✅ IMPLÉMENTÉ
    POST /api/entrepreneur/immeubles

 3. CRÉE UNE CAMPAGNE                               ✅ IMPLÉMENTÉ
    POST /api/entrepreneur/campagnes

 4. AJOUTE LES LOGEMENTS + LOCATAIRES               ✅ IMPLÉMENTÉ
    POST /api/entrepreneur/campagnes/:id/logements
    POST /api/entrepreneur/campagnes/:id/locataires

 5. LANCE L'ALGORITHME DE SÉLECTION (set cover)     ✅ IMPLÉMENTÉ
    POST /api/entrepreneur/campagnes/:id/lancer-selection
    Règles : RG11 (typologies), RG12 (plancher bas), RG13 (plancher haut),
             RG14 (étage intermédiaire), RG15 (seuil minimal)

 6. CHOISIT SES JOURS DISPONIBLES                   ✅ IMPLÉMENTÉ
    PUT /api/entrepreneur/campagnes/:id/jours-disponibles

 7. GÉNÈRE LES LIENS POUR LES LOCATAIRES            ✅ IMPLÉMENTÉ
    (token généré côté frontend, présent dans Locataire)

 8. LES LOCATAIRES RÉSERVENT LEUR CRÉNEAU           ✅ IMPLÉMENTÉ
    GET /api/liens/:token → infos + jours dispo
    POST /api/liens/:token/creneaux → réservation

 9. GÉNÈRE LE PLANNING OPTIMISÉ                     🔜 À VENIR
    (tri étage, pause 15 min, pas chevauchement)

10. ENVOIE LES EMAILS DIFFÉRENCIÉS                  ✅ PARTIEL
    nodemailer installé, email simulé (console.log)
```

---

## 5.5 Algorithme de sélection — Set Cover

### Principe
Algorithme glouton qui sélectionne le **minimum de logements** couvrant tous les critères réglementaires d'échantillonnage DPE collectif.

### Règles appliquées

| Règle | Description |
|-------|-------------|
| **RG11** | Au moins 1 logement par typologie présente (T1–T6) |
| **RG12** | Au moins 1 logement par type de plancher bas présent |
| **RG13** | Au moins 1 logement par type de plancher haut présent |
| **RG14** | Au moins 1 logement en étage intermédiaire |
| **RG15** | Seuil minimal : <31 → 0, 31–100 → 10 %, >100 → 5 % (min 10) |

### Fonctions clés (`services/setCoverService.js`)

| Fonction | Rôle |
|---|---|
| `construireCriteres(logements, nbEtages)` | Construit l'ensemble des critères obligatoires |
| `criteresCouvertPar(logement, nbEtages)` | Détermine quels critères un logement couvre |
| `selectionSetCover(logements, nbEtages)` | Algorithme glouton : choisit le logement qui couvre le plus de critères |
| `calculerSeuilMinimal(nbLogements)` | Calcule le nombre minimum de visites requis |
| `completerJusquaSeuil(selection, logements, seuil)` | Complète la sélection si le seuil n'est pas atteint |
| `lancerSelection(logements, nbEtages)` | Fonction principale : set cover + seuil → résultat structuré |

---

## 5.6 Tests automatisés

**40 tests** au total :

| Suite | Fichier | Tests | Type |
|---|---|---|---|
| Set cover unitaire | `exemple-set-cover.test.js` | 18 | `node:test` |
| timeToMinutes | `backend/tests/lien.test.js` | 5 | Unitaire |
| chevauche | `backend/tests/lien.test.js` | 6 | Unitaire |
| API /api/liens | `backend/tests/lien.test.js` | 11 | Intégration (supertest + mongodb-memory-server) |

Exécution : `npm test`

---

## 5.7 Sécurité

- **Rate limiting** : 100 req/15 min sur `/api/`, 10 req/min sur `/api/liens` (configurable via `.env`)
- **Authentification JWT** : tokens avec secret configurable, middleware de protection
- **Mots de passe** : hashés avec bcrypt
- **Gestion d'erreurs** : middleware global `errorHandler`, classe `AppError`
- **Validation** : tous les endpoints valident les entrées avec Joi

---

## 5.8 Déploiement

### Prérequis
- Node.js 18+
- MongoDB (local ou distant via `MONGODB_URI`)
- Fichier `.env` à configurer (voir `.env.example`)

### Commandes

| Commande | Description |
|---|---|
| `npm install` | Installer les dépendances |
| `npm run dev` | Lancer en développement (nodemon) |
| `npm start` | Lancer en production |
| `npm test` | Exécuter les tests |
| `npm run seed` | Initialiser les données de test |
