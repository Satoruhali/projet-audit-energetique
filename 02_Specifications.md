# 2. Dossier de Conception – Application de Planification d’Audits Énergétiques

**Version :** 1.0 — 18/05/2026

---

## 2.1 Spécifications Fonctionnelles

| ID | Fonctionnalité | Description | Priorité |
|---|---|---|---|
| F1 | Fixer une amplitude de dates | L'entrepreneur choisit une date de début et une date de fin pour la campagne de visites | À définir |
| F2 | Saisie des disponibilités | Chaque locataire peut renseigner ses créneaux libres sur la période choisie | À définir |
| F3 | Ordonnancement par étage | L'application trie les visites par étage croissant (RDC → dernier étage) pour un enchaînement optimal | À définir |
| F4 | Consultation du planning | L'entrepreneur visualise le planning final généré | À définir |

*D'autres fonctionnalités seront ajoutées au fil des décisions.*

## 2.2 Spécifications Techniques

| Aspect | Choix | Statut |
|---|---|---|
| **Frontend** | HTML, CSS, JavaScript vanilla | ✅ Décidé |
| **Backend** | Node.js + Express | ✅ Décidé |
| **Base de données** | SQL (MySQL ou SQLite) | ✅ Décidé |
| **Algorithme** | Best fit temporel (JavaScript côté serveur) | ✅ Décidé |
| **Hébergement** | À définir (local en développement) | 🟡 En réflexion |
| **Authentification** | À définir (peut-être pas nécessaire en V1) | 🟡 En réflexion |
| **Responsive** | Oui (CSS media queries) | ✅ Décidé |

### Justification des choix techniques

| Choix | Justification |
|---|---|
| **HTML / CSS / JS vanilla** | Application de taille modeste, pas besoin d'un framework lourd ; temps de chargement minimal, maintenabilité simple pour un développeur unique |
| **Node.js + Express** | Léger, rapide à mettre en place, idéal pour une API REST ; même langage (JavaScript) côté client et serveur facilite la maintenance |
| **SQL (MySQL / SQLite)** | Données structurées (campagnes, disponibilités, planning) avec relations claires ; SQLite parfait pour le développement local, MySQL pour la mise en production |
| **Best fit temporel** | Algorithme sur mesure qui place chaque visite au premier créneau compatible (disponibilité locataire + créneau libre entrepreneur) en respectant l'ordre par étage |
| **Responsive (media queries)** | L'application doit être utilisable sur mobile par les locataires et sur desktop par l'entrepreneur ; le CSS vanilla avec media queries suffit pour une interface simple |

---

## 2.3 Personas

### Persona 1 — Antoine, l'entrepreneur pressé

| Champ | Valeur |
|---|---|
| **Âge** | 34 ans |
| **Profession** | Auto-entrepreneur en audits énergétiques |
| **Situation** | Travaille seul, réalise des campagnes de visites dans des immeubles collectifs |
| **Objectif principal** | Gagner du temps dans l'organisation des tournées et éviter les allers-retours entre les étages |
| **Frustrations** | Perd des heures à échanger par SMS avec les locataires pour caler les rendez-vous ; doit réorganiser manuellement quand un créneau est refusé |
| **Compétences tech** | Bonne maîtrise des outils du quotidien (mail, calendrier, smartphone) mais pas développeur |
| **Équipement** | Smartphone Android + ordinateur portable |

### Persona 2 — Mme Dubois, locataire active

| Champ | Valeur |
|---|---|
| **Âge** | 45 ans |
| **Profession** | Infirmière en horaires décalés |
| **Situation** | Vit en appartement dans un immeuble de 12 étages, travaille en 12h (jour/nuit) |
| **Objectif principal** | Pouvoir donner ses disponibilités simplement, sans appel téléphonique |
| **Frustrations** | Disponibilités complexes à expliquer par SMS ; peur de rater le créneau attribué et de devoir tout reprogrammer |
| **Compétences tech** | À l'aise avec les formulaires en ligne, utilise son smartphone au quotidien |
| **Équipement** | Smartphone uniquement (iOS) |

### Persona 3 — M. Lefèvre, locataire senior

