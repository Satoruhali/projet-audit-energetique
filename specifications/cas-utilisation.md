# Cas d'Utilisation

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 2.0

---

## Diagramme textuel

```
                     ┌───────────────────────────────────────────────┐
                     │    Planif'Audit                               │
                     │    Application de planification d'audits      │
                     │                                                      │
 ┌──────────┐        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC1 : Créer une campagne de visites  │           │
 │ Antoine  │        │  └─────────────────────────────────────┘           │
 │(Entrepr.)│        │  ┌─────────────────────────────────────┐           │
 │          │        │  │ UC2 : Générer et envoyer les liens   │           │
 │          │────────│─→│ (liens uniques par logement)        │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC3 : Consulter le planning optimisé│           │
 │          │        │  │ (tri par étage + pause 15 min)      │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC4 : Modifier un créneau manuellement         │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC5 : Exporter le planning          │           │
 │          │        │  │ (PDF / iCal)                        │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC9 : Relancer les locataires       │           │
 │          │        │  │ (individuel ou en masse)            │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC10 : Saisir les critères de       │           │
 │          │        │  │ l'immeuble (typologies, planchers)  │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC11 : Exécuter l'algorithme de     │           │
 │          │        │  │ sélection des logements à visiter   │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC12 : Choisir ses jours            │           │
 │          │        │  │ disponibles (diagnostiqueur)        │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC13 : Envoyer les emails           │           │
 │          │        │  │ différenciés (visité/non visité)    │           │
 │          │        │  └─────────────────────────────────────┘           │
 └──────────┘        │                                                      │
                      │                                                      │
 ┌──────────┐        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC6 : Saisir ses disponibilités     │           │
 │ Locataire│        │  │ (via lien unique, sans compte)      │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC7 : Recevoir un rappel de créneau │           │
 │          │        │  │ (48h et 24h avant la visite)        │           │
 │          │        │  └─────────────────────────────────────┘           │
 │          │        │  ┌─────────────────────────────────────┐           │
 │          │────────│─→│ UC8 : Modifier ses disponibilités   │           │
 │          │        │  │ (après validation initiale)         │           │
 │          │        │  └─────────────────────────────────────┘           │
 └──────────┘        │                                                      │
                      └───────────────────────────────────────────────┘
```

---

## Descriptions détaillées

### UC1 — Créer une campagne de visites

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | L'entrepreneur est sur le tableau de bord |
| **Scénario nominal** | 1. Saisir l'adresse de l'immeuble ; 2. Définir la date de début et de fin ; 3. Indiquer le nombre d'appartements ; 4. Valider la campagne |
| **Postcondition** | La campagne est créée et apparaît dans la liste du tableau de bord |

### UC2 — Générer et envoyer les liens

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Une campagne existe |
| **Scénario nominal** | 1. L'application génère un lien unique par appartement ; 2. L'entrepreneur choisit d'envoyer par email ou SMS ; 3. Les locataires reçoivent leur lien |
| **Postcondition** | Les liens sont envoyés, les locataires peuvent saisir leurs disponibilités |

### UC3 — Consulter le planning optimisé

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Au moins un locataire a répondu |
| **Scénario nominal** | 1. L'application calcule le planning ; 2. Les créneaux sont triés par étage et par date ; 3. L'entrepreneur visualise le tableau et la timeline |
| **Postcondition** | Le planning est affiché avec les badges RG3, RG4, RG9 |

### UC4 — Modifier un créneau manuellement

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Le planning a été généré |
| **Scénario nominal** | 1. Sélectionner le logement dans la liste déroulante ; 2. Modifier la date et/ou l'heure ; 3. Valider la modification |
| **Postcondition** | Le créneau est mis à jour, le planning est recalculé |

### UC5 — Exporter le planning

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Le planning est affiché |
| **Scénario nominal** | 1. Cliquer sur "Exporter PDF" ou "Exporter iCal" ; 2. Le fichier est téléchargé |
| **Postcondition** | Le planning est exporté au format choisi |

### UC6 — Saisir ses disponibilités

| Champ | Valeur |
|---|---|
| **Acteur** | Locataire |
| **Précondition** | Le locataire a reçu un lien valide |
| **Scénario nominal** | 1. Le locataire clique sur le lien ; 2. Il coche les créneaux qui lui conviennent dans un tableau ; 3. Il valide sans créer de compte |
| **Postcondition** | Les disponibilités sont enregistrées, l'entrepreneur voit la réponse |

