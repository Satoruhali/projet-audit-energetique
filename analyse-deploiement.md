# Analyse de Déploiement — Planif'Audit

**Date :** 09/06/2026

---

## Structure identifiée

- **Langage / Framework :** Node.js / Express / Sequelize (MySQL)
- **Frontend :** Vanilla JS (HTML/CSS/JS servis statiquement)
- **Backend & Frontend :** dans le même serveur Express (port 3001)

### Dossiers principaux

```
backend/
  controllers/     — Logique métier (8 controllers)
  models/          — Modèles Sequelize (11 modèles)
  routes/          — Définition des routes (6 fichiers)
  services/        — Services (email, set-cover)
  middlewares/     — Auth, Error handler
  validations/     — Schémas Joi
  db/              — Migrations
  tests/           — Tests
frontend/
  js/              — Scripts vanilla JS (8 fichiers)
  css/             — Feuilles de style
  *.html           — Pages (dashboard, detail, planning, etc.)
```

---

## ✅ Ce qui est prêt

| Aspect | Statut |
|--------|--------|
| Base de données MySQL | Configurable via `.env` |
| Tests SQLite en mémoire | `NODE_ENV=testing` |
| Rate limiting | Configurable via `.env` |
| SMTP Gmail | Fonctionnel (testé avec succès) |
| JWT authentication | Fonctionnel |
| Email templates | 3 types (visite, pas de visite, relance) |
| Algorithme set-cover | Propre, sans dépendances externes |
| Gestion d'erreurs API | Middleware errorHandler |
| Validation Joi | Sur toutes les routes critiques |

---

## 🔴 Problèmes bloquants (à corriger avant déploiement)

### 1. URL localhost en dur dans le frontend

- **Fichiers :** `frontend/js/api.js:17`, `frontend/js/rdv.js:8`
- **Problème :** `const API_ORIGIN = 'http://localhost:3001'`
- **Impact :** Toutes les requêtes API échoueront en production
- **Solution :** Remplacer par `window.location.origin`

### 2. JWT_SECRET non vérifié au démarrage

- **Fichier :** `backend/models/Entrepreneur.js:55`
- **Problème :** `jwt.sign({ id }, process.env.JWT_SECRET, ...)` — si `JWT_SECRET` est absent, le secret vaut `undefined`
- **Impact :** Tokens trivialement forgables
- **Solution :** Ajouter une assertion au démarrage dans `server.js`

---

## ⚠️ Problèmes importants (à corriger)

### 3. BASE_URL non documentée comme obligatoire

- **Fichier :** `backend/services/emailService.js:26`
- **Problème :** Fallback à `'http://localhost:3001'`
- **Impact :** Les liens dans les emails pointent vers localhost
- **Solution :** Ajouter guard au démarrage

### 4. Données mockées en production

- **Fichier :** `frontend/js/utils.js:117-205`
- **Problème :** 3 campagnes fictives mélangées aux vraies données
- **Impact :** Confusion utilisateur, données personnelles exposées
- **Solution :** Conditionner avec `location.hostname`

### 5. CORS totalement permissif

- **Fichier :** `backend/app.js:14`
- **Problème :** `app.use(cors())` sans options
- **Impact :** N'importe quel domaine peut appeler l'API
- **Solution :** Restreindre aux domaines autorisés

### 6. Aucun en-tête de sécurité HTTP

- **Fichier :** `backend/app.js`
- **Problème :** Pas de CSP, X-Frame-Options, X-Content-Type-Options
- **Impact :** Vulnérable au clickjacking, XSS, MIME sniffing
- **Solution :** Ajouter le middleware `helmet`

### 7. Pas d'email de confirmation après réservation

- **Fichier :** `backend/controllers/lienController.js:164`
- **Problème :** `console.log('[CONFIRMATION]')` au lieu d'envoyer un email
- **Impact :** Les locataires ne reçoivent aucune confirmation
- **Solution :** Remplacer par `sendMail()`

---

## 🟢 Bonnes pratiques (à faire)

### 8. Changer JWT_SECRET actuel — ✅ Fait

- Nouveau secret : 64 caractères hexadécimaux (généré via `RNGCryptoServiceProvider`)

### 9. Ajouter favicon et balises meta

- Fichiers : Tous les `.html` du frontend
- Manque : meta description, Open Graph, favicon

### 10. Uniformiser CSS de rdv.html

- Problème : 240 lignes de CSS inline, ne suit pas `css/style.css`

### 11. Ajouter `onDelete: 'CASCADE'` sur les associations Sequelize

- Fichier : `backend/models/index.js`
- Impact : Évite les orphelins en base

---

## Tests existants

- **Fichier :** `backend/tests/lien.test.js`

| Commande | Description |
|----------|-------------|
| `npm test` | Tests unitaires + intégration |
| `npm run test:unit` | Tests unitaires seulement |
| `npm run test:int` | Tests API seulement |

---

## Commandes de démarrage

| Commande | Description |
|----------|-------------|
| `npm start` | Production |
| `npm run dev` | Développement |
| `npm run seed` | Seed base de données |
| `npm test` | Tests |
