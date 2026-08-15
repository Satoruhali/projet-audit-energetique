# Plan — Personnalisation par utilisateur + envoi d'emails personnalisé

**Date :** 03/08/2026
**Statut :** Plan validé, aucune implémentation en cours

---

## Contexte

Le client souhaite que **chaque utilisateur (entrepreneur)** puisse :

1. **Personnaliser l'application** — afficher le logo de son entreprise et son nom dans l'interface.
2. **Envoyer les emails à partir de sa propre adresse** — configurer son propre SMTP (identifiants, adresse d'émission).

> Décisions actées : personnalisation limitée à **logo + nom de l'entreprise** (pas de couleurs de marque pour l'instant). Stockage des mots de passe SMTP **chiffré**.

---

## Analyse préalable

### Structure identifiée

- Langage / framework : **Node.js / Express** (backend) + **HTML/CSS/JS vanilla multi-page** (frontend) + **MySQL (Sequelize)** — SQLite en mémoire pour les tests
- Dossiers impactés : `backend/models/`, `backend/controllers/`, `backend/routes/`, `backend/services/`, `frontend/` (pages HTML + `js/` + `css/style.css`)
- Fichiers existants pertinents :
  - `backend/models/Entrepreneur.js` — modèle utilisateur
  - `backend/services/emailService.js` — transporteur SMTP global unique (singleton)
  - `backend/controllers/campagneController.js` + `lienController.js` — appelent `sendMail`
  - `backend/controllers/authController.js` — inscription / connexion / profil
  - `frontend/dashboard.html`, `auth.html`, etc. — logo « Planif'Audit » en dur dans la topbar
  - `backend/server.js` — sert les fichiers statiques (devra servir `uploads/`)
  - `backend/db/migrate.js` — script de migration à compléter (pattern `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)

### Impact estimé

- Fichiers à modifier : `Entrepreneur.js`, `emailService.js`, `authController.js`, `campagneController.js`, `lienController.js`, `app.js`, `server.js`, `.env.template`, `db/migrate.js`, pages HTML + JS frontend + `style.css`
- Fichiers à créer : `controllers/settingsController.js`, `routes/settingsRoutes.js`, `middlewares/upload.js`, `services/crypto.js`, page frontend `parametres.html` + `js/parametres.js`, dossier `uploads/`
- Risque de régression : ⚠️ **Faible à moyen** — l'envoi d'emails doit rester fonctionnel si l'utilisateur n'a pas configuré son propre SMTP (fallback SMTP global actuel conservé)

---

## Règles transverses (à appliquer à toutes les tâches)

- Toute route de `settingsRoutes` est protégée par le middleware `auth` (`backend/middlewares/auth.js`).
- **Jamais** renvoyer le mot de passe SMTP en clair dans une réponse API (même masqué partiellement uniquement si nécessaire).
- Le comportement actuel (SMTP global + simulation console si SMTP absent) doit **rester inchangé** tant qu'un entrepreneur n'a rien configuré.
- Ajouter les nouveaux champs au **modèle Sequelize ET à `migrate.js`** (pattern `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) pour ne rien casser en production.
- Ajouter une entrée au `README.md` uniquement si des commandes changent (non requis pour ce plan).
- Chaque étape se termine par la **vérification décrite**, avant de passer à la suivante.

---

## Partie 1 — Personnalisation : logo + nom de l'entreprise

### P1-T1 — Base de données
- **Fichiers :** `backend/models/Entrepreneur.js`, `backend/db/migrate.js`
- **Actions :**
  - Ajouter au modèle : `nom_entreprise` (`STRING(255)`, nullable), `logo_url` (`STRING(500)`, nullable).
  - Ajouter dans `migrate.js` :
    `ALTER TABLE entrepreneurs ADD COLUMN IF NOT EXISTS nom_entreprise VARCHAR(255) NULL` et
    `ALTER TABLE entrepreneurs ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) NULL`.
- **Vérification :** `npm run migrate` se termine sans erreur ; le modèle reflète les 2 champs.

### P1-T2 — Middleware d'upload
- **Fichiers :** `backend/middlewares/upload.js` (nouveau), `package.json`
- **Actions :**
  - Installer `multer` (`npm install multer`).
  - Créer `upload.js` : `diskStorage` vers le dossier `uploads/` (créé si absent), nom de fichier aléatoire (ex. `crypto.randomUUID()` + extension), filtrage MIME (`image/jpeg`, `image/png`, `image/svg+xml`), limite de taille **500 Ko**, message d'erreur clair en cas de refus.
- **Vérification :** uploader via une requête multipart : un fichier valide est stocké dans `uploads/` ; un fichier trop gros ou de mauvais type est rejeté (erreur 4xx).