| Champ | Valeur |
|---|---|
| **Âge** | 72 ans |
| **Profession** | Retraité |
| **Situation** | Vit dans son appartement depuis 30 ans, disponible la plupart du temps |
| **Objectif principal** | Pouvoir choisir un créneau facilement, sans confusion |
| **Frustrations** | Interfaces trop petites ou compliquées ; a peur de "faire une erreur" en cliquant |
| **Compétences tech** | Utilise principalement un ordinateur fixe, navigation simple (mail, lecture d'articles) |
| **Équipement** | Ordinateur fixe sous Windows |

---

## 2.4 User Stories

| ID | En tant que… | Je veux… | Afin de… | Priorité |
|---|---|---|---|---|
| US1 | Entrepreneur | fixer une date de début et une date de fin pour ma campagne de visites | que les locataires sachent sur quelle période donner leurs disponibilités | Haute |
| US2 | Locataire | recevoir un lien pour saisir mes disponibilités | ne pas avoir à téléphoner ou échanger des SMS interminables | Haute |
| US3 | Locataire | sélectionner mes créneaux libres dans un calendrier simple | indiquer précisément quand je suis disponible | Haute |
| US4 | Entrepreneur | visualiser le planning optimisé trié par étage | enchaîner les visites sans faire d'allers-retours inutiles | Haute |
| US5 | Entrepreneur | être notifié si un locataire n'a pas encore répondu | relancer uniquement les personnes nécessaires | Moyenne |
| US6 | Entrepreneur | modifier manuellement un créneau attribué | gérer les cas particuliers ou les imprévus | Moyenne |
| US7 | Locataire | recevoir un rappel de mon créneau 48h puis 24h avant | ne pas oublier le rendez-vous | Moyenne |
| US8 | Locataire | signaler un changement de disponibilité après avoir déjà répondu | mettre à jour ma plage horaire en cas d'imprévu | Basse |
| US9 | Entrepreneur | exporter le planning au format PDF ou iCal | l'imprimer ou l'intégrer à mon calendrier personnel | Basse |
| US10 | Locataire | accéder au formulaire sans créer de compte | ne pas avoir à m'inscrire pour une simple visite | Haute |

---

## 2.5 Wireframes (maquettes texte / ASCII)

### Écran 1 – Configuration de la campagne (entrepreneur)

```
 ┌────────────────────────────────────────────┐
 │  Nouvelle campagne de visites              │
 │                                            │
 │  Adresse de l'immeuble                    │
 │  ┌──────────────────────────────────────┐ │
 │  │  12 Rue des Lilas, Paris 75011       │ │
 │  └──────────────────────────────────────┘ │
 │                                            │
 │  Date de début       Date de fin          │
 │  ┌────────────┐     ┌────────────┐        │
 │  │ 10/03/2026 │     │ 20/03/2026 │        │
 │  └────────────┘     └────────────┘        │
 │                                            │
 │  Nombre d'appartements : [  25  ]         │
 │                                            │
 │  [Générer les liens d'invitation]          │
 │                                            │
 └────────────────────────────────────────────┘
```

### Écran 2 – Saisie des disponibilités (locataire)

```
 ┌────────────────────────────────────────────┐
 │  Saisie de vos disponibilités              │
 │                                            │
 │  Campagne du 10/03/2026 au 20/03/2026     │
 │  Appartement : 3e étage, porte 32          │
 │                                            │
 │  Cochez vos créneaux libres :              │
 │                                            │
 │  ┌─────┬──────┬──────┬──────┬──────┐       │
 │  │     │  Lun │  Mar │  Mer │  Jeu │  ... │
 │  ├─────┼──────┼──────┼──────┼──────┤       │
 │  │ 8h  │  ☐   │  ☐   │  ☐   │  ☐   │       │
 │  │ 9h  │  ☐   │  ☐   │  ☐   │  ☑   │       │
 │  │ 10h │  ☐   │  ☐   │  ☑   │  ☑   │       │
 │  │ 11h │  ☐   │  ☐   │  ☑   │  ☑   │       │
 │  │ 12h │  ☐   │  ☐   │  ☐   │  ☐   │       │
 │  │ 13h │  ☐   │  ☐   │  ☐   │  ☐   │       │
 │  │ 14h │  ☐   │  ☑   │  ☐   │  ☐   │       │
 │  │ 15h │  ☐   │  ☑   │  ☐   │  ☐   │       │
 │  │ 16h │  ☐   │  ☑   │  ☐   │  ☐   │       │
 │  │ 17h │  ☐   │  ☐   │  ☐   │  ☐   │       │
 │  └─────┴──────┴──────┴──────┴──────┘       │
 │                                            │
 │  [Valider mes disponibilités]              │
 │                                            │
 └────────────────────────────────────────────┘
```

### Écran 3 – Planning final (entrepreneur)

```
 ┌────────────────────────────────────────────┐
 │  Planning – Immeuble 12 Rue des Lilas      │
 │  Campagne du 10/03/2026 au 20/03/2026     │
 │                                            │
 │  ┌────────────┬────────────┬────────────┐  │
 │  │  Date      │  Créneau   │  Logement  │  │
 │  ├────────────┼────────────┼────────────┤  │
 │  │  Lun 10/03 │  09h-10h   │  RDC - A1  │  │
 │  │  Lun 10/03 │  10h-11h   │  RDC - A2  │  │
 │  │  Lun 10/03 │  11h-12h   │  1er - B3  │  │
 │  │  Lun 10/03 │  14h-15h   │  1er - B4  │  │
 │  │  Mar 11/03 │  09h-10h   │  2e  - C5  │  │
 │  │  Mar 11/03 │  10h-11h   │  2e  - C6  │  │
 │  │  ...       │  ...       │  ...       │  │
 │  └────────────┴────────────┴────────────┘  │
 │                                            │
 │  [Exporter PDF] [Exporter iCal]            │
 │                                            │
 └────────────────────────────────────────────┘
```

---

## 2.6 Parcours Utilisateur

### Parcours principal — Campagne complète

```
 ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 │  1.      │    │  2.      │    │  3.      │    │  4.      │
 │ Antoine  │───→│ Antoine  │───→│ Chaque   │───→│ Antoine  │
 │ crée une │    │ partage  │    │ locataire│    │ consulte │
 │ campagne │    │ les liens│    │ saisit   │    │ le       │
 │ (dates + │    │ par email│    │ ses      │    │ planning │
 │ adresse) │    │ ou SMS   │    │ créneaux │    │ final    │
 └──────────┘    └──────────┘    └──────────┘    └──────────┘
                      │                                │
                      │                                ▼
                      │                        ┌──────────┐
                      │                        │  5.      │
                      ├────────────────────────│ Antoine  │
                      │ (si relance nécessaire)│ relance  │
                      │                        │ les      │
                      │                        │ retard.  │
                      │                        └──────────┘
                      │                                │
                      ▼                                ▼
              ┌──────────────┐                ┌──────────────────┐
              │  6.          │                │  7.              │
              │ Locataire    │                │ Antoine exporte  │
              │ reçoit un    │                │ le planning en   │
              │ rappel 48h   │                │ PDF / iCal       │
              │ avant la     │                │                  │
              │ visite       │                └──────────────────┘
              └──────────────┘
```

### Parcours secondaire — Modification de dernière minute

```
 ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
 │ Locataire  │───→│ Antoine    │───→│ Antoine    │───→│ Locataire  │
 │ contacte   │    │ consulte   │    │ modifie le │    │ reçoit une │
 │ Antoine    │    │ le planning│    │ créneau    │    │ confirma-  │
 │ (imprévu)  │    │ actuel     │    │ manuellement│   │ tion       │
 └────────────┘    └────────────┘    └────────────┘    └────────────┘
```

---

## 2.7 Cas d'Utilisation

### Diagramme textuel des cas d'utilisation

```
                     ┌───────────────────────────────┐
                     │    Application de planification│
                     │    d'audits énergétiques        │
                     │                                 │
 ┌──────────┐        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC1 : Créer une      │       │
 │ Antoine  │        │  │ campagne de visites  │       │
 │(Entrepr.)│        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC2 : Générer et     │       │
 │          │        │  │ envoyer les liens    │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC3 : Consulter le   │       │
 │          │        │  │ planning optimisé    │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC4 : Modifier un    │       │
 │          │        │  │ créneau manuellement │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC5 : Exporter le    │       │
 │          │        │  │ planning             │       │
 │          │        │  └─────────────────────┘       │
 └──────────┘        │                                 │
                      │                                 │
 ┌──────────┐        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC6 : Saisir ses     │       │
 │ Locataire│        │  │ disponibilités       │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC7 : Recevoir un    │       │
 │          │        │  │ rappel de créneau    │       │
 │          │        │  └─────────────────────┘       │
 └──────────┘        │  ┌─────────────────────┐       │
                      │  │ UC8 : Modifier ses   │       │
                      │  │ disponibilités      │       │
                      │  └─────────────────────┘       │
                      └───────────────────────────────┘
```

### Descriptions détaillées

**UC1 — Créer une campagne de visites**
| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | L'entrepreneur est connecté |
| **Scénario nominal** | 1. Saisir l'adresse de l'immeuble ; 2. Définir la date de début et de fin ; 3. Indiquer le nombre d'appartements ; 4. Valider la campagne |
| **Postcondition** | La campagne est créée et prête à générer des liens |

**UC2 — Générer et envoyer les liens**
| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Une campagne existe |
| **Scénario nominal** | 1. L'application génère un lien unique par appartement ; 2. L'entrepreneur choisit d'envoyer par email ou SMS ; 3. Les locataires reçoivent leur lien |
| **Postcondition** | Les liens sont envoyés |

**UC3 — Consulter le planning optimisé**
| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Tous les locataires ont répondu (ou délai dépassé) |
| **Scénario nominal** | 1. L'application calcule le planning ; 2. Les créneaux sont triés par étage et par date ; 3. L'entrepreneur visualise le tableau |
| **Postcondition** | Le planning est affiché |

**UC6 — Saisir ses disponibilités**
| Champ | Valeur |
|---|---|
| **Acteur** | Locataire |
| **Précondition** | Le locataire a reçu un lien valide |
| **Scénario nominal** | 1. Le locataire clique sur le lien ; 2. Il coche les créneaux qui lui conviennent ; 3. Il valide |
| **Postcondition** | Les disponibilités sont enregistrées sans création de compte |

---

## 2.8 Règles de Gestion

| ID | Règle | Description |
|---|---|---|
| RG1 | Demi-heure minimum | Chaque créneau de visite dure au minimum 30 minutes |
| RG2 | Un logement = une visite | Un appartement ne peut être visité qu'une seule fois par campagne |
| RG3 | Ordre par étage | L'ordonnancement trie les visites par étage croissant (RDC → dernier étage) avant de trier par date |
| RG4 | Pas de chevauchement | L'entrepreneur ne peut pas avoir deux visites en même temps (même étage ou non) |
| RG5 | Lien unique et sécurisé | Chaque locataire reçoit un lien unique (token) lié à son seul appartement ; il ne voit que ses propres informations |
| RG6 | Confidentialité | Un locataire ne voit jamais les disponibilités ou le créneau attribué d'un autre locataire |
| RG7 | Délai de réponse | Si un locataire n'a pas répondu 48h avant la date de fin de la campagne, l'entrepreneur est notifié pour relance |
| RG8 | Rappel automatique | Les locataires reçoivent un rappel 48h et 24h avant leur créneau attribué |
| RG9 | Pause entre visites | Un intervalle minimum de 15 minutes est réservé entre deux visites consécutives pour le déplacement |
| RG10 | Non-réponse = absence | Tout locataire n'ayant pas répondu dans les délais est marqué "Non disponible" et n'apparaît pas dans le planning |

---

## 2.9 Glossaire

| Terme | Définition |
|---|---|
| **Campagne de visites** | Période définie (date de début → date de fin) durant laquelle l'entrepreneur réalise les audits d'un immeuble |
| **Créneau** | Intervalle de temps (ex : 10h00 – 10h30) attribué à la visite d'un logement |
| **Disponibilités** | Ensemble des créneaux qu'un locataire a indiqués comme libres |
| **Ordonnancement** | Algorithme de tri des visites par étage croissant puis par date/heure |
| **Token / Lien unique** | URL sécurisée et non devinable envoyée à chaque locataire, permettant d'accéder au formulaire sans mot de passe |
| **Planning optimisé** | Tableau final des visites classées par ordre de passage effectif |
| **RDC** | Rez-de-chaussée, point de départ de l'ordonnancement des étages |
| **Relance** | Notification adressée à un locataire n'ayant pas encore saisi ses disponibilités |
| **Audit énergétique** | Diagnostic de performance énergétique (DPE) d'un logement |
| **Visite** | Passage physique de l'entrepreneur dans un appartement pour réaliser l'audit |

---

