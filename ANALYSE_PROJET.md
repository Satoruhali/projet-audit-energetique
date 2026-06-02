# Analyse complète du projet — Planif'Audit

**Application de planification d'audits énergétiques (DPE collectifs)**
**Version : 2.0 — Juin 2026**

---

## Vue d'ensemble

Planif'Audit est une application web qui aide un diagnostiqueur (entrepreneur en audits énergétiques) à organiser des campagnes de visites dans des immeubles collectifs. L'application permet de :

1. Créer des campagnes de visites (immeuble + logements + locataires)
2. Sélectionner automatiquement les logements à visiter (algorithme set cover)
3. Gérer les disponibilités du diagnostiqueur et des locataires
4. Générer un planning optimisé (tri par étage, pause 15 min, pas de chevauchement)
5. Envoyer des emails différenciés (visité / non visité)

**Stack technique :** Node.js / Express (backend) + HTML/CSS/JS vanilla (frontend) + MongoDB (base de données actuelle) / MariaDB (version prévue)

---

## 1. ARCHITECTURE GÉNÉRALE

```
projet-audit-energetique/
├── index.html                     # Frontend (interface utilisateur)
├── styles.css                     # Styles CSS
├── script.js                      # Logique frontend (mock data)
├── backend/                       # Serveur Node.js (API REST)
│   ├── server.js                  # Point d'entrée : démarre le serveur Express
│   ├── app.js                     # Middleware + montage des routes
│   ├── config/                    # (dossier vide — connexion DB à configurer)
│   ├── models/                    # Schémas Mongoose (MongoDB)
│   ├── controllers/               # Logique des endpoints
│   ├── routes/                    # Définition des routes API
│   ├── middlewares/               # Authentification JWT
│   ├── services/                  # Algorithmes métier (set cover)
│   └── validations/               # Schémas de validation Joi
├── specifications/                # Cahier des charges complet
├── docs/                          # Documentation projet
├── Agent.ia/                      # Configuration agent IA (OpenCode)
├── exemple-set-cover.js           # Démo pédagogique de l'algorithme
├── exemple-set-cover.test.js      # Tests unitaires de l'algorithme
├── testdb.sql                     # Script SQL (migration MariaDB)
└── package.json                   # Dépendances Node.js
```

---

## 2. FRONTEND (interface utilisateur)

### 2.1 `index.html` — Page principale

**Rôle :** Structure de l'interface utilisateur (SPA — Single Page Application).

**Responsabilités :**
- Contient 3 vues affichées/masquées avec la classe CSS `.active` :
  - **Tableau de bord** (`#view-dashboard`) : stats (actives/en attente/terminées) + liste des campagnes + formulaire de création (2 étapes)
  - **Détail campagne** (`#view-detail`) : réponses des locataires + planning + onglets
  - **Planning optimisé** (`#view-planning`) : timeline visuelle + tableau détaillé + formulaire de modification

**Navigation :** Utilise le hash routing (`#dashboard`, `#campaign/{id}`, `#planning/{id}`).

**Dépendances :** `styles.css` (design) + `script.js` (logique).

---

### 2.2 `styles.css` — Feuille de styles

**Rôle :** Design responsive de l'application.

