# 2. Dossier de Conception – Application de Planification d’Audits Énergétiques

**Version :** 2.0 — 21/05/2026

---

## 2.1 Spécifications Fonctionnelles

| ID | Fonctionnalité | Description | Priorité |
|---|---|---|---|
| F1 | Fixer une amplitude de dates | L'entrepreneur choisit une date de début et une date de fin pour la campagne de visites | À définir |
| F2 | Saisie des disponibilités | Chaque locataire peut renseigner ses créneaux libres sur la période choisie | À définir |
| F3 | Ordonnancement par étage | L'application trie les visites par étage croissant (RDC → dernier étage) pour un enchaînement optimal | À définir |
| F4 | Consultation du planning | L'entrepreneur visualise le planning final généré | À définir |
| **F5** | **[AJOUT]** Configuration des critères de l'immeuble | Le diagnostiqueur saisit les typologies présentes (T1–T6) et les types de plancher bas/haut de l'immeuble | Haute |
| **F6** | **[AJOUT]** Algorithme de sélection des logements | L'application calcule la meilleure combinaison de logements couvrant tous les critères d'échantillonnage (RG11–RG15) avec le moins de visites possible | Haute |
| **F7** | **[AJOUT]** Affichage du statut d'échantillonnage | L'application affiche "Échantillonnage complet" ou "Incomplet" avec le détail des critères manquants | Haute |
| **F8** | **[AJOUT]** Sélection des jours disponibles (diagnostiqueur) | Le diagnostiqueur choisit ses jours disponibles avant l'invitation des occupants | Haute |
| **F9** | **[AJOUT]** Croisement disponibilités | Le planning final croise les logements sélectionnés avec les créneaux des occupants (filtrés par jours disponibles du diagnostiqueur) | Haute |
| **F10** | **[AJOUT]** Envoi d'emails différenciés | Envoi automatique d'email d'information (non visité) ou email avec créneau + coordonnées (visité) | Moyenne |

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

### [AJOUT] Persona 4 — Sarah, la diagnostiqueuse réglementaire

| Champ | Valeur |
|---|---|
| **Âge** | 29 ans |
| **Profession** | Diagnostiqueuse DPE certifiée, salariée dans un bureau d'études |
| **Situation** | Réalise des audits collectifs dans des immeubles de 30 à 200+ logements ; doit respecter la réglementation d'échantillonnage |
| **Objectif principal** | Couvrir tous les critères réglementaires (typologies, planchers) avec un minimum de visites pour optimiser son temps |
| **Frustrations** | Doit vérifier manuellement qu'elle a bien visité chaque type de logement ; craint les contrôles si l'échantillon est incomplet |
| **Compétences tech** | Bonne maîtrise des outils métier (tableurs, logiciels DPE) mais pas développeuse |
| **Équipement** | Ordinateur portable + tablette pour les visites terrain |

### [AJOUT] Persona 5 — M. Camara, occupant en immeuble complexe

| Champ | Valeur |
|---|---|
| **Âge** | 38 ans |
| **Profession** | Commerçant, tient une boutique au RDC de son immeuble |
| **Situation** | Vit dans un T4 au 3e étage ; son logement est au-dessus d'un local commercial (plancher bas : sur local commercial) et sous des combles perdus (plancher haut : combles perdus) |
| **Objectif principal** | Être informé si son logement est sélectionné pour la visite, et pouvoir donner ses disponibilités simplement |
| **Frustrations** | A déjà eu des diagnostics où le diagnostiqueur ne pouvait pas accéder à son logement faute de créneau compatible ; ne savait pas si son logement serait visité ou non |
| **Compétences tech** | À l'aise avec le mail et les formulaires en ligne, utilise son smartphone au quotidien |
| **Équipement** | Smartphone Android + ordinateur au magasin |

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
| **US11** | **[AJOUT]** Diagnostiqueur | sélectionner mes jours disponibles avant d'inviter les occupants | que les occupants ne proposent que des créneaux compatibles avec mon agenda | Haute |
| **US12** | **[AJOUT]** Diagnostiqueur | déclarer les typologies présentes (T1–T6) et les types de plancher bas/haut de l'immeuble | que l'algorithme calcule l'échantillonnage obligatoire | Haute |
| **US13** | **[AJOUT]** Diagnostiqueur | lancer l'algorithme de sélection des logements à visiter | obtenir la meilleure combinaison possible couvrant tous les critères avec le moins de visites | Haute |
| **US14** | **[AJOUT]** Diagnostiqueur | voir si l'échantillonnage est complet ou incomplet (avec le détail des critères manquants) | savoir s'il faut ajuster manuellement la sélection | Haute |
| **US15** | **[AJOUT]** Diagnostiqueur | envoyer des emails différenciés (visité / non visité) aux occupants | communiquer le bon message à chaque occupant | Moyenne |
| **US16** | **[AJOUT]** Diagnostiqueur | prévisualiser les emails avant envoi | vérifier le contenu avant d'envoyer | Moyenne |
| **US17** | **[AJOUT]** Occupant | donner mes disponibilités uniquement sur les jours choisis par le diagnostiqueur | ne pas proposer des créneaux où il n'est pas disponible | Haute |
| **US18** | **[AJOUT]** Occupant | recevoir un email adapté à mon statut (visité ou non visité) | savoir si je dois préparer ma visite ou simplement être informé | Haute |

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

