# Guide des fonctions principales — Planif'Audit

## 1. `backend/server.js` — Point d'entrée

| Fonction / Bloc | Rôle | Détail technique |
|---|---|---|
| **Validation `.env`** (lignes 4-13) | Vérifie que `JWT_SECRET` et `BASE_URL` existent | Boucle sur un tableau `requiredEnvVars` contenant `{ key, message }` ; si une variable est manquante → `console.error()` + `process.exit(1)` → le serveur ne démarre pas |
| **Fichiers statiques** (lignes 23-31) | Sert les pages HTML sur `/dashboard`, `/auth`, etc. | `express.static(FRONTEND)` avec `FRONTEND = path.join(__dirname, '..', 'frontend')` ; chaque route GET explicite ( `/`, `/auth`, `/dashboard`, `/detail`, `/jours`, `/planning`, `/rendez-vous/:token` ) appelle `res.sendFile(path.join(FRONTEND, 'fichier.html'))` |
| **Catch-all API** (ligne 33) | Route inconnue en `/api/*` → 404 JSON | `app.get('/api/*', (req, res) => res.status(404).json({ message: 'Route API inconnue' }))` |
| **Connexion MySQL** (lignes 35-46) | `sequelize.authenticate()` + `sync()` + démarrage | Appels chaînés via Promises : si `authenticate()` échoue → `process.exit(1)` ; si `sync()` réussit → `app.listen(PORT, HOST)` avec `PORT` (défaut 3000) et `HOST` (défaut `'0.0.0.0'`) |

> **Questions — Section 1 : `server.js`**
> 1. Que se passe-t-il si `JWT_SECRET` ou `BASE_URL` n'est pas défini dans le fichier `.env` ?
> 2. Combien de routes GET explicites sont déclarées pour servir les fichiers statiques ? Citez-en trois.
> 3. Si quelqu'un appelle `GET /api/voitures`, quelle réponse reçoit-il ?
> 4. Dans quel ordre les étapes de démarrage s'exécutent-elles : `sync()`, `authenticate()`, `app.listen()` ?

---



## 2. `backend/app.js` — Middleware et routes

| Fonction / Bloc | Rôle | Détail technique |
|---|---|---|
| **CORS** (ligne 16) | Autorise les requêtes cross-origin | `cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' })` — ne bloque que si l'origine ne correspond pas |
| **Helmet** (ligne 17) | Sécurise les en-têtes HTTP | `helmet()` applique des en-têtes de sécurité (X-Content-Type-Options, X-Frame-Options, etc.) |
| **Rate limiting** (lignes 22-28) | 100 requêtes / 15 min max | `rateLimit({ windowMs, max, message })` ; en environnement `test` / `testing`, `max` passe à 1000 pour ne pas bloquer les tests ; appliqué à toutes les routes `/api/` |
| **Route health** (lignes 32-34) | Point de monitoring | `GET /api/health` → `{ status: 'OK', message: 'Serveur opérationnel' }` |
| **Montage des routeurs** (lignes 36-44) | Branche les 6 routeurs | `authRoutes` → `/api/auth`, `immeubleRoutes` → `/api/entrepreneur/immeubles`, `campagneRoutes` → `/api/entrepreneur/campagnes`, `campagneJoursRoutes` → `/api/entrepreneur/campagnes/:id`, `lienRoutes` → `/api/liens`, `referentielRoutes` → `/api/referentiel` |
| **Error handler** (ligne 46) | Middleware global d'erreurs | Placé **après** toutes les routes ; tout `next(err)` non géré atterrit ici |

> **Questions — Section 2 : `app.js`**
> 1. Quelle est la limite de rate limiting par défaut ? Pourquoi passe-t-elle à 1000 en environnement de test ?
> 2. Quelle route permet de vérifier que le serveur est opérationnel ?
> 3. Où doit être placé le middleware d'erreur par rapport aux routes ? Pourquoi ?
> 4. Combien de routeurs sont montés ? Sous quels préfixes d'URL ?

---

## 3. `backend/middlewares/auth.js` — Authentification JWT