**Responsabilités :**
- Palette de couleurs : vert (#2ecc71) / orange (#e67e22) / bleu (#3498db)
- Composants : topbar, stats, cards, tables, tabs, timeline, badges, form, toasts
- Responsive mobile-first (breakpoints : 480px, 768px, 1024px)
- Animations (toasts slideIn)

---

### 2.3 `script.js` — Logique frontend

**Rôle :** Contrôleur principal de l'interface (700 lignes). Pour l'instant, utilisée avec des **données mockées** (pas encore reliée au backend).

**Responsabilités :**
- **Routing SPA :** `navigate()` écoute les changements de hash
- **Tableau de bord :** affichage des stats, liste des campagnes, création (2 étapes : infos immeuble → saisie locataires)
- **Détail campagne :** tableau des réponses, onglets (Réponses / Planning), relance individuelle/masse, génération de liens
- **Planning optimisé :** timeline visuelle, tableau détaillé, modification de créneaux
- **Règles métier intégrées :**
  - **RG3** — Tri par étage croissant (`sortByFloor()`)
  - **RG4** — Pas de chevauchement (vérification dans `generatePlanning()`)
  - **RG9** — Pause 15 min entre visites (`addMinutes(lastEnd.fin, 15)`)

**Fonctions clés :**
| Fonction | Rôle |
|---|---|
| `navigate(hash)` | Routage SPA |
| `generatePlanning(locataires)` | Applique RG3 + RG4 + RG9 |
| `showDashboard()` | Affiche le tableau de bord |
| `showDetail(id)` | Affiche le détail d'une campagne |
| `showPlanning(id)` | Affiche le planning optimisé |
| `toast(message, type)` | Affiche une notification |

**Données mockées :** 3 campagnes prédéfinies (Paris, Lyon, Marseille) avec 15 locataires.

---

## 3. BACKEND (API REST)

### 3.1 `server.js` — Point d'entrée

**Rôle :** Démarre le serveur Express + connexion MongoDB.

**Responsabilités :**
- Charge le fichier `.env` (variables d'environnement)
- Se connecte à MongoDB via Mongoose
- Lance le serveur sur le port configuré (3001)

**Dépendances :** `mongoose`, `dotenv`, `app.js`

---

### 3.2 `app.js` — Application Express

**Rôle :** Configure les middlewares et monte les routes.

**Responsabilités :**
- Middleware CORS (autorise les requêtes cross-origin)
- Middleware `express.json()` (parse le JSON des requêtes)
- Route de santé : `GET /api/health`
- Montage des routes :
  - `/api/auth` → routes d'authentification
  - `/api/entrepreneur/immeubles` → routes des immeubles
  - `/api/entrepreneur/campagnes` → routes des campagnes
  - `/api/entrepreneur/campagnes/:id` → routes des jours disponibles
  - `/api/referentiel` → routes des référentiels

**Dépendances :** `cors`, `express`, `routes/*`

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

### 3.4 Contrôleurs (la logique métier)

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
| `lancerSelection` | POST | /api/entrepreneur/campagnes/:id/lancer-selection | Lance l'algorithme set cover pour sélectionner les logements à visiter |

**Algorithme de sélection :** Le cœur du métier. Utilise `setCoverService.js` pour :
1. Déterminer les critères obligatoires (typologies, planchers, étage intermédiaire)
2. Choisir le **minimum de logements** qui couvre tous les critères (algorithme glouton)
3. Compléter jusqu'au seuil minimal réglementaire (RG15)
4. Marquer les logements sélectionnés

**Dépendances :** `models/Campagne`, `models/Immeuble`, `models/Logement`, `services/setCoverService`

---

#### `controllers/campagneJoursController.js`
**Rôle :** Gère les jours de disponibilité du diagnostiqueur pour une campagne.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `remplacerJours` | PUT | /api/entrepreneur/campagnes/:id/jours-disponibles | Remplace les jours disponibles (validation intervalle + doublons) |
| `recupererJours` | GET | /api/entrepreneur/campagnes/:id/jours-disponibles | Récupère les jours disponibles |

**Dépendances :** `models/Campagne`, `validations/campagneJours`

---

#### `controllers/logementController.js`
**Rôle :** CRUD des logements (appartements) dans une campagne.

| Fonction | Méthode | URL | Description |
|---|---|---|---|
| `storeBatch` | POST | /api/entrepreneur/campagnes/:id/logements | Crée plusieurs logements en une requête |
| `update` | PUT | /api/entrepreneur/campagnes/:campagne_id/logements/:logement_id | Modifie un logement |
| `delete` | DELETE | /api/entrepreneur/campagnes/:campagne_id/logements/:logement_id | Suppression logique (soft delete) |

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

### 3.5 Routes (définition des URL)

Chaque fichier de routes monte les chemins et associe les contrôleurs :

| Fichier | Routes | Middleware |
|---|---|---|
| `routes/authRoutes.js` | POST /register, POST /login, GET /me | `auth` sur GET /me |
| `routes/immeubleRoutes.js` | GET /, POST / | `auth` |
| `routes/campagneRoutes.js` | POST /, GET /, GET /:id, POST /:id/logements, PUT /:campagne_id/logements/:logement_id, DELETE /:campagne_id/logements/:logement_id, POST /:id/lancer-selection | `auth` |
| `routes/campagneJoursRoutes.js` | PUT /jours-disponibles, GET /jours-disponibles | `auth` (avec `mergeParams: true`) |
| `routes/referentielRoutes.js` | GET /typologies, GET /plancher-bas, GET /plancher-haut | Aucun (public) |

---

### 3.6 Modèles Mongoose (schémas MongoDB)

| Fichier | Collection | Champs principaux |
|---|---|---|
| `models/Entrepreneur.js` | entrepreneurs | nom, email, motDePasse (hashé), telephone, entreprise, role |
| `models/Immeuble.js` | immeubles | nom, adresse, typologie, annee_construction, plancher_bas, plancher_haut, surface_totale, nombre_etages, id_entrepreneur |
| `models/Campagne.js` | campagnes | immeuble_id, nom, date_debut, date_fin, statut (brouillon/en_cours/termine), jours_disponibles, deletedAt |
| `models/Logement.js` | logements | campagne_id, numero, etage, surface, loyer_estime, typologie, plancher_bas, plancher_haut, statut (libre/occupe/reserve), selectionne_visite, deletedAt |
| `models/Locataire.js` | locataires | campagne_id, logement_id, nom, prenom, email, telephone, date_entree |

**Virtuals (relations virtuelles) :** Campagne a des virtuals `logements` et `locataires` qui peuplent les données liées.

---

### 3.7 Validations (schémas Joi)

| Fichier | Schéma | Valide |
|---|---|---|
| `validations/campagne.js` | `creerCampagne` | immeuble_id, nom, dates, statut |
| `validations/campagneJours.js` | `mettreAJoursDisponibles` | tableau de dates ISO (min 1) |
| `validations/immeuble.js` | `creerImmeuble` | nom, adresse, typologie (T1-T6), annee, planchers, surface, étages |
| `validations/logement.js` | `creerLogements` | tableau de logements avec numero, etage, surface, typologie, planchers |

---

### 3.8 Services métier

#### `services/setCoverService.js` — Algorithme de sélection (cœur métier)

**Rôle :** Implémente l'algorithme **set cover** (couverture par ensembles) pour sélectionner automatiquement les logements à visiter selon la réglementation DPE collectif.

**Règles appliquées :**
| Règle | Description | Implémentation |
|---|---|---|
| **RG11** | 1 logement par typologie (T1-T6) | `construireCriteres()` ajoute `typo:T1`, `typo:T2`, ... |
| **RG12** | 1 logement par type de plancher bas | `construireCriteres()` ajoute `pb:terre-plein`, etc. |
| **RG13** | 1 logement par type de plancher haut | `construireCriteres()` ajoute `ph:combles`, etc. |
| **RG14** | 1 logement étage intermédiaire | `construireCriteres()` ajoute `etage:intermediaire` si nbEtages > 2 |
| **RG15** | Seuil minimal de visites | `calculerSeuilMinimal()` : <31 = 0, 31-100 = 10%, >100 = 5% (min 10) |

**Fonctions clés :**
| Fonction | Rôle |
|---|---|
| `construireCriteres(logements, nbEtages)` | Construit l'ensemble des critères obligatoires |
| `criteresCouvertPar(logement, nbEtages)` | Détermine quels critères un logement couvre |
| `selectionSetCover(logements, nbEtages)` | Algorithme glouton : choisit à chaque étape le logement qui couvre le plus de critères non encore couverts |
| `calculerSeuilMinimal(nbLogements)` | Calcule le nombre minimum de visites requis |
| `completerJusquaSeuil(selection, logements, seuil)` | Complète la sélection si le seuil n'est pas atteint |
| `lancerSelection(logements, nbEtages)` | Fonction principale : set cover + seuil → résultat structuré |

**Principe de l'algorithme glouton :**
1. On liste tous les critères obligatoires (typologies, planchers, étage intermédiaire)
2. Tant qu'il reste des critères à couvrir :
   - On cherche le logement qui couvre le **maximum** de critères non encore couverts
   - On l'ajoute à la sélection
   - On retire les critères désormais couverts
3. On vérifie le seuil minimal et on complète si nécessaire

---

## 4. FICHIERS D'EXEMPLE ET TESTS

### 4.1 `exemple-set-cover.js`

**Rôle :** Script pédagogique autonome qui démontre l'algorithme set cover avec 10 logements de démonstration.

Peut s'exécuter avec : `node exemple-set-cover.js`

Affiche étape par étape : les critères, ce que chaque logement couvre, la sélection gloutonne, le seuil.

---

### 4.2 `exemple-set-cover.test.js`

**Rôle :** Tests unitaires de l'algorithme set cover (utilise le module `node:test` de Node.js).

**Tests (6 suites, 18 tests) :**

| Suite | Tests |
|---|---|
| `construireCriteres` | Présence de tous les critères (typologies, planchers, étage), pas de doublons |
| `criteresCouvertPar` | RDC ne couvre pas intermédiaire, dernier étage non plus, intermédiaire oui, toujours typo+pb+ph |
| `selectionSetCover` | Sélection non vide, couvre tous les critères, pas de doublons, cas extrêmes (1 seul logement, aucun, vide) |
| `calculerSeuilMinimal` | Seuils : <31→0, 31-100→10%, >100→5% (min 10) |
| `completerJusquaSeuil` | Complète jusqu'au seuil, ne modifie pas si déjà atteint, ne dépasse pas |

**Exécution :** `node --test exemple-set-cover.test.js`

---

## 5. SPÉCIFICATIONS (CAHIER DES CHARGES)

### 5.1 `specifications/brief-projet.md` — Résumé du projet
Contexte, problème, objectifs, acteurs, contraintes réglementaires DPE collectif.

### 5.2 `specifications/user-stories.md` — Récits utilisateur
22 user stories (14 entrepreneur + 6 locataire + 2 occupant) classées par priorité.

### 5.3 `specifications/personas.md` — Profils types
5 personas : Antoine (entrepreneur), Mme Dubois (active), M. Lefèvre (senior), Sarah (diagnostiqueuse), M. Camara (occupant).

### 5.4 `specifications/wireframes.md` — Maquettes ASCII
8 écrans : dashboard, création campagne, détail, planning, configuration immeuble, résultat sélection, jours disponibles, aperçu emails.

### 5.5 `specifications/regles-gestion.md` — Règles métier
17 règles (RG1 à RG17) dont les règles d'échantillonnage (RG11-RG15), jours disponibles (RG16), emails (RG17).

### 5.6 `specifications/cas-utilisation.md` — Cas d'utilisation
13 cas : UC1 (créer campagne) à UC13 (envoyer emails différenciés).

### 5.7 `specifications/glossaire.md` — Définitions
35 termes définis (DPE, campagne, typologie, plancher, échantillonnage, etc.).

---

## 6. DOCUMENTATION PROJET

### 6.1 `docs/01_Plan_Organisation_Projet.md`
Plan complet avec : état des lieux, structure du projet, checklist des tâches (phases A-F), calendrier, livrables, stack technique, risques.

### 6.2 `docs/02_Specifications.md`
Dossier de conception complet (fusion de toutes les specs en un document).

### 6.3 `docs/03_Journal_de_Bord.md`
Journal de toutes les séances de travail (12 séances documentées).

### 6.4 `docs/04_Suivi_Modifications.md`
Historique des versions (v1.0 → v1.1 → v2.0).

### 6.5 `docs/05_Documentation_Technique.md`
Documentation technique (en cours de construction). Décrit l'architecture, le modèle de données, les endpoints API prévus.

### 6.6 `docs/db_documentation.md`
Documentation complète de la base de données MariaDB (10 tables) avec schéma Mermaid.

### 6.7 `docs/TODO_LIST.md`
Liste des tâches à réaliser (phases 1-7 avec statuts).

---

## 7. BASE DE DONNÉES (SQL)

### `testdb.sql` — Script SQL complet (570 lignes)

**Rôle :** Script de migration et de test pour MariaDB.

**Contenu :**
1. Création de la base `audit_energetique`
2. Tables initiales (5) : `locataires`, `batiments`, `appartements`, `campagnes_audit`, `disponibilites_locataires`, `plannings_optimises`
3. Migration vers le nouveau schéma (10 tables) :
   - Renommage des tables
   - Ajout de colonnes (typologie, planchers, sélection)
   - Nouvelles tables : `entrepreneurs`, `typologies`, `types_plancher`, `jours_disponibles`, `emails_envoyes`
   - Fusion : `creneaux` remplace `disponibilites_locataires` + `plannings_optimises`
4. Données de test (INSERT)
5. Tests de contraintes (doublons, clés étrangères)
6. Requêtes de vérification (SELECT, jointures)

**Attention :** Le projet utilise actuellement **MongoDB** (via Mongoose) côté backend. Le script SQL représente la cible future (migration vers MariaDB).

---

## 8. CONFIGURATION AGENT IA

### `Agent.ia/` — Dossier de configuration OpenCode

| Fichier | Rôle |
|---|---|
| `config.json` | Configuration de l'agent IA spécialisé Planif'Audit |
| `regle-acces-fichiers.md` | Restreint les accès en écriture de l'IA |
| `regle-analyse-pre-tache.md` | Oblige l'IA à produire une analyse avant toute modification |
| `regle-journal-de-bord.md` | Automatise la mise à jour du journal de bord |

---

## 9. DÉPENDANCES (package.json)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",         // Hash des mots de passe
    "cors": "^2.8.5",           // Cross-Origin Resource Sharing
    "dotenv": "^16.3.1",        // Variables d'environnement (.env)
    "express": "^4.18.2",       // Framework web
    "joi": "^17.11.0",          // Validation des entrées
    "jsonwebtoken": "^9.0.2",   // Tokens JWT (authentification)
    "mongoose": "^9.6.2",       // ODM MongoDB
    "mysql2": "^3.6.5",         // Client MySQL/MariaDB (pour migration future)
    "nodemailer": "^6.9.7"      // Envoi d'emails
  }
}
```

---

## 10. DIAGRAMME DE LIENS ENTRE FICHIERS

```
[Client Navigateur]
    │
    ├── index.html ──→ styles.css
    │                ──→ script.js (mock data — à brancher sur l'API)
    │
[backend/server.js] ──→ .env (PORT, MONGODB_URI, JWT_SECRET)
    │
    └── app.js
        │
        ├── routes/authRoutes.js
        │   └── controllers/authController.js
        │       └── models/Entrepreneur.js (Mongoose)
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
        ├── routes/referentielRoutes.js
        │   └── controllers/referentielController.js
        │
        └── middlewares/auth.js (JWT)
            ├── jsonwebtoken
            └── models/Entrepreneur.js
```

---

## 11. RÉSUMÉ DU FLUX MÉTIER COMPLET

```
1. ENTREPRENEUR S'INSCRIT / SE CONNECTE
   └── POST /api/auth/register ou /login → token JWT

2. CRÉE UN IMMEUBLE
   └── POST /api/entrepreneur/immeubles → {nom, adresse, typologie, étages, planchers}

3. CRÉE UNE CAMPAGNE
   └── POST /api/entrepreneur/campagnes → {immeuble_id, nom, dates}

4. AJOUTE LES LOGEMENTS À LA CAMPAGNE
   └── POST /api/entrepreneur/campagnes/:id/logements → [{numero, etage, surface, typologie, planchers}]

5. LANCE L'ALGORITHME DE SÉLECTION (set cover)
   └── POST /api/entrepreneur/campagnes/:id/lancer-selection
   └── Algorithme : couvre RG11-RG15 → marque les logements sélectionnés

6. CHOISIT SES JOURS DISPONIBLES
   └── PUT /api/entrepreneur/campagnes/:id/jours-disponibles

7. (FUTUR) GÉNÈRE LES LIENS POUR LES LOCATAIRES
8. (FUTUR) LES LOCATAIRES SAISISSENT LEURS CRÉNEAUX
9. (FUTUR) GÉNÈRE LE PLANNING OPTIMISÉ
10. (FUTUR) ENVOIE LES EMAILS DIFFÉRENCIÉS
```

---

## 12. NOTES IMPORTANTES

- **Frontend actuellement déconnecté** : `script.js` utilise des données mockées. Il faudra le brancher aux vraies API REST.
- **Base de données en transition** : le backend utilise MongoDB (Mongoose), mais la cible est MariaDB (SQL). `testdb.sql` contient le schéma final cible.
- **Algorithme set cover** : le code existe en deux exemplaires (démo standalone `exemple-set-cover.js` + version intégrée `backend/services/setCoverService.js`). Les fonctions sont quasi identiques.
- **Tests** : l'algorithme a des tests unitaires. Les routes n'ont pas encore de tests automatisés.
- **nodemailer** est installé comme dépendance mais pas encore utilisé (envoi d'emails à implémenter).