### [AJOUT] Écran 4 – Configuration de l'immeuble (diagnostiqueur)

Saisie des critères pour l'algorithme d'échantillonnage.

```
 ┌────────────────────────────────────────────┐
 │  Configuration de l'immeuble               │
 │  Adresse : 12 Rue des Lilas, Paris 75011   │
 │                                            │
 │  Typologies présentes :                    │
 │  ☑ T1  ☑ T2  ☑ T3  ☑ T4  ☐ T5  ☐ T6     │
 │                                            │
 │  Types de plancher bas :                   │
 │  ☑ Terre-plein  ☑ Vide-sanitaire           │
 │  ☐ Sur local    ☐ Garage    ☑ Autre       │
 │                                            │
 │  Types de plancher haut :                  │
 │  ☑ Combles perdus  ☐ Combles aménagés      │
 │  ☑ Toiture terrasse  ☐ Extérieur           │
 │                                            │
 │  [Enregistrer]    [Lancer la sélection]    │
 └────────────────────────────────────────────┘
```

### [AJOUT] Écran 5 – Résultat de l'algorithme de sélection

```
 ┌────────────────────────────────────────────┐
 │  Résultat de la sélection                  │
 │  12 Rue des Lilas — 45 logements           │
 │                                            │
 │  🔴 ÉCHANTILLONNAGE INCOMPLET              │
 │  Manque : T5, plancher bas: garage         │
 │                                            │
 │  Sélectionnés : 7 / 10 minimum requis      │
 │  ┌──────┬──────┬───────────┬──────────┐   │
 │  │ Logt │ Typo │ Pl. bas   │ Pl. haut │   │
 │  ├──────┼──────┼───────────┼──────────┤   │
 │  │ A1   │ T2   │Terre-plein│Combles   │   │
 │  │ B3   │ T3   │ VS        │ Toiture  │   │
 │  │ D6   │ T1   │ VS        │ Toiture  │   │
 │  └──────┴──────┴───────────┴──────────┘   │
 │                                            │
 │  [Ajuster manuellement]  [Valider]         │
 └────────────────────────────────────────────┘
```

### [AJOUT] Écran 6 – Sélection des jours disponibles (diagnostiqueur)