| Fonction | Rôle | Détail technique |
|---|---|---|
| **`auth`** (middleware) | Vérifie que la requête est authentifiée | 1. Lit `req.headers.authorization` ; 2. Vérifie qu'il commence par `'Bearer '` → sinon 401 `Token manquant` ; 3. Extrait le token après l'espace, appelle `jwt.verify(token, JWT_SECRET)` → `decoded.id` ; 4. Charge l'entrepreneur avec `Entrepreneur.findByPk(decoded.id)` → si introuvable → 401 `Utilisateur introuvable` ; 5. Attache `req.entrepreneur = { id, nom, email }` ; 6. `next()` ; si `jwt.verify()` lance une erreur (token expiré ou invalide) → catch → 401 `Token invalide ou expiré` |

> **Questions — Section 3 : `auth.js`**
> 1. Sous quel format le token JWT doit-il être envoyé dans l'en-tête `Authorization` ?
> 2. Que se passe-t-il si le token est valide mais que l'utilisateur a été supprimé de la BDD ?
> 3. Quelles informations sont attachées à `req.entrepreneur` après authentification ?
> 4. Quelle réponse est renvoyée si le token a expiré ?

---

## 4. `backend/models/index.js` — Associations Sequelize

| Relation | Type | Détail technique |
|---|---|---|
| `Entrepreneur → Immeuble` | 1:N | `Entrepreneur.hasMany(Immeuble, { foreignKey: 'id_entrepreneur', onDelete: 'CASCADE' })` + `Immeuble.belongsTo(Entrepreneur, { foreignKey: 'id_entrepreneur' })` |
| `Immeuble → Logement` | 1:N | `foreignKey: 'batiment_id'` — chaque immeuble a plusieurs logements |
| `Immeuble → Campagne` | 1:N | Même clé `batiment_id` — une campagne est liée à un immeuble |
| `Logement → Typologie` | N:1 | `foreignKey: 'id_typologie'` — un logement a une typologie (T1, T2...) |
| `Logement → TypePlancher (bas/haut)` | N:1 (deux alias) | Deux associations distinctes : `as: 'plancherBas'` via `id_type_plancher_bas` et `as: 'plancherHaut'` via `id_type_plancher_haut` |
| `Logement → Locataire` | N:1 | `foreignKey: 'locataire_id'` — un logement a un locataire |
| `Campagne → Creneau` | 1:N | `foreignKey: 'id_campagne'` — une campagne a des créneaux de visite |
| `Logement → Creneau` | 1:N | `foreignKey: 'id_logement'` — un logement peut avoir un créneau réservé |
| `Campagne → EmailEnvoye` | 1:N | `foreignKey: 'id_campagne'` — historique des emails d'une campagne |
| `Locataire → EmailEnvoye` | 1:N | `foreignKey: 'id_locataire'` — emails reçus par un locataire |
| `Entrepreneur → JoursDisponible` | 1:N | `foreignKey: 'id_entrepreneur'` — jours de disponibilité du diagnostiqueur |

> **Questions — Section 4 : Associations**
> 1. Si un `Entrepreneur` est supprimé, que deviennent ses `Immeuble` à cause de `onDelete: 'CASCADE'` ?
> 2. Un `Logement` possède deux associations vers `TypePlancher`. Comment les distingue-t-on ?
> 3. Quelle clé étrangère lie un `Logement` à son `Immeuble` ?
> 4. Quelle association permet de relier un `Creneau` à une `Campagne` ?

---

## 5. `backend/controllers/campagneController.js` — Logique campagne

