# Cas d'Utilisation

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 1.0

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
