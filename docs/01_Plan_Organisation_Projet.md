# 1. Plan d'Organisation de Projet

**Projet :** Planif'Audit — Application de planification de visites pour audit énergétique  
**Version :** 3.0 — Juin 2026  
**Auteur :** Wassi

---

## 1. État des lieux

### Séances réalisées

| Séance | Date | Objet |
|--------|------|-------|
| 1–10 | 18–20/05 | Création initiale : specs, frontend v1, schéma BDD, structure projet |
| 11+ | 21/05–05/06 | Backend complet (auth JWT, CRUD, set cover, jours dispo, liens RDV, emails), frontend modulaire (8 pages, 8 modules JS), tests (40 tests), documentation technique |

### Avancement global estimé

| Lot | Statut | % estimé |
|-----|--------|----------|
| Spécifications / Conception | ✅ Terminé | 100 % |
| Frontend (HTML/CSS/JS modulaire) | ✅ Terminé (8 pages, 8 modules JS, API réelle + fallback mock) | 100 % |
| Backend (API Node.js + Express) | ✅ Terminé (auth JWT, CRUD, set cover, jours dispo, liens RDV) | 100 % |
| Base de données MongoDB (Mongoose) | ✅ Terminé (6 collections, opérationnel) | 100 % |
| Algorithme set cover (RG11–RG15) | ✅ Terminé (service intégré + démo standalone) | 100 % |
| Tests automatisés | ✅ 40 tests (unitaires + intégration) | 100 % |
| Base de données MariaDB (cible future) | ⬜ Schéma défini, migration à faire | 50 % |
| Module emails (nodemailer) | ⬜ Installé, simulation console uniquement | 50 % |
| Planning optimisé (tri étage, pause) | ⬜ Logique frontend existante, backend à faire | 40 % |
| Déploiement | ⬜ Non commencé | 0 % |

---

## 2. Structure recommandée du projet

```
C:\Users\wassi\projet-audit-energetique\
│
├── frontend\                       # Application cliente (SPA)
│   ├── index.html                  # Point d'entrée (redirige)
│   ├── auth.html                   # Connexion / inscription
│   ├── dashboard.html              # Tableau de bord
│   ├── detail.html                 # Détail campagne
│   ├── planning.html               # Planning optimisé
│   ├── jours.html                  # Jours disponibles
│   ├── rdv.html                    # Page publique RDV
│   ├── css/
│   │   └── style.css               # Styles responsive
│   └── js/
│       ├── api.js                  # Wrapper fetch + JWT + fallback mock
│       ├── utils.js                # Utilitaires (dates, toasts)
│       ├── auth.js                 # Auth (login/register)
│       ├── dashboard.js            # Tableau de bord
│       ├── detail.js               # Détail campagne
│       ├── planning.js             # Planning optimisé
│       ├── jours.js                # Jours disponibles
│       └── rdv.js                  # Réservation publique
│
├── backend\                        # API REST (Express)
│   ├── server.js                   # Point d'entrée
│   ├── app.js                      # Middleware + routes
│   ├── middlewares/
│   │   ├── auth.js                 # JWT
│   │   └── errorHandler.js         # Gestion erreurs
│   ├── models/
│   │   ├── Entrepreneur.js         # Mongoose
│   │   ├── Immeuble.js
│   │   ├── Campagne.js
│   │   ├── Logement.js
│   │   ├── Locataire.js
│   │   └── Creneau.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── immeubleController.js
│   │   ├── campagneController.js
│   │   ├── logementController.js
│   │   ├── locataireController.js
│   │   ├── campagneJoursController.js
│   │   ├── referentielController.js
│   │   └── lienController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── immeubleRoutes.js
│   │   ├── campagneRoutes.js
│   │   ├── campagneJoursRoutes.js
│   │   ├── referentielRoutes.js
│   │   └── lienRoutes.js
│   ├── services/
│   │   └── setCoverService.js      # Algorithme set cover
│   ├── validations/                # Schémas Joi
│   │   ├── campagne.js
│   │   ├── campagneJours.js
│   │   ├── immeuble.js
│   │   ├── logement.js
│   │   └── lien.js
│   ├── tests/
│   │   └── lien.test.js            # 22 tests
│   ├── seed.js                     # Initialisation données
│   ├── check_all.js                # Vérification
│   └── check_campaign.js
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
├── Agent.ia/                       # Configuration OpenCode
├── exemple-set-cover.js            # Démo algorithme
├── exemple-set-cover.test.js       # 18 tests set cover
├── testdb.sql                      # Script SQL MariaDB (cible future)
├── ANALYSE_PROJET.md               # Analyse complète
├── package.json                    # Dépendances
├── .env                            # Variables d'environnement
└── .gitignore                      # Ignorés
```