| Fonction | Ligne | Rôle | Détail technique |
|---|---|---|---|
| **`store`** | 14-40 | Crée une campagne | Valide le body avec `creerCampagne.validate(req.body)` (schéma Joi) ; vérifie que l'`immeuble_id` appartient à `req.entrepreneur.id` via `Immeuble.findOne()` → 404 si introuvable ; crée la campagne avec `statut: value.statut || 'brouillon'`, `date_debut_possible: new Date()`, `date_fin_possible: now + 30 jours` |
| **`index`** | 42-57 | Liste les campagnes | Récupère d'abord les immeubles de l'entrepreneur (`Immeuble.findAll({ where: { id_entrepreneur } })`), puis les campagnes dont `batiment_id ∈ immeubleIds` via `Op.in` |
| **`show`** | 59-124 | Détail complet d'une campagne | Vérifie la propriété (immeubles → campagnes). Charge : (1) les **logements** avec leurs associations (`Typologie` → `.code`, `TypePlancher` via alias `.nom`, `Locataire`) ; (2) les **locataires** via `Locataire.findAll` avec include `Logement` où `batiment_id` = celui de la campagne ; (3) les **créneaux** déjà réservés ; (4) les **relances** déjà envoyées (type `'relance'`) → construit un `Set` des `id_locataire` concernés. Transforme chaque logement : `typologie` devient une chaîne (le code), `plancher_bas` / `plancher_haut` deviennent le nom du type. Ajoute `relance_envoye: true/false` à chaque locataire. |
| **`lancerSelection`** | 126-201 | Lance l'algorithme de sélection | Réinitialise d'abord tous les `selectionne_visite = false` pour l'immeuble ; charge les logements avec leurs critères (typo, planchers, position) ; appelle `lancerSelection(logementsData)` du `setCoverService` ; met à jour en BDD les logements sélectionnés avec `selectionne_visite = true` ; sauvegarde dans `campagne.selection` un objet JSON contenant `date_selection`, `seuil_requis`, `seuil_obtenu`, `couverture`, `couvertureComplete`, `criteresManquants` |
| **`listEmails`** | 203-228 | Historique des emails | Vérifie la propriété de la campagne, puis `EmailEnvoye.findAll({ where: { id_campagne: campagne.id }, order: [['date_envoi', 'DESC']], limit: 100 })` |
| **`envoyerEmails`** | 230-320 | Envoie les emails différenciés | Charge les logements avec leur `Locataire`. Filtre ceux avec un email valide. Pour chaque logement : si `selectionne_visite === true` → utilise `templateVisiteProgrammee(locataire, token)` (lien de réservation), sinon → `templatePasDeVisite(locataire)` (simple info). Appelle `sendMail()`, enregistre chaque envoi dans `EmailEnvoye` avec le type correspondant (`'visite_programmee'` ou `'pas_de_visite'`), le statut (`'envoye'` / `'echec'`) et l'erreur éventuelle. Retourne un récapitulatif `{ total_envoyes, total_erreurs, details }`. |
| **`envoyerRelances`** | 322-422 | Relance les non-répondants | Charge les logements avec `selectionne_visite: true` et leur locataire ; récupère tous les créneaux de la campagne → déduit les `locatairesAvecCreneau` (ceux qui ont déjà réservé) ; ne relance que ceux qui n'ont **pas** réservé ; supporte un filtre optionnel `req.body.ids[]` pour ne relancer que certains locataires. Envoie `templateRelance` et enregistre avec `type: 'relance'`. |

> **Questions — Section 5 : `campagneController.js`**
> 1. Que vérifie la fonction `store` avant de créer une campagne ?
> 2. Comment `index` récupère-t-elle les campagnes d'un entrepreneur ?
> 3. Dans `envoyerEmails` : quels types de templates sont utilisés selon la valeur de `selectionne_visite` ?
> 4. Dans `envoyerRelances` : quels locataires sont exclus de la relance ? Comment ?
> 5. Que contient le JSON sauvegardé dans `campagne.selection` après `lancerSelection` ?

---

## 6. `backend/services/setCoverService.js` — Algorithme set cover

