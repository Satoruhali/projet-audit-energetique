# 3. Journal de Bord

**Version :** 1.0 — 18/05/2026

---

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