### P1-T3 — API Paramètres (backend)
- **Fichiers :** `backend/controllers/settingsController.js`, `backend/routes/settingsRoutes.js` (nouveaux), `backend/app.js`
- **Actions :**
  - `GET /api/entrepreneur/parametres` → retourne `nom_entreprise`, `logo_url`, `nom`, `email` (+ `smtp_configured` booléen, sans secrets).
  - `PUT /api/entrepreneur/parametres` → met à jour `nom_entreprise` (body : `{ nomEntreprise }`).
  - `POST /api/entrepreneur/parametres/logo` → upload multipart via le middleware `upload.single('logo')` ; met à jour `logo_url` ; supprime l'ancien fichier d'upload si remplacé.
  - Monter `settingsRoutes` dans `app.js` sous `/api/entrepreneur` avec le middleware `auth`.
- **Vérification :** avec un token valide, les 3 routes répondent correctement ; sans token → 401 ; upload ok → le chemin du fichier est renvoyé.

### P1-T4 — Page Paramètres (frontend)
- **Fichiers :** `frontend/parametres.html`, `frontend/js/parametres.js` (nouveaux), `backend/server.js`
- **Actions :**
  - Créer `parametres.html` (topbar identique aux autres pages + section personnalisation) et `parametres.js` (charger le profil, pré-remplir les champs, upload du logo avec **aperçu** avant envoi, message de succès/erreur).
  - Ajouter la route statique dans `server.js` : `app.get('/parametres', ...)`.
  - Servir `uploads/` en statique dans `server.js` : `app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))`.
- **Vérification :** navigation `/parametres` → la page charge les infos actuelles ; le logo se met à jour avec aperçu et persiste après rechargement.

### P1-T5 — Injection logo + nom dans la topbar
- **Fichiers :** `frontend/dashboard.html`, `detail.html`, `jours.html`, `planning.html`, `rdv.html`, `auth.html` + leurs JS (`dashboard.js`, `detail.js`, `jours.js`, `planning.js`, `rdv.js`, `auth.js`), `frontend/css/style.css`, `frontend/js/api.js` ou `utils.js`
- **Actions :**
  - Créer une fonction réutilisable (ex. `injecterBranding(elementLogo, elementNom)`) qui appelle `GET /api/entrepreneur/parametres` avec le token stocké et remplace le texte « Planif'Audit » par le logo (`<img>` si `logo_url`, sinon fallback texte) + le `nom_entreprise`.
  - L'invoquer sur chaque page connectée ; sur `rdv.html` et `auth.html` (pages publiques sans token) conserver l'affichage par défaut « Planif'Audit ».
  - Adapter `style.css` : taille max du logo dans la topbar (hauteur ~32-40px).
- **Vérification :** avec un logo configuré, il apparaît sur toutes les pages connectées ; sans logo, rien ne change visuellement.

---

## Partie 2 — Envoi d'emails depuis l'adresse du client

**Option retenue : D. Hybride** — fallback SMTP global actuel ; dès qu'un entrepreneur configure son SMTP, le sien est utilisé.

### P2-T1 — Base de données SMTP
- **Fichiers :** `backend/models/Entrepreneur.js`, `backend/db/migrate.js`
- **Actions :**
  - Ajouter au modèle : `smtp_host` (`STRING(255)`), `smtp_port` (`INTEGER`), `smtp_user` (`STRING(255)`), `smtp_pass_encrypted` (`TEXT`), `smtp_from` (`STRING(255)`), `smtp_from_nom` (`STRING(255)`) — tous nullable.
  - Ajouter les `ALTER TABLE entrepreneurs ADD COLUMN IF NOT EXISTS ...` correspondants dans `migrate.js`.
- **Vérification :** `npm run migrate` ok ; le modèle reflète les 6 champs.

### P2-T2 — Module de chiffrement
- **Fichiers :** `backend/services/crypto.js` (nouveau), `.env.template`, `backend/server.js`
- **Actions :**
  - Créer `crypto.js` : **AES-256-GCM** avec `node:crypto`, clé depuis `process.env.SMTP_ENCRYPTION_KEY` (32 octets → générer si absent est INTERDIT : si la clé manque au démarrage, erreur fatale).
  - Exposer `encrypt(plaintext)` → `{ iv, tag, data }` (hex) et `decrypt(payload)`.
  - Ajouter `SMTP_ENCRYPTION_KEY=` à `.env.template` et au contrôle de variables requises dans `server.js`.
- **Vérification :** un test rapide montre `decrypt(encrypt(x)) === x` ; le serveur refuse de démarrer sans la clé.