| Fonction | Ligne | Rôle | Détail technique |
|---|---|---|---|
| **`construireCriteres(logements)`** | 1-17 | Construit l'ensemble des critères à couvrir | Parcourt tous les logements, extrait les valeurs **distinctes non-null** de `typologie`, `plancher_bas`, `plancher_haut`, `position`. Stocke chaque valeur préfixée dans un `Set` : `typo:T1`, `pb:carrelage`, `ph:placo`, `pos:nord` |
| **`criteresCouvertPar(logement)`** | 19-26 | Critères couverts par un seul logement | Pour un logement donné, retourne un `Set` des critères qu'il possède (champs non null), avec les mêmes préfixes |
| **`selectionSetCover(logements)`** | 28-70 | **Algorithme glouton** | Tant que `criteresRestants.size > 0` : (1) pour chaque logement non encore sélectionné, compte combien de critères restants il couvre ; (2) prend celui qui en couvre le plus (`meilleurCompte`) ; (3) l'ajoute à la sélection, retire ses critères de `criteresRestants`. Stop si plus aucun logement n'apporte de nouveau critère (`meilleurCompte === 0`). Retourne `{ selectionnes, ilRestait }` |
| **`calculerSeuilMinimal(nbLogements)`** | 72-76 | **RG15** : seuil quantitatif | `< 31` logements → 0% (pas de seuil) ; `31-100` → `Math.ceil(nbLogements * 0.10)` soit 10% ; `> 100` → `Math.max(10, Math.ceil(nbLogements * 0.05))` soit 5% (min 10) |
| **`completerJusquaSeuil(selection, logements, seuil)`** | 78-91 | Complète si le seuil n'est pas atteint | Si `selection.length < seuil` : prend les logements **non sélectionnés**, les trie par `etage` croissant, et les ajoute jusqu'à atteindre le seuil |
| **`lancerSelection(logements)`** | 93-116 | **Fonction principale** | 1. Normalise les données (`.toJSON()` si nécessaire) ; 2. Exécute `selectionSetCover()` ; 3. Complète avec `completerJusquaSeuil()` ; 4. Retourne `{ success (boolean: plus aucun critère manquant), selectionnes (tableau d'ids), couverture (objets typologies/planchersBas/planchersHaut/positions avec valeurs distinctes), seuil (requis/obtenu), criteresManquants }` |

> **Questions — Section 6 : Algorithme set cover**
> 1. Sur quels 4 critères l'algorithme s'appuie-t-il pour sélectionner les logements ?
> 2. Quel est le principe de l'algorithme glouton `selectionSetCover` ?
> 3. Pour 50 logements, combien doivent être sélectionnés au minimum selon `calculerSeuilMinimal` ?
> 4. Si le seuil n'est pas atteint, comment `completerJusquaSeuil` choisit-elle les logements supplémentaires ?
> 5. Que signifie `success: true` dans le retour de `lancerSelection` ?

---

## 7. `backend/services/emailService.js` — Emails

| Fonction | Rôle | Détail technique |
|---|---|---|
| **`getTransporter()`** | Crée la connexion SMTP | Singleton : une fois `transporter` créé, il est réutilisé. Si `SMTP_HOST` est défini et différent de `'smtp.example.com'`, crée `nodemailer.createTransport()` avec les options `{ host, port, secure: port === 465, auth: { user, pass } }` si identifiants fournis. Sinon → `null` (mode simulation) |
| **`templateVisiteProgrammee({prenom, nom, nom_campagne, nom_immeuble, token})`** | Email avec lien de réservation | Génère `{ sujet, corps }` en HTML. Le lien est `BASE_URL + '/rendez-vous/' + token` avec un bouton bleu stylisé « Choisir un créneau » |
| **`templatePasDeVisite({prenom, nom, nom_campagne, nom_immeuble})`** | Email d'information | Informe que le logement n'a pas été retenu, aucune action nécessaire |
| **`templateRelance({prenom, nom, nom_campagne, nom_immeuble, token})`** | Email de relance | Même structure que `visiteProgrammee` mais avec un message de relance « Nous n'avons pas encore reçu votre choix » |
| **`templateConfirmation({prenom, nom, date_visite, heure_debut, heure_fin, nom_immeuble, nom_campagne})`** | Email de confirmation | Envoyé **après** réservation d'un créneau ; affiche la date et le créneau horaire confirmés |
| **`sendMail({to, subject, html})`** | Envoi réel ou simulation | Si `transporter` est `null` → log dans la console avec `[EMAIL SIMULÉ]` et retourne `{ success: true }` ; sinon envoie via SMTP avec `from: "Planif'Audit" <SMTP_FROM || 'noreply@planifaudit.fr'>` et retourne `{ success: true }` ou `{ success: false, error: err.message }` |