---

## 3. Checklist des tâches restantes

### ✅ Phase A — Backend (API REST) — TERMINÉE

| # | Tâche | Statut |
|---|-------|--------|
| A1 | Initialiser le projet Node.js (`npm init`, `package.json`) | ✅ Fait |
| A2 | Installer les dépendances | ✅ Fait |
| A3 | Créer la configuration de connexion | ✅ Fait (MongoDB via Mongoose) |
| A4 | Mettre à jour le script SQL final | ✅ Fait (`testdb.sql`, 10 tables) |
| A5 | Créer les modèles | ✅ Fait (6 modèles Mongoose) |
| A6 | Créer les routes et controllers REST | ✅ Fait (8 contrôleurs, 6 routeurs) |
| A7 | Implémenter l'authentification JWT | ✅ Fait (bcrypt + jsonwebtoken) |
| A8 | Implémenter la validation des entrées | ✅ Fait (Joi, 5 schémas) |
| A9 | Créer le point d'entrée `server.js` | ✅ Fait |
| A10 | Tester les endpoints | ✅ Fait (22 tests API) |

### ✅ Phase B — Connexion Frontend / Backend — TERMINÉE

| # | Tâche | Statut |
|---|-------|--------|
| B1 | Remplacer les mock data par des appels fetch à l'API | ✅ Fait (api.js avec fallback mock) |
| B2 | Gérer les états de chargement et les erreurs API | ✅ Fait |
| B3 | Ajouter un formulaire de connexion | ✅ Fait (auth.html + auth.js) |
| B4 | Implémenter la persistance des sessions (token JWT localStorage) | ✅ Fait |

### ✅ Phase C — Tests — TERMINÉE

| # | Tâche | Statut |
|---|-------|--------|
| C1 | Écrire des tests d'intégration backend | ✅ Fait (22 tests lien.test.js) |
| C2 | Tester l'algorithme set cover | ✅ Fait (18 tests exemple-set-cover.test.js) |
| C3 | Tester les contraintes (chevauchement, timeToMinutes) | ✅ Fait (11 tests unitaires) |
| C4 | Compatibilité mobile | ✅ Fait (CSS responsive, breakpoints) |

### Phase D — Documentation