### P2-T3 — Refonte du service emails
- **Fichiers :** `backend/services/emailService.js`
- **Actions :**
  - Remplacer le singleton : créer une fonction `getTransporter(smtpConfig)` qui construit un transporteur par entrepreneur à partir de `{ host, port, user, pass, secure: port === 465 }`.
  - Étendre `sendMail({ to, subject, html, smtpConfig })` : si `smtpConfig` est fourni → l'utiliser ; sinon → comportement actuel (transporteur global du `.env`, sinon simulation console).
  - Déchiffrer `smtp_pass_encrypted` via `crypto.decrypt` avant de construire le transporteur.
  - Adapter les templates pour accepter un `nomEntreprise` (signature « Cordialement, L'équipe Planif'Audit » → « ... [nomEntreprise] »), avec fallback sur « Planif'Audit ».
- **Vérification :** `npm run test` (tests existants `backend/tests/envoyer-emails.test.js`) passe ; un envoi sans config SMTP garde la simulation console.

### P2-T4 — API SMTP
- **Fichiers :** `backend/controllers/settingsController.js`, `backend/routes/settingsRoutes.js`
- **Actions :**
  - `PUT /api/entrepreneur/parametres/smtp` : body `{ host, port, user, pass, from, fromNom }` → stocke (pass chiffré via `crypto.encrypt`). Si un champ est vide, il est laissé tel quel (sauf `pass` vide → non modifié).
  - `POST /api/entrepreneur/parametres/smtp/test` : envoie un email de test via `sendMail` avec la config stockée ; retourne `{ success, message }` ou erreur lisible.
  - `GET /api/entrepreneur/parametres` : retourne la config SMTP **sans** `smtp_pass_encrypted` ni mot de passe (juste `smtp_configured`).
- **Vérification :** config sauvegardée → `smtp_configured: true` ; test d'envoi avec un serveur factice (ex. Mailtrap) aboutit ; le mdp n'apparaît jamais dans les réponses.

### P2-T5 — Intégration aux envois existants
- **Fichiers :** `backend/controllers/campagneController.js`, `backend/controllers/lienController.js`
- **Actions :**
  - À chaque appel à `sendMail`, charger l'entrepreneur courant (`req.entrepreneur`), reconstruire `smtpConfig` depuis la base (déchiffrement) et le passer à `sendMail`.
  - Passer `nomEntreprise` aux templates (signature) quand disponible.
- **Vérification :** une campagne d'envoi déclenchée par un entrepreneur avec SMTP configuré part de sa boîte ; sans config, rien ne change.

### P2-T6 — Formulaire SMTP (frontend)
- **Fichiers :** `frontend/js/parametres.js`, `frontend/parametres.html`, `frontend/css/style.css`
- **Actions :**
  - Ajouter une section « Configuration email » : champs hôte, port, utilisateur, mot de passe (type password, placeholder « Laisser vide pour conserver »), adresse d'émission, nom d'affichage.
  - Boutons « Enregistrer » et « Tester l'envoi » (ce dernier désactivé pendant l'envoi, message de résultat).
- **Vérification :** sauvegarde ok avec confirmation ; test d'envoi affiche succès/échec ; après rechargement, les champs sauf le mot de passe sont pré-remplis.

### P2-T7 — Sécurité
- **Fichiers :** `.env.template`, `backend/server.js`
- **Actions :**
  - Documenter dans `.env.template` la génération de `SMTP_ENCRYPTION_KEY` (ex. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
  - Vérifier la présence de `SMTP_ENCRYPTION_KEY` au démarrage (erreur fatale si absent).
- **Vérification :** le serveur refuse de démarrer sans la clé ; `.env.template` est complet.

---

## Ordre d'exécution global

1. **P1-T1 → P1-T5** dans l'ordre (chacune vérifiée avant la suivante).
2. **Validation utilisateur intermédiaire** après la Partie 1 (logo + nom).
3. **P2-T1 → P2-T7** dans l'ordre.
4. **Tests finaux :** `npm run test`, `npm run test:unit`, `npm run test:int` ; vérification manuelle du parcours complet (upload logo + envoi d'email de test).

---

## Sécurité

- Les mots de passe SMTP sont **chiffrés en base** (AES-256-GCM) avec une clé dans le `.env` — jamais stockés ni renvoyés en clair.
- Routes de paramètres protégées par **JWT** (middleware `auth`).
- Upload de logo : validation du type MIME, taille limitée, nom de fichier aléatoire (évite les injections de chemin).
- Clé `SMTP_ENCRYPTION_KEY` obligatoire au démarrage (pas de fallback silencieux).

## Hors périmètre (pour plus tard)

- Couleurs / thème de marque (variable CSS)
- Page RDV publique blanche aux couleurs du client
- Gestion multi-utilisateurs par entreprise / rôles