> **Questions — Section 7 : Service email**
> 1. Quand `sendMail` utilise-t-il la console au lieu d'envoyer un vrai email ?
> 2. Quels sont les 4 templates d'email disponibles ? Dans quel scénario chacun est-il utilisé ?
> 3. Quelle information clé le template `VisiteProgrammee` contient-il que `PasDeVisite` n'a pas ?
> 4. Le template `Confirmation` est-il envoyé avant ou après la réservation d'un créneau ?

---

## 8. `frontend/js/api.js` — Appels API frontend

### Helpers de gestion du token

| Fonction | Rôle |
|---|---|
| `getToken()` | Lit `localStorage.getItem('planif_token')` |
| `setToken(t)` | Écrit `localStorage.setItem('planif_token', t)` |
| `clearToken()` | `localStorage.removeItem('planif_token')` |
| `getUser()` | Parse `localStorage.getItem('planif_user')` depuis du JSON |
| `setUser(u)` | Stocke l'utilisateur connecté en JSON dans le localStorage |

### Fonction générique et fonctions API

| Fonction | Méthode + URL | Rôle | Détail technique |
|---|---|---|---|
| **`apiFetch(method, path, body, useAuth)`** | — | Fonction générique | Construit l'URL via `API_BASE + path` ; ajoute le header `Authorization: Bearer <token>` si `useAuth` (défaut true) et qu'un token existe ; si la réponse est 401, efface le token et redirige vers `/auth` |
| `apiAuthLogin(email, password)` | POST `/api/auth/login` | Connexion | Appel direct (sans auth) ; retourne l'objet JSON ou `{ error }` |
| `apiAuthRegister(name, email, password)` | POST `/api/auth/register` | Inscription | Idem avec corps `{ nom, email, password }` |
| `apiAuthMe()` | GET `/api/auth/me` | Profil | Vérifie le token actuel ; retourne l'utilisateur ou null |
| `apiImmeubleCreate(data)` | POST `/api/entrepreneur/immeubles` | Créer un immeuble |
| `apiCampagneCreate(data)` | POST `/api/entrepreneur/campagnes` | Créer une campagne |
| `apiCampagnesList()` | GET `/api/entrepreneur/campagnes` | Lister les campagnes |
| `apiCampagneShow(id)` | GET `/api/entrepreneur/campagnes/:id` | Détail d'une campagne |
| `apiCampagneLogementsStore(campagneId, logements)` | POST `.../campagnes/:id/logements` | Ajouter des logements |
| `apiCampagneLocatairesStore(campagneId, locataires)` | POST `.../campagnes/:id/locataires` | Ajouter des locataires |
| `apiCampagneLancerSelection(id)` | POST `.../campagnes/:id/lancer-selection` | Lancer l'algorithme de sélection | Vérifie `result.nbSelectionnes !== undefined` |
| `apiCampagneEnvoyerEmails(id)` | POST `.../campagnes/:id/envoyer-emails` | Envoyer les emails | Appel direct avec fetch (gère les erreurs avec message) |
| `apiCampagneRelancer(id, ids?)` | POST `.../campagnes/:id/relancer` | Relancer les non-répondants | Corps optionnel `{ ids }` pour filtrer |
| `apiCampagneEmailHistory(id)` | GET `.../campagnes/:id/emails` | Historique des emails | Retourne `result.emails` ou `[]` |
| `apiCampagneJoursSave(id, jours)` | PUT `.../campagnes/:id/jours-disponibles` | Enregistrer les jours dispo | Corps `{ jours }` |
| `apiCampagneJoursLoad(id)` | GET `.../campagnes/:id/jours-disponibles` | Charger les jours dispo | Retourne le tableau ou `[]` |