### UC7 — Recevoir un rappel de créneau

| Champ | Valeur |
|---|---|
| **Acteur** | Locataire |
| **Précondition** | Un créneau a été attribué au locataire |
| **Scénario nominal** | 1. 48h avant la visite, le locataire reçoit un rappel ; 2. 24h avant, il reçoit un second rappel |
| **Postcondition** | Le locataire est informé de son créneau |

### UC8 — Modifier ses disponibilités

| Champ | Valeur |
|---|---|
| **Acteur** | Locataire |
| **Précondition** | Le locataire a déjà validé ses disponibilités |
| **Scénario nominal** | 1. Le locataire clique sur son lien unique ; 2. Il modifie ses créneaux ; 3. Il valide la mise à jour |
| **Postcondition** | Les disponibilités sont mises à jour |

### UC9 — Relancer les locataires

| Champ | Valeur |
|---|---|
| **Acteur** | Entrepreneur |
| **Précondition** | Des locataires n'ont pas répondu |
| **Scénario nominal** | 1. L'entrepreneur consulte la liste des réponses ; 2. Il clique "Relancer" sur un locataire ou "Relancer tous" ; 3. Un rappel est envoyé |
| **Postcondition** | Les locataires relancés reçoivent une notification |

---

### [AJOUT] UC10 — Saisir les critères de l'immeuble (typologies, planchers)

| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | Une campagne vient d'être créée |
| **Scénario nominal** | 1. Le diagnostiqueur accède au formulaire "Configuration de l'immeuble" ; 2. Il coche les typologies présentes (T1, T2, T3, T4, T5, T6) ; 3. Il sélectionne les types de plancher bas présents (terre-plein, vide-sanitaire, sur local commercial, garage, autre) ; 4. Il sélectionne les types de plancher haut présents (combles perdus, combles aménagés, toiture terrasse, extérieur) ; 5. Il associe chaque logement à sa typologie, son étage, son type de plancher bas et son type de plancher haut ; 6. Il valide la configuration |
| **Postcondition** | Les critères de l'immeuble sont enregistrés, l'algorithme peut être exécuté |

### [AJOUT] UC11 — Exécuter l'algorithme de sélection des logements à visiter

| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | Les critères de l'immeuble sont saisis (UC10) |
| **Scénario nominal** | 1. Le diagnostiqueur clique "Lancer la sélection" ; 2. L'algorithme applique RG11–RG15 (typologies, plancher bas, plancher haut, étage intermédiaire, seuil minimal) ; 3. L'algorithme cherche la meilleure combinaison pour couvrir tous les critères avec le moins de visites possible ; 4. Le résultat affiche la liste des logements sélectionnés et le statut "Échantillonnage complet" ou "Incomplet" avec les critères manquants ; 5. Le diagnostiqueur peut ajuster manuellement la sélection |
| **Postcondition** | La liste des logements à visiter est déterminée |

### [AJOUT] UC12 — Choisir ses jours disponibles (diagnostiqueur)

| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | La sélection des logements est validée (UC11) |
| **Scénario nominal** | 1. Le diagnostiqueur accède à l'écran "Mes disponibilités" ; 2. Il coche un ou plusieurs jours dans l'intervalle de la campagne ; 3. Il valide ses jours disponibles ; 4. Les liens sont générés et envoyés aux occupants ; 5. Les occupants ne peuvent saisir des créneaux que sur ces jours |
| **Postcondition** | Les jours disponibles sont enregistrés et transmis aux occupants |

### [AJOUT] UC13 — Envoyer les emails différenciés (visité / non visité)

| Champ | Valeur |
|---|---|
| **Acteur** | Diagnostiqueur |
| **Précondition** | Les créneaux de visite ont été attribués |
| **Scénario nominal** | 1. Le diagnostiqueur accède à l'écran "Communication" ; 2. Il visualise la liste des occupants avec leur statut (visité / non visité) ; 3. Il prévisualise les deux types d'emails ; 4. Il clique "Envoyer les emails" ; 5. Les occupants reçus reçoivent : (a) email d'information simple si non visité, (b) créneau proposé + coordonnées du diagnostiqueur si visité |
| **Postcondition** | Les emails sont envoyés, chaque occupant reçoit le message adapté |