```
 ┌────────────────────────────────────────────┐
 │  Mes jours disponibles                     │
 │  10/03 au 20/03/2026                       │
 │                                            │
 │  Lun 10 ☐  Mar 11 ☑  Mer 12 ☑            │
 │  Jeu 13 ☑  Ven 14 ☐  Sam 15 ☐            │
 │  Dim 16 ☐  Lun 17 ☑  Mar 18 ☑  Mer 19 ☑  │
 │                                            │
 │  Jours sélectionnés : 6                    │
 │                                            │
 │  [Valider et envoyer les liens]            │
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
 │          │        │  │ UC5 : Exporter le    │       │
 │          │────────│─→│ planning             │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC10 : Saisir les   │       │
 │          │        │  │ critères immeuble   │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC11 : Exécuter     │       │
 │          │        │  │ l'algorithme de     │       │
 │          │        │  │ sélection           │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC12 : Choisir ses  │       │
 │          │        │  │ jours disponibles   │       │
 │          │        │  └─────────────────────┘       │
 │          │        │  ┌─────────────────────┐       │
 │          │────────│─→│ UC13 : Envoyer      │       │
 │          │        │  │ emails différenciés │       │
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
| **Scénario nominal** | 1. Le locataire clique sur le lien ; 2. Il coche les créneaux qui lui conviennent (filtrés par jours disponibles du diagnostiqueur) ; 3. Il valide |
| **Postcondition** | Les disponibilités sont enregistrées sans création de compte |

**[AJOUT] UC10 — Saisir les critères de l'immeuble**
| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | La campagne vient d'être créée |
| **Scénario nominal** | 1. Accéder au formulaire "Configuration de l'immeuble" ; 2. Cocher les typologies présentes (T1–T6) ; 3. Sélectionner les types de plancher bas présents ; 4. Sélectionner les types de plancher haut présents ; 5. Associer chaque logement à sa typologie, son étage et ses types de plancher ; 6. Valider |
| **Postcondition** | Les critères sont enregistrés, l'algorithme peut être exécuté |

**[AJOUT] UC11 — Exécuter l'algorithme de sélection**
| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | Les critères de l'immeuble sont saisis |
| **Scénario nominal** | 1. Cliquer "Lancer la sélection" ; 2. L'algorithme applique RG11–RG15 ; 3. Il cherche la meilleure combinaison couvrant tous les critères avec le moins de visites ; 4. Le résultat affiche la liste sélectionnée et le statut complet/incomplet ; 5. Le diagnostiqueur peut ajuster manuellement |
| **Postcondition** | La liste des logements à visiter est déterminée |

**[AJOUT] UC12 — Choisir ses jours disponibles**
| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | La sélection des logements est validée |
| **Scénario nominal** | 1. Accéder à l'écran "Mes disponibilités" ; 2. Cochez les jours dans l'intervalle de la campagne ; 3. Valider ; 4. Les liens sont générés et envoyés ; 5. Les occupants ne voient que ces jours |
| **Postcondition** | Les jours disponibles sont enregistrés |

**[AJOUT] UC13 — Envoyer les emails différenciés**
| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | Les créneaux de visite ont été attribués |
| **Scénario nominal** | 1. Accéder à l'écran "Communication" ; 2. Visualiser la liste (visité / non visité) ; 3. Prévisualiser les deux types d'emails ; 4. Envoyer |
| **Postcondition** | Chaque occupant reçoit le message adapté à son statut |

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
| **RG11** | **[AJOUT]** Échantillonnage par typologie | Au moins 1 logement par typologie présente (T1–T6) doit être visité |
| **RG12** | **[AJOUT]** Échantillonnage par type plancher bas | Au moins 1 logement par type de plancher bas présent : terre-plein, vide-sanitaire, sur local commercial, garage, autre |
| **RG13** | **[AJOUT]** Échantillonnage par type plancher haut | Au moins 1 logement par type de plancher haut présent : combles perdus, combles aménagés, toiture terrasse, extérieur |
| **RG14** | **[AJOUT]** Étage intermédiaire | Au moins 1 logement en étage intermédiaire (ni RDC, ni dernier étage) doit être visité |
| **RG15** | **[AJOUT]** Seuil minimal de visites | 30–99 lots → 10 % ; 100 lots ou plus → 10 + 5 % |
| **RG16** | **[AJOUT]** Jours disponibles du diagnostiqueur d'abord | Le diagnostiqueur choisit ses jours avant les occupants ; les occupants ne voient que ces jours |
| **RG17** | **[AJOUT]** Deux types d'emails | Logement non visité → email info ; Logement visité → créneau + coordonnées |

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
| **[AJOUT] Typologie** | Catégorie d'un logement selon le nombre de pièces principales (T1–T6) |
| **[AJOUT] Plancher bas** | Structure séparant le logement du sol ou d'un local inférieur |
| **[AJOUT] Plancher haut** | Structure séparant le logement du toit ou des combles |
| **[AJOUT] Étage intermédiaire** | Étage qui n'est ni le RDC ni le dernier étage |
| **[AJOUT] Échantillonnage complet** | Tous les critères obligatoires sont couverts par les logements sélectionnés |
| **[AJOUT] Algorithme de sélection** | Algorithme calculant la meilleure combinaison de logements couvrant tous les critères avec le moins de visites |
| **[AJOUT] Jour disponible** | Jour choisi par le diagnostiqueur ; les occupants ne peuvent proposer des créneaux que sur ces jours |
| **[AJOUT] Seuil minimal** | Nombre minimum de visites calculé selon la taille de l'immeuble (10% ou 10+5%) |

---

## [AJOUT] 2.10 Algorithme de sélection des logements

### Principes
L'algorithme de sélection détermine quels logements doivent être visités pour respecter la réglementation d'échantillonnage des DPE collectifs.

### Critères d'échantillonnage (RG11–RG14)
1. **Typologies** : au moins 1 logement par typologie présente (T1, T2, T3, T4, T5, T6)
2. **Plancher bas** : au moins 1 logement par type présent (terre-plein, vide-sanitaire, sur local commercial, garage, autre)
3. **Plancher haut** : au moins 1 logement par type présent (combles perdus, combles aménagés, toiture terrasse, extérieur)
4. **Étage intermédiaire** : au moins 1 logement ni au RDC ni au dernier étage

### Seuil minimal (RG15)
- **30 à 99 logements** → 10 % du total (arrondi supérieur)
- **100 logements ou plus** → 10 + 5 % du total (arrondi supérieur)
- Si l'échantillonnage (RG11–RG14) donne moins de logements que le seuil, des logements supplémentaires sont ajoutés

### Logique de combinaison
- Un même logement peut couvrir **plusieurs critères** (ex: T3 + plancher bas vide-sanitaire + étage intermédiaire)
- L'algorithme cherche la **meilleure combinaison** pour couvrir tous les critères avec le **minimum de visites**
- Si plusieurs types de plancher bas existent → un logement **par type différent**, même au même étage
- Idem pour les planchers hauts

### Étapes
1. Collecter tous les logements avec leurs attributs (typologie, plancher bas, plancher haut, étage)
2. Identifier les critères obligatoires (RG11–RG14)
3. Rechercher la combinaison optimale (set cover problem)
4. Comparer avec le seuil minimal (RG15)
5. Ajouter des logements supplémentaires si nécessaire
6. Afficher le statut "Complet" ou "Incomplet" avec le détail des critères manquants

---

## [AJOUT] 2.11 Gestion des disponibilités croisées

### Flux
1. Le diagnostiqueur choisit ses **jours disponibles** parmi l'intervalle de la campagne
2. Les occupants reçoivent un lien et **ne voient que ces jours** dans le calendrier
3. Les occupants sélectionnent leurs **créneaux horaires** (ex: 9h-12h, 14h-17h)
4. Le planning final **croise** : logements sélectionnés + créneaux compatibles des occupants
5. L'ordonnancement applique RG3 (tri étage), RG4 (pas chevauchement), RG9 (pause 15 min)

### Contraintes
- Un occupant ne peut proposer des créneaux que sur les jours disponibles du diagnostiqueur
- Le diagnostiqueur peut ajuster manuellement le planning après croisement

---

## [AJOUT] 2.12 Communication post-sélection

### Deux types d'emails (RG17)

| Type | Destinataire | Contenu |
|------|-------------|---------|
| **Option 1 — Information** | Occupant dont le logement n'est PAS visité | Information de la campagne + mention que son logement n'est pas retenu + coordonnées du syndic/diagnostiqueur pour questions |
| **Option 2 — Visite** | Occupant dont le logement EST visité | Créneau attribué (date + heure) + coordonnées complètes du diagnostiqueur (nom, téléphone, email) + instruction pour la visite |

### Prévisualisation
- Le diagnostiqueur peut prévisualiser les deux modèles d'emails avant envoi
- Les champs dynamiques ([Nom], [Date], [Créneau], etc.) sont affichés avec des exemples
- Possibilité de modifier le contenu des emails avant envoi