> **Questions — Section 8 : API frontend**
> 1. Comment le token JWT est-il stocké côté frontend ?
> 2. Que fait `apiFetch` automatiquement si la réponse est un 401 ?
> 3. Quelles sont les deux seules fonctions API qui n'utilisent pas l'authentification ?
> 4. Quel paramètre optionnel la fonction `apiCampagneRelancer` accepte-t-elle et à quoi sert-il ?

---

## 9. `backend/controllers/lienController.js` — Page publique RDV

| Fonction | Rôle | Détail technique |
|---|---|---|
| **`getLien`** | GET `/api/liens/:token` → infos locataire + jours dispo | 1. Recherche le `Locataire` par `token_acces` ; 2. Résout le `Logement` via `locataire_id` ; 3. Résout l'`Immeuble` et la `Campagne` liés ; 4. Charge les `JoursDisponible` de l'entrepreneur où `est_disponible: true`, triés par date croissante ; 5. Retourne `{ locataire: { nom, prenom }, campagne: { id, nom }, jours_disponibles: [...] }` |
| **`postCreneau`** | POST `/api/liens/:token/creneaux` → réserve un créneau | Valide le body avec `creneauSchema` (Joi) : `date_visite`, `heure_debut`, `heure_fin` requis + `heure_debut < heure_fin` ; vérifie que le locataire/logement/campagne existent ; empêche la double réservation (un seul créneau par logement/campagne) ; vérifie que la date est bien dans les `JoursDisponible` de l'entrepreneur ; détecte les chevauchements avec les créneaux existants via la fonction `chevauche(debut1, fin1, debut2, fin2)` qui compare les minutes (ex: `09:00` → 540 min) ; crée le `Creneau` avec `statut: 'reserve'` ; envoie un email de confirmation `templateConfirmation` au locataire si celui-ci a un email ; enregistre cet email dans `EmailEnvoye` |

### Fonctions utilitaires (exportées pour les tests)

| Fonction | Rôle |
|---|---|
| `timeToMinutes(t)` | Convertit `'09:00'` → `540` (heures × 60 + minutes) |
| `chevauche(debut1, fin1, debut2, fin2)` | `true` si les deux plages horaires se chevauchent (comparaison en minutes) |

> **Questions — Section 9 : Page publique RDV**
> 1. Par quel champ le locataire est-il identifié dans l'URL (`getLien`) ?
> 2. Quelles validations Joi sont appliquées sur le corps de `postCreneau` ?
> 3. Qu'est-ce qui empêche un locataire de réserver deux créneaux pour la même campagne ?
> 4. Comment la détection des chevauchements de créneaux fonctionne-t-elle ?
> 5. Quel email est envoyé après une réservation réussie ?

---

## 10. `backend/routes/campagneRoutes.js` — Toutes les routes campagne

| Méthode | URL | Contrôleur | Auth | Détail |
|---|---|---|---|---|
| POST | `/api/entrepreneur/campagnes` | `store` | Oui | Création de campagne |
| GET | `/api/entrepreneur/campagnes` | `index` | Oui | Liste des campagnes |
| GET | `/api/entrepreneur/campagnes/:id` | `show` | Oui | Détail d'une campagne |
| POST | `/:id/logements` | `logementController.storeBatch` | Oui | Ajout en masse de logements |
| PUT | `/:campagne_id/logements/:logement_id` | `logementController.update` | Oui | Modification d'un logement |
| DELETE | `/:campagne_id/logements/:logement_id` | `logementController.delete` | Oui | Suppression d'un logement |
| POST | `/:id/lancer-selection` | `lancerSelection` | Oui | Lancement de l'algorithme set cover |
| GET | `/:id/emails` | `listEmails` | Oui | Historique des emails (limité à 100, trié DESC par date) |
| POST | `/:id/locataires` | `locataireController.storeBatch` | Oui | Ajout en masse de locataires |
| POST | `/:id/envoyer-emails` | `envoyerEmails` | Oui | Envoi des emails différenciés |
| POST | `/:id/relancer` | `envoyerRelances` | Oui | Relance des non-répondants (filtrable par `ids[]`) |

