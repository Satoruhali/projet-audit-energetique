# 3. Journal de Bord

**Version :** 1.0 — 18/05/2026



| Date | Séance | Actions menées | Problèmes | Solutions |
|---|---|---|---|---|
| 18/05/2026 | 1 | Création du dossier professionnel v1.0 — rédaction du brief initial, des spécifications préliminaires et de la structure du dossier | Aucun | — |
| 18/05/2026 | 2 | Restructuration du dossier : passage de 1 fichier à 5 fichiers distincts. Déplacement du dossier vers `C:\Users\wassi\projet-audit-energetique\` | Aucun | — |
| 19/05/2026 | 3 | Ajout des sections suivantes dans `02_Specifications.md` : • Personas (3 profils) • User stories (10 stories) • Wireframes ASCII (3 écrans) • Parcours utilisateur • Cas d'utilisation (diagramme + 4 fiches) • Règles de gestion (10 règles) • Glossaire (10 termes). Le fichier spec est désormais un dossier de conception complet. | Aucun | — |
| 19/05/2026 | 4 | Génération du frontend complet (HTML/CSS/JS) via OpenCode — 3 vues : Dashboard, Détail campagne (onglets Réponses + Planning), Planning optimisé. Stack vanilla, responsive mobile-first. Palette : vert (#2ecc71), orange (#e67e22), bleu (#3498db). Implémentation RG3 (tri étage), RG4 (pas chevauchement), RG9 (pause 15 min). | Aucun | — |
| 19/05/2026 | 5 | Rédaction du fichier `index.html` : structure SPA avec 3 sections (view-dashboard, view-detail, view-planning), navigation par hash routing, barre sticky, cartes stats, formulaires création et modification, tableaux, timeline, toasts. | Aucun | — |
| 19/05/2026 | 6 | Rédaction du fichier `styles.css` : reset CSS, variables de palette, design mobile-first avec breakpoints à 480px/768px/1024px, composants (topbar, stats, cards, tables, tabs, timeline, badges, formulaires, toasts). Transitions et états hover/active. | Aucun | — |
| 19/05/2026 | 7 | Rédaction du fichier `script.js` : données mockées (3 campagnes, 15 locataires), hash routing SPA, interactions CRUD (création/suppression campagne), onglets détail, génération planning avec RG3/RG4/RG9, fonctions toast, timeline visuelle, relance individuelle/masse, export simulé, modification créneaux avec formulaire. | Aucun | — |
| 20/05/2026 | 8 | Restructuration complète de l'arborescence du projet Planif'Audit. Création dossiers Agent.ia/, skills/, prompts/, specifications/, docs/, backup/. Déplacement des .md racine vers docs/. Création de 6 fichiers specs modulaires (user-stories, personas, wireframes, regles-gestion, cas-utilisation, glossaire). Création config.json agent IA. Déplacement brief-projet.md vers specifications/. Mise à jour du journal de bord. | Aucun | — |
| 20/05/2026 | 9 | Refonte du formulaire de création de campagne : passage en 2 étapes (immeuble → locataires), ajout champs nom/email/téléphone/digicode, colonne Nom dans tous les tableaux, mise à jour mock data avec noms et emails. | Aucun | — |
| 20/05/2026 | 10 | Organisation de la base de données MariaDB : création du schéma avec 5 tables (entrepreneurs, immeubles, campagnes, locataires, creneaux), définition des relations et contraintes. Tests d'intégrité et de cohérence. | Aucun | — |
| 22/05/2026 | 12 | Restructuration complète de la BDD : passage de 5 à 10 tables. Renommage batiments→immeubles, appartements→logements, campagnes_audit→campagnes. Ajout typologies, types_plancher, jours_disponibles, emails_envoyes. Fusion disponibilites_locataires et plannings_optimises dans creneaux. Nouveaux index et contraintes. | Aucun | — |

---

## 20/05/2026 — Séance n°9 - Revue de conception

### Constat / Problème identifié :
Le formulaire de création de campagne actuel est trop limité. Il ne permet pas de saisir :
- Les noms des locataires
- Leurs adresses email (indispensable pour envoyer les invitations)
- Leurs numéros de téléphone
- Les codes d'accès / digicode

### Décision majeure :
**Refonte du formulaire de création de campagne** avec saisie individuelle des locataires.

### Nouveaux champs à ajouter par locataire :
| Champ | Obligatoire | Utilité |
|-------|-------------|---------|
| Nom complet | ✅ | Personnalisation |
| Email | ✅ | Envoi des liens d'invitation |
| Téléphone | ❌ | Relance SMS future |
| Numéro appartement | ✅ | Identification |
| Étage | ✅ | Planning (RG3) |
| Code d'accès | ❌ | Instructions visite |

### Architecture technique retenue :
- **Base de données** : MySQL
- **Backend** : Node.js + Express
- **Frontend** : HTML/CSS/JS (actuel à modifier)
- **Types d'utilisateurs** : 
  - Entrepreneur (admin) : création campagnes, consultation planning
  - Locataire : formulaire public pour choisir créneau

### Prochaines actions immédiates :
1. [x] Modifier le formulaire HTML en 2 étapes (immeuble → locataires)
2. [x] Ajouter la saisie dynamique des locataires en JavaScript
3. [x] Mettre à jour les mock data avec noms et emails
4. [x] Adapter l'affichage détail campagne pour montrer les noms
5. [ ] Modifier le schéma MySQL (ajout colonnes locataires)

### Blocages éventuels :
- Aucun blocage identifié, mais la modification du frontend est prioritaire avant le backend

### Notes complémentaires :
- L'import CSV sera une fonctionnalité secondaire (plus tard)
- Les emails d'invitation seront gérés après la refonte du formulaire

---

## 20/05/2026 — Séance n°10 - Organisation de la base de données

### Objectif :
Mettre en place le schéma relationnel de la base de données MariaDB pour structurer les données de l'application Planif'Audit.

### Travail réalisé :
Création du schéma complet avec **5 tables** :

| Table | Clé primaire | Clé étrangère | Description |
|-------|-------------|---------------|-------------|
| `entrepreneurs` | `id_entrepreneur INT PK` | — | Comptes administrateurs (nom, email, mot_de_passe) |
| `immeubles` | `id_immeuble INT PK` | `id_entrepreneur FK → entrepreneurs(id_entrepreneur)` | Bâtiments rattachés à un entrepreneur |
| `campagnes` | `id_campagne INT PK` | `id_immeuble FK → immeubles(id_immeuble)` | Campagnes de visite liées à un immeuble |
| `locataires` | `id_locataire INT PK` | `id_campagne FK → campagnes(id_campagne)` | Locataires inscrits à une campagne (nom, email, téléphone, appartement, étage, digicode) |
| `creneaux` | `id_creneau INT PK` | `id_campagne FK → campagnes(id_campagne)`, `id_locataire FK → locataires(id_locataire)` | Créneaux de visite (date, heure_debut, heure_fin, statut) |

**Relations principales :**
- Un entrepreneur possède **1 à N** immeubles
- Un immeuble peut avoir **0 à N** campagnes
- Une campagne contient **1 à N** locataires
- Un locataire peut avoir **1 à N** créneaux (réservation + modification)

**Contraintes appliquées :**
- `NOT NULL` sur tous les champs obligatoires (nom, email, étage, dates)
- `UNIQUE` sur email des entrepreneurs et locataires
- `CHECK (étage >= 0)` sur locataires
- `CHECK (statut IN ('libre', 'réservé', 'confirmé', 'annulé'))` sur creneaux
- `ON DELETE CASCADE` pour suppression en cascade campagne → locataires → créneaux
- Index sur `(id_campagne, étage)` pour optimiser le tri par étage (RG3)

### Tests effectués :
- **Création** : exécution du script SQL complet sans erreur
- **Insertion** : insertion de 3 jeux de données de test (1 entrepreneur, 2 immeubles, 3 campagnes, 15 locataires, 30 créneaux)
- **Contraintes** : vérification des `NOT NULL` et `UNIQUE` (doublon email rejeté)
- **Relations** : test `ON DELETE CASCADE` (suppression campagne → suppression automatique des locataires et créneaux liés)
- **Requêtes fonctionnelles** :
  - Récupération des locataires triés par étage pour une campagne (`SELECT ... ORDER BY étage`)
  - Vérification des créneaux sans chevauchement pour un même locataire (auto-jointure)
  - Agrégation du nombre de créneaux par statut par campagne
- **Contrainte RG4** : validation qu'aucun créneau ne se chevauche pour un même locataire via requête de détection

### Difficultés :
- Aucune difficulté majeure. Le passage de MySQL à MariaDB n'a pas posé de problème de compatibilité (MariaDB 10.11+).

### Prochaines étapes :
1. [ ] Mettre à jour le script SQL avec l'architecture finale
2. [ ] Implémenter la couche backend Node.js + Express avec connexion MariaDB
3. [ ] Adapter le frontend pour consommer les données réelles via API
4. [ ] Ajouter les scripts de seed pour la base de développement

### Fin de la séance : 17h00 — Durée : 3h

---

## 21/05/2026 — Séance n°11 - Enrichissement des spécifications (v2.0)

### Objectif :
Intégrer les nouvelles règles métier issues de la réglementation des diagnostics énergétiques collectifs : échantillonnage, algorithme de sélection, disponibilités croisées, communication différenciée.

### Travail réalisé :
- **Ajout des règles RG11 à RG17** (échantillonnage par typologie, plancher bas, plancher haut, étage intermédiaire, seuil minimal, jours disponibles diagnostiqueur, deux types d'emails) dans `specifications/regles-gestion.md`
- **Ajout de 12 nouvelles user stories** (US11–US22) dans `specifications/user-stories.md`
- **Ajout de 4 nouveaux cas d'utilisation** (UC10–UC13) dans `specifications/cas-utilisation.md`
- **Ajout de 10 nouveaux termes** dans `specifications/glossaire.md`
- **Ajout de 2 nouveaux personas** (Sarah la diagnostiqueuse, M. Camara l'occupant) dans `specifications/personas.md`
- **Ajout de 4 nouveaux wireframes** (configuration immeuble, résultat sélection, jours disponibles, aperçu emails) dans `specifications/wireframes.md`
- **Mise à jour complète** de `docs/02_Specifications.md` avec 3 nouvelles sections (algorithme, disponibilités, communication)
- **Mise à jour** de `docs/01_Plan_Organisation_Projet.md` avec une nouvelle phase E (Échantillonnage réglementaire)
- **Mise à jour** de `docs/05_Documentation_Technique.md` avec les sections préparatoires
- **Mise à jour** de `docs/TODO_LIST.md` avec le nouveau planning
- **Mise à jour** de `specifications/brief-projet.md` et `docs/04_Suivi_Modifications.md`

### Difficultés :
- Aucune. La documentation existante était bien structurée, facilitant l'insertion des nouvelles sections.

### Prochaines étapes :
1. Phase A — Initialisation du backend Node.js
2. Phase E — Implémentation de l'algorithme de sélection et des nouvelles règles métier

---

## 21/05/2026 — Étape 0.1 — Initialisation du projet Node.js + structure backend

**Durée effective :** 1h
**Statut :** ✅ COMPLÉTÉ

### Tâches réalisées :
1. ✅ Création du `package.json` avec les dépendances :
   - express, mysql2, dotenv, cors, helmet
   - jsonwebtoken, joi (ou zod), nodemailer, bcrypt

2. ✅ Configuration des variables d'environnement (`.env`) :
   - PORT=3000
   - DB_HOST, DB_USER, DB_PASS, DB_NAME
   - JWT_SECRET

3. ✅ Création du `.gitignore` avec :
   - node_modules/
   - .env
   - backup/

4. ✅ Structure backend mise en place :
```
backend/
├── config/
│   └── db.js (pool MariaDB configuré)
├── app.js (middlewares montés : express.json, cors, helmet)
└── server.js (point d'entrée avec écoute sur PORT)
```

5. ✅ Test du serveur : démarrage réussi sur http://localhost:3000

### Livrable obtenu :
✅ Projet Node.js initialisé et prêt à coder
✅ Serveur backend fonctionnel
✅ Connexion base de données configurée (MariaDB via pool)

### Prochaine étape :
Étape 0.2 — Modélisation BDD + création des tables

### Blocages / Notes :
- Aucun blocage rencontré
- Pense à créer la base de données MariaDB avant l'étape suivante

---

## 22/05/2026 — Restructuration de la base de données

### Objectif :
Mettre à jour le schéma relationnel pour intégrer les nouvelles règles métier (échantillonnage par typologie, planchers, disponibilités entrepreneur, suivi des emails) et aligner la nomenclature avec les spécifications v2.0.

### Changements effectués :

**Renommages :**
- `batiments` → `immeubles`
- `appartements` → `logements`
- `campagnes_audit` → `campagnes`

**Nouvelles tables (4) :**
- `typologies` — catalogue des typologies de logement (T1, T2, …) avec contrainte `CHECK (1–6 pièces)`
- `types_plancher` — référentiel des types de plancher (bas/haut) avec `UNIQUE` sur `nom`
- `jours_disponibles` — disponibilités des entrepreneurs (lié à `entrepreneurs`, `UNIQUE(entrepreneur, date)`)
- `emails_envoyes` — historique des envois d'emails aux locataires avec suivi de statut (envoyé, échoué, ouvert, cliqué)

**Tables supprimées (fusionnées) :**
- `disponibilites_locataires` — intégré dans `creneaux`
- `plannings_optimises` — intégré dans `creneaux`

**Modifications structurelles :**
- `locataires` : n'est plus liée à une campagne ; ajout de `token_acces` (UNIQUE, NULL) et `date_inscription` ; lien désormais via `logements`
- `entrepreneurs` : `id_entrepreneur` → `id` ; ajout de `mot_de_passe_hash`, `telephone`, `date_creation`
- `immeubles` : `id_immeuble` → `id` ; ajout de `nb_etages`, `adresse`
- `campagnes` : `id_campagne` → `id` ; ajout de `statut` ENUM, `nb_min_visites`, `pct_min_visites` ; n'est plus reliée directement aux locataires
- `logements` (ex `appartements`) : ajout de `id_typologie` FK, `id_type_plancher_bas` FK, `id_type_plancher_haut` FK, `position` ENUM, `selectionne_visite` BOOLEAN ; `UNIQUE(batiment_id, numero)`
- `creneaux` : `id_creneau` → `id` ; lie désormais `logements`, `campagnes` et `jours_disponibles` ; ajout de `date_visite`, `ordre_visite`, `statut` ENUM('propose','confirme','effectue','annule') ; deux contraintes UNIQUE composites

**Nouveaux index :**
- `idx_logements_id_immeuble`, `idx_logements_id_typologie`
- `idx_creneaux_id_logement`, `idx_creneaux_id_campagne`, `idx_creneaux_id_jour_disponible`
- `idx_emails_envoyes_locataire`, `idx_emails_envoyes_campagne`
- `idx_locataires_token_acces`

### Impact sur le projet :
- **Schéma passe de 5 à 10 tables** — couvre désormais l'échantillonnage réglementaire, les disponibilités entrepreneur et la communication
- **Modèle de données repensé** : les locataires deviennent des entités indépendantes (plus liées à une campagne) ; la relation passe par immeuble → logements → locataire
- **Backend à adapter** : les requêtes SQL existantes (jointures, insertions) doivent être mises à jour pour refléter les nouveaux noms de colonnes et les nouvelles relations
- **Frontend sans impact immédiat** mais les appels API futurs devront utiliser la nouvelle nomenclature
- **Scripts de seed obsolètes** — à réécrire pour les 10 tables

### Prochaines actions :
- [ ] Mettre à jour le script SQL de création (migration complète)
- [ ] Réécrire les scripts de seed pour les 10 tables
- [ ] Adapter la couche backend (requêtes, routes) à la nouvelle structure
- [ ] Mettre à jour `docs/05_Documentation_Technique.md` avec le nouveau schéma
- [ ] Créer un script de migration pour les données existantes le cas échéant

---

## 26/05/2026 — Étape 2.1 et 2.2 terminées

### Durée totale : ~4h

### Étape 2.1 — Authentification entrepreneur ✅
- Modèle `entrepreneur` avec bcrypt pour mot de passe
- Routes `POST /api/auth/register` et `POST /api/auth/login`
- JWT token avec payload `id_entrepreneur`
- Middleware `auth.js` (vérification token + attache req.entrepreneur)
- Route protégée `GET /api/auth/me`
- ✅ Validation : tests register, login, route protégée OK

### Étape 2.2 — CRUD immeubles + référentiels ✅
- Routes `GET/POST /api/entrepreneur/immeubles` (liste, création)
- Routes référentiels :
  - `GET /api/referentiel/typologies` → [T1, T2, T3, T4, T5, T6]
  - `GET /api/referentiel/plancher-bas` → liste types
  - `GET /api/referentiel/plancher-haut` → liste types
- Validation Joi des payloads (typologies, champs obligatoires)
- ✅ Validation : tests API et Joi OK

### Points bloquants résolus
- Correction des noms de champs (motDePasse, annee_construction, etc.)
- Ajustement longueur mot de passe (minimum 8 caractères)

### Prochaine étape
Étape 2.3 — CRUD lots + consommations

---

## 📅 2026-05-28 — 11:50

- **Tâche** : Réalisation et tests des 6 routes API campagnes — POST `/api/entrepreneur/campagnes` (avec immeuble_id), GET `/api/entrepreneur/campagnes` (liste), GET `/api/entrepreneur/campagnes/:id` (détail avec logements), POST `/api/entrepreneur/campagnes/:id/logements` (ajout par lot), PUT `/api/entrepreneur/campagnes/:id/logements/:id` (édition typo/plancher/position), suppression logique ou physique
- **Durée estimée** : 1h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `routes/api.php`, `app/Http/Controllers/CampagneController.php`, `app/Models/Campagne.php`, `app/Models/Logement.php`
- **Notes** : Tous les tests sont OK. GET /campagnes/:id corrigé (erreur 500 résolue). Serveur redémarré et validé.

---

## 2026-06-01 — Phase 4 : Étape 4.1 et 4.2 terminées (matin)

### Durée totale : ~4h

### Étape 4.1 — Ajout des champs typologie, plancher, position dans le formulaire ✅
- Ajout des sélecteurs "Typologie", "Plancher bas", "Plancher haut", "Position" par logement (Étape 1 du formulaire)
- Étape 2 (créneau) : inchangée
- Appel API `GET /api/referentiel/typologies` et `/api/referentiel/plancher-*` pour alimenter les listes déroulantes
- Validation : ces champs sont désormais obligatoires

### Étape 4.2 — Connexion campagne → API réelle ✅
- Remplacement de `creerCampagne()` : plus de mock data → `POST /api/entrepreneur/campagnes`
- Remplacement de `ajouterLogement()` → `POST /api/.../logements`
- Ajout du champ `id_campagne` dans le store local
- Remplacement du GET dashboard par `GET /api/entrepreneur/campagnes`
- Conservation des mock data comme fallback temporaire si API indisponible

### Points bloquants résolus
- Aucun blocant rencontré
- Dépendances respectées : Étape 1.1, 2.2 (pour 4.1) et Étape 4.1, 2.3 (pour 4.2)

---

## 📅 2026-06-02 — 11:35
- **Tâche** : Algorithme de sélection set cover (RG15) — route POST lancer-selection + service + typologie/planchers sur logement
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `backend/services/setCoverService.js`, `backend/controllers/campagneController.js`, `backend/models/Logement.js`, `backend/routes/campagneRoutes.js`, `backend/validations/logement.js`, `backend/validations/campagne.js`, `exemple-set-cover.js`, `exemple-set-cover.test.js`, `docs/02_Specifications.md`, `specifications/regles-gestion.md`, `specifications/glossaire.md`, `specifications/brief-projet.md`
- **Notes** : Correction seuils RG15 conformes à l'arrêté du 31 mars 2021. Exemple set cover + tests fournis.
---

## 📅 2026-06-02 — 11:38
- **Tâche** : Refactor date_debut/date_fin → joursDisponibles + vue choix des jours (#view-jours)
- **Durée estimée** : 1h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `index.html`, `script.js`, `styles.css`, `backend/models/Campagne.js`, `backend/controllers/campagneJoursController.js`
- **Notes** : Remplacement des dates fixes par un calendrier 30 jours. Intégration composant jours-disponibles dans le détail campagne. Suppression anciennes routes PUT/GET jours-disponibles.
---

## 📅 2026-06-02 — 13:39
- **Tâche** : Authentification complète frontend (inscription, connexion, JWT, déconnexion)
- **Durée estimée** : 1h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `index.html`, `script.js`, `styles.css`, `backend/controllers/authController.js`, `backend/server.js`
- **Notes** : Formulaire login/register avec onglets. Auth guard : redirection vers #auth si non connecté. Correction champ motDePasse côté backend.
---

## 📅 2026-06-02 — 14:25
- **Tâche** : Page publique RDV + API créneaux + tests (livrable étape 5.2)
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `backend/controllers/lienController.js`, `backend/models/Creneau.js`, `backend/models/Locataire.js`, `backend/routes/lienRoutes.js`, `backend/validations/lien.js`, `backend/tests/lien.test.js`, `backend/app.js`, `index.html`, `script.js`, `styles.css`, `package.json`
- **Notes** : Page dédiée /rendez-vous/:token avec sélection jour/heure par l'occupant. GET /api/liens/:token retourne infos locataire + jours dispo. POST /api/liens/:token/creneaux avec validation Joi, vérification disponibilité et chevauchement. Confirmation visuelle + email simulé. 22 tests unitaires et intégration (timeToMinutes, chevauchement, routes).
---

## 📅 2026-06-02 — Audit de sécurité et correction des failles critiques

### Contexte :
Audit du plan d'attaque et du code existant pour identifier les failles pouvant compromettre le bon fonctionnement de l'application à court et moyen terme.

### Failles critiques corrigées :

1. **Rate limiting** — Routes publiques `/api/liens/:token` sans aucune protection (risque brute-force/DDoS)
   - Installation de `express-rate-limit`
   - Limiteur global : 100 req/15 min
   - Limiteur renforcé : 10 req/min sur les routes publiques

2. **Error handler global** — Absence de middleware d'erreur centralisé (erreurs non capturées → crash ou HTML brut)
   - Création de `backend/middlewares/errorHandler.js` avec classe `AppError`
   - Gestion des erreurs Mongoose (ValidationError, doublons code 11000)
   - Connecté dans `app.js` via `app.use(errorHandler)`

3. **Configuration SMTP** — nodemailer inutilisable sans configuration
   - Ajout de `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` dans `.env`

4. **Concept "position" incohérent** — Le plan spécifiait `ENUM('bas','intermediaire','haut')` mais le frontend utilisait des directions cardinales (nord/sud/est/ouest) et le modèle Logement n'avait pas de champ position
   - Ajout du champ `position` dans le modèle `Logement` (enum validé)
   - Validation Joi alignée
   - Frontend : valeurs remplacées par 'bas', 'intermediaire', 'haut'
   - Algorithme set cover : suppression du paramètre `nbEtages`, ajout du critère `position`

5. **Auth frontend/backend désaligné** — Frontend attendait `result.user`, backend renvoyait `result.entrepreneur` → login impossible en conditions réelles
   - Backend : ajout du champ `user` en miroir de `entrepreneur`
   - Frontend : priorité à `result.entrepreneur`, fallback `result.user`, fallback `apiAuthMe()`

### Fichiers modifiés (12) :
- `backend/middlewares/errorHandler.js` — **NOUVEAU**
- `backend/app.js`, `backend/routes/lienRoutes.js` — rate limiting + error handler
- `backend/models/Logement.js`, `backend/validations/logement.js` — champ position
- `backend/controllers/authController.js` — champ user miroir
- `backend/controllers/campagneController.js` — signature lancerSelection
- `backend/services/setCoverService.js` — position dans set cover
- `script.js` — positions + auth + payload logements
- `package.json`, `package-lock.json` — express-rate-limit + NODE_ENV=testing
- `PLAN D'ATTAQUE – RESTRUCTURATION PL.txt` — amendement complet
- `.env` — SMTP + rate limiting config

### Tests : 22/22 ✅
### Statut : ✅ Terminé

---

## 📅 2026-06-03 — 11:30
- **Tâche** : Phase 4.2 — Brancher le frontend aux vraies API (création campagne + dashboard + détail)
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `ANALYSE_PROJET.md`, `PLAN D'ATTAQUE – RESTRUCTURATION PL.txt`, `backend/controllers/referentielController.js`, `backend/routes/referentielRoutes.js`, `script.js`
- **Notes** :
  - `creerCampagne()` ne push plus dans APP.campagnes (mock) ; appelle désormais la séquence API : POST /api/entrepreneur/immeubles → POST /api/entrepreneur/campagnes → POST /.../logements, avec fallback mock si serveur indisponible.
  - Dashboard branché sur GET /api/entrepreneur/campagnes avec fusion API + locales.
  - `showDetail()` devient async : fetch GET /api/entrepreneur/campagnes/:id si locataires absents.
  - Référentiels (typologies, planchers, positions) chargés via API au DOMContentLoaded avec normalisation et détection de données mockées.
  - Ajouté GET /api/referentiel/positions (controller + route).
  - Helpers : `apiImmeubleCreate()`, `apiCampagneShow()`.
---

## 📅 2026-06-03 — 16:30
- **Tâche** : Phase 6.1 — Onglet Échantillonnage + retour Créneaux dans show campagne
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `backend/controllers/campagneController.js`, `backend/models/Campagne.js`, `index.html`, `script.js`, `styles.css`, `docs/03_Journal_de_Bord.md`
- **Notes** :
  - Nouvel onglet "Échantillonnage" dans view-detail avec bouton "Lancer la sélection" → POST /:id/lancer-selection
  - Affiche seuil requis/obtenu, couverture (typologies/planchers/positions), logements sélectionnés
  - Schéma `selection` persisté sur le modèle Campagne (date, seuil, couverture, critères manquants)
  - `GET /campagnes/:id` renvoie désormais les Créneaux (collection séparée) dans la réponse
  - Frontend fusionne les Créneaux dans les locataires : `statut='repondu'` si créneau existe, `'attente'` sinon
  - Planning optimisé fonctionne désormais avec les données réelles (pas seulement mock)
  - 22/22 tests ✅ — commit `0c63bb9`
---

## 📅 2026-06-04 — 11:09
- **Tâche** : Phase 6.2 — Création de la route POST /api/entrepreneur/campagnes/:id/envoyer-emails (manquante) avec nodemailer + template différencié visité/non-visité + historique email_envoyes
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `backend/models/EmailEnvoye.js` (créé), `backend/services/emailService.js` (créé), `backend/controllers/campagneController.js` (modifié), `backend/routes/campagneRoutes.js` (modifié), `backend/tests/envoyer-emails.test.js` (créé)
- **Notes** :
  - Modèle EmailEnvoye avec campagne_id, locataire_id, destinataire, sujet, corps, type (visite_programmee/pas_de_visite/relance), statut (envoye/echec), erreur
  - Service email avec transporter nodemailer (fallback console.log si SMTP non configuré) + templates HTML
  - Template A "visite_programmee" : lien personnalisé avec token pour choisir un créneau
  - Template B "pas_de_visite" : simple information, aucune action requise
  - Controller envoyerEmails : vérifie autorisation (entrepreneur→immeuble→campagne), boucle sur logements avec locataire, template différencié selon selectionne_visite, enregistre chaque envoi dans email_envoyes
  - Route protégée par auth middleware
  - Tests passants : 404 (campagne inconnue), 400 (aucun locataire), 200 (envoi 2 emails : 1 visité + 1 non-visité), vérification base email_envoyes (2 enregistrements)
   - Commit: `761a76d`
---

## 📅 2026-06-05 — 11:30
- **Tâche** : Restructuration du frontend en dossier dédié `frontend/` avec fichiers modulaires (js/, html, css) + mise à jour backend
- **Durée estimée** : 2h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `frontend/auth.html`, `frontend/dashboard.html`, `frontend/detail.html`, `frontend/jours.html`, `frontend/planning.html`, `frontend/rdv.html`, `frontend/css/style.css`, `frontend/js/api.js`, `frontend/js/auth.js`, `frontend/js/dashboard.js`, `frontend/js/detail.js`, `frontend/js/jours.js`, `frontend/js/planning.js`, `frontend/js/rdv.js`, `frontend/js/utils.js`, `backend/controllers/campagneController.js`, `backend/server.js`, `backend/routes/campagneRoutes.js`
- **Notes** :
  - Découpage de l'ancien monolithe `index.html` + `script.js` en 6 pages HTML, 7 modules JS, 1 feuille de style mutualisée
  - Chaque module JS (auth, dashboard, detail, jours, planning, rdv, utils) expose son initialiseur sur `window`
  - Routes pages mises à jour dans `server.js` pour servir les nouveaux fichiers
  - Suppression des fichiers racine `index.html` et `script.js`
  - Commit: `308fb7b`
---

## 📅 2026-06-05 — 14:15
- **Tâche** : Migration complète de MongoDB (Mongoose) vers MySQL (Sequelize) — modèles, contrôleurs, middlewares, seed, tests, documentation
- **Durée estimée** : 3h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : (38 fichiers) `backend/config/database.js` (créé), `backend/db/migrate.js` (créé), `backend/db/migration.sql` (créé), `backend/models/index.js` (créé), `backend/models/JoursDisponible.js` (créé), `backend/models/TypePlancher.js` (créé), `backend/models/Typologie.js` (créé), `backend/controllers/locataireController.js` (créé), `backend/models/Campagne.js`, `backend/models/Creneau.js`, `backend/models/EmailEnvoye.js`, `backend/models/Entrepreneur.js`, `backend/models/Immeuble.js`, `backend/models/Locataire.js`, `backend/models/Logement.js`, `backend/controllers/authController.js`, `backend/controllers/campagneController.js`, `backend/controllers/campagneJoursController.js`, `backend/controllers/immeubleController.js`, `backend/controllers/lienController.js`, `backend/controllers/logementController.js`, `backend/middlewares/auth.js`, `backend/middlewares/errorHandler.js`, `backend/seed.js`, `backend/server.js`, `backend/tests/*.test.js`, `backend/validations/campagne.js`, `docs/*.md`, `package.json`, `package-lock.json`, `.opencode/`, `opencode.json`
- **Notes** :
  - Remplacement de `mongoose.connect()` par `sequelize.authenticate()` + `sequelize.sync()` dans `server.js`
  - Tous les modèles réécrits : `sequelize.define()` au lieu de `mongoose.Schema`, types MySQL (INTEGER, STRING, ENUM, BOOLEAN, TEXT), associations via `belongsTo`/`hasMany`
  - Contrôleurs adaptés : remplacement de `find()`, `findById()`, `save()`, `findByIdAndUpdate()` par `findAll()`, `findByPk()`, `create()`, `update()`, `destroy()` Sequelize
  - Suppression du dossier `Agent.ia/` (déplacé dans `.opencode/`)
  - Ajout des fichiers de configuration opencode (`.opencode/rules/`, `.opencode/skills/`, `opencode.json`)
  - Mise à jour de la documentation technique (`docs/05_Documentation_Technique.md`) et plan projet (`docs/01_Plan_Organisation_Projet.md`)
  - Commit: `b960d08`
---