| # | Tâche | Priorité | Durée estimée | Statut |
|---|-------|----------|---------------|--------|
| D1 | Alimenter `05_Documentation_Technique.md` (architecture, modèle de données, guide d'installation, déploiement) | Haute | 2h | ✅ Fait |
| D2 | Compléter `04_Suivi_Modifications.md` avec l'historique | Moyenne | 30 min | ⬜ À faire |
| D3 | Mettre à jour `TODO_LIST.md` | Basse | 15 min | ⬜ À faire |
| D4 | Rédiger un README.md à la racine du projet | Moyenne | 1h | ⬜ À faire |

### Phase E — Échantillonnage réglementaire (NOUVEAU)

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| E1 | **[AJOUT]** Mettre à jour le schéma BDD : ajouter tables `typologies`, `types_plancher_bas`, `types_plancher_haut`, colonnes associées aux logements | Haute | 1h |
| E2 | **[AJOUT]** Implémenter l'algorithme de sélection des logements (set cover / combinaison optimale) côté backend | Haute | 3h |
| E3 | **[AJOUT]** Créer l'interface de saisie des critères de l'immeuble (typologies, planchers) | Haute | 2h |
| E4 | **[AJOUT]** Créer l'interface d'affichage du résultat avec statut complet/incomplet | Haute | 1h30 |
| E5 | **[AJOUT]** Implémenter la sélection des jours disponibles du diagnostiqueur | Haute | 1h |
| E6 | **[AJOUT]** Filtrer le calendrier des occupants selon les jours disponibles | Haute | 1h30 |
| E7 | **[AJOUT]** Implémenter le croisement disponibilités → planning final | Haute | 2h |
| E8 | **[AJOUT]** Créer le module d'envoi d'emails différenciés (visité / non visité) | Moyenne | 2h |
| E9 | **[AJOUT]** Ajouter la prévisualisation des emails avant envoi | Moyenne | 1h |
| E10 | **[AJOUT]** Tester les contraintes d'échantillonnage (RG11–RG17) | Haute | 2h |

### Phase F — Fonctionnalités avancées

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| F1 | Portail locataire (page publique pour choisir un créneau) | Moyenne | 3h |
| F2 | Envoi d'emails d'invitation (nodemailer) | Basse | 2h |
| F3 | Import CSV des locataires | Basse | 2h |
| F4 | Export du planning en PDF | Basse | 2h |
| F5 | Dashboard avec statistiques réelles (au lieu des mock data) | Moyenne | 1h30 |

### Phase F — Déploiement

| # | Tâche | Priorité | Durée estimée |
|---|-------|----------|---------------|
| F1 | Préparer le `.env` et le `gitignore` | Haute | 15 min |
| F2 | Configurer un environnement de production (hébergement, base de données distante) | Basse | 2h |
| F3 | Mettre en place HTTPS et variables d'environnement | Basse | 1h |
| F4 | Déployer l'application (Render / Railway / VPS) | Basse | 2h |

---

## 4. Calendrier — état réel vs restant

### Phases terminées (100 %)

| Phase | Contenu |
|-------|---------|
| **A — Backend** | API REST complète (auth, CRUD, set cover, jours dispo, liens RDV) |
| **B — Frontend/API** | Frontend modulaire (8 pages, 8 modules JS) connecté aux API réelles |
| **C — Tests** | 40 tests (set cover, réservation créneaux, timeToMinutes, chevauchement) |

### Phases restantes

| Phase | Séances estimées | Priorité |
|-------|------------------|----------|
| **D — Documentation** | 1 séance | Haute |
| **E — Échantillonnage avancé** | 2 séances | Haute |
| **F — Déploiement + finalisation** | 2 séances | Moyenne |

---

## 5. Livrables intermédiaires et finaux

| Livrable | Format | Statut |
|----------|--------|--------|
| Cahier des charges / Spécifications | Markdown (`specifications/*.md`) | ✅ Livré |
| Maquettes (wireframes) | ASCII dans Markdown | ✅ Livré |
| Frontend v1 (mock data) | HTML/CSS/JS | ✅ Livré |
| Frontend v2 (modulaire, 8 pages, API réelle) | `frontend/` (HTML/CSS/JS) | ✅ Livré |
| Backend API REST complet | Node.js / Express (`backend/`) | ✅ Livré |
| Algorithme de sélection set cover | `services/setCoverService.js` | ✅ Livré |
| Module jours disponibles diagnostiqueur | Backend + Frontend | ✅ Livré |
| Portail locataire (RDV public) | `rdv.html` + `rdv.js` | ✅ Livré |
| Tests automatisés (40 tests) | `node:test` + supertest | ✅ Livré |
| Schéma BDD MongoDB | 6 collections Mongoose | ✅ Livré |
| Schéma BDD MariaDB (cible) | `testdb.sql` (10 tables) | ✅ Livré |
| Documentation technique | `docs/05_Documentation_Technique.md` | ✅ Livré |
| Module d'envoi d'emails différenciés | nodemailer | ⬜ Simulation console |
| Planning optimisé (backend) | Algorithme de planification | ⬜ À faire |
| Application déployée | URL accessible | ⬜ À faire |

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
| **MongoDB vs MariaDB** : le backend tourne sur MongoDB, la cible est MariaDB — la migration devra être planifiée | Moyen | Moyenne | Garder une couche d'abstraction dans les modèles ; `testdb.sql` déjà prêt |
| **Planning optimisé non backendé** : la logique RG3/RG4/RG9 existe dans le frontend mais pas encore en API | Moyen | Haute | Implémenter le endpoint de génération de planning côté backend |
| **nodemailer en simulation** : les emails sont loggés dans la console, pas encore envoyés | Faible | Haute | Brancher SMTP via `.env` et finaliser les templates |
| **Tests de bout en bout** : pas de test E2E automatisé (parcours complet) | Moyen | Moyenne | Ajouter des tests d'intégration multipoints |
| **Déploiement non fait** : l'application tourne uniquement en local | Élevé | Haute | Préparer le déploiement (Render/Railway, MongoDB Atlas, HTTPS) |
| **Sécurité** : clés JWT/SMTP dans `.env` déjà géré | Faible | Faible | Vérifier que `.env` est bien dans `.gitignore` |

---

## 8. Prochaines actions immédiates

**Priorité n°1 :** Génération du planning optimisé (backend).
- Implémenter l'algorithme de planification (tri étage RG3, pause 15 min RG9, pas chevauchement RG4)
- Créer un endpoint `POST /api/entrepreneur/campagnes/:id/generer-planning`
- Retourner le planning ordonné avec les créneaux définitifs

**Priorité n°2 :** Brancher l'envoi d'emails réel (nodemailer).
- Configurer SMTP dans `.env`
- Remplacer `console.log` par un envoi réel
- Gérer les templates d'emails différenciés (visité / non visité)

**Priorité n°3 :** Déploiement.
- Choisir un hébergeur (Render / Railway / VPS)
- Configurer MongoDB en production (MongoDB Atlas)
- Mettre en place HTTPS

---

*Plan généré le 21/05/2026 à partir du journal de bord (10 séances).*