> **Questions — Section 10 : Routes campagne**
> 1. Combien de routes sont définies dans `campagneRoutes.js` ?
> 2. Quelles sont les 3 opérations CRUD disponibles pour les logements ?
> 3. Quelle route permet de lancer l'algorithme set cover ?
> 4. Toutes les routes sont-elles protégées par l'authentification ?

---
## 11. Flux métier complet

```

[Frontend]                          [Backend]
   auth.js ──login──>        authController.login
                                ↓ jwt.sign() → token JWT
                                ↓ retourne { token, user }

   dashboard.js ──crée immeuble──>  immeubleController.create
                                ↓ INSERT Immeuble (avec id_entrepreneur)
   dashboard.js ──crée campagne──>  campagneController.store
                                ↓ Joi validation + vérif propriété immeuble
                                ↓ INSERT Campagne (statut: brouillon, dates: now et now+30j)
   detail.js ──ajoute logements──>  logementController.storeBatch
                                ↓ INSERT multiple Logement
   detail.js ──ajoute locataires──> locataireController.storeBatch
                                ↓ INSERT multiple Locataire avec token_acces unique
   detail.js ──lance sélection──>   campagneController.lancerSelection
                                ↓ setCoverService.lancerSelection(logements)
                                │   ├── construireCriteres() → Set des critères distincts
                                │   ├── selectionSetCover() → greedy : prend le logement
                                │   │   qui couvre le plus de critères restants
                                │   ├── calculerSeuilMinimal() → RG15 (0%, 10%, 5%)
                                │   └── completerJusquaSeuil() → ajoute par étage si nécessaire
                                ↓ UPDATE Logement SET selectionne_visite = true/false
                                ↓ UPDATE Campagne SET selection = { ... } (JSON)
   jours.js ──définit jours──>      campagneJoursController.remplacerJours
                                ↓ Remplace les JoursDisponible de l'entrepreneur
   detail.js ──envoie emails──>     campagneController.envoyerEmails
                                ↓ Pour chaque logement avec locataire.email :
                                │   ├── si selectionne_visite → templateVisiteProgrammee
                                │   └── sinon → templatePasDeVisite
                                ↓ sendMail() (SMTP ou console simulée)
                                ↓ INSERT EmailEnvoye (type, statut, erreur si échec)
   [Locataire reçoit le lien]
   rdv.js ──affiche infos──>       lienController.getLien
                                ↓ Résout token → locataire → logement → campagne
                                ↓ Retourne les jours_disponibles de l'entrepreneur
   rdv.js ──réservation──>          lienController.postCreneau
                                ↓ Joi validation + vérif double réservation
                                ↓ Vérif que la date est dans les jours dispo
                                ↓ Détection chevauchement (chevauche())
                                ↓ INSERT Creneau (statut: reserve)
                                ↓ sendMail(templateConfirmation) + EmailEnvoye
   detail.js ──relance──>           campagneController.envoyerRelances
                                ↓ Filtre logements selectionne_visite=true
                                ↓ Exclut ceux ayant déjà un créneau
                                ↓ Supporte filtre ids[] pour relance ciblée
                                ↓ sendMail(templateRelance) + EmailEnvoye
   planning.js ──affiche──>         (données déjà en BDD via Creneau)
                                ↓ GET /api/entrepreneur/campagnes → lecture directe
```

> **Questions — Section 11 : Flux métier complet**
> 1. Quel est l'ordre chronologique des 7 grandes étapes du flux ? (de la connexion au planning)
> 2. À quel moment les jours de disponibilité de l'entrepreneur sont-ils définis dans le flux ?
> 3. Quelle différence y a-t-il entre l'email envoyé à un logement sélectionné vs non sélectionné ?
> 4. Que se passe-t-il si un locataire sélectionné ne réserve jamais de créneau ?
> 5. Où le locataire reçoit-il le lien pour réserver son créneau ?
