# Wireframes

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 1.0

---

## Écran 1 — Tableau de bord (entrepreneur)

Vue d'ensemble des campagnes avec indicateurs et liste.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Planif'Audit                          [Tableau de bord]   │
 │                                                Campagnes   │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Tableau de bord                                   │    │
 │  │  Gérez vos campagnes de visites énergétiques       │    │
 │  │                                          [+ Nouvelle]│    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
 │  │  Actives │  │ En att.  │  │ Terminées│                 │
 │  │    2     │  │    5     │  │    1     │                 │
 │  └──────────┘  └──────────┘  └──────────┘                 │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Campagnes récentes                                │    │
 │  │  ┌──────────┬────────────┬────────┬────────┬────┐  │    │
 │  │  │ Adresse  │ Dates      │ Statut │ Progr. │ ...│  │    │
 │  │  ├──────────┼────────────┼────────┼────────┼────┤  │    │
 │  │  │ 12 Rue   │ 10/03-20/03│ Active │  60%   │ 👁 │  │    │
 │  │  │ des Lilas│            │        │        │    │  │    │
 │  │  └──────────┴────────────┴────────┴────────┴────┘  │    │
 │  └────────────────────────────────────────────────────┘    │
 └────────────────────────────────────────────────────────────┘
```

**Éléments :**
- Top bar avec logo "Planif'Audit" et navigation
- Titre + bouton "Nouvelle campagne"
- 3 cartes statistiques (Actives / En attente / Terminées)
- Formulaire de création (adresse, date début, date fin, nb logements)
- Tableau des campagnes récentes (adresse, dates, statut, progression, actions)

---

## Écran 2 — Création d'une campagne (entrepreneur)

Formulaire dédié à la configuration d'une nouvelle campagne.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Nouvelle campagne de visites                              │
 │                                                            │
 │  Adresse de l'immeuble                                     │
 │  ┌──────────────────────────────────────────────────────┐  │
 │  │  12 Rue des Lilas, Paris 75011                       │  │
 │  └──────────────────────────────────────────────────────┘  │
 │                                                            │
 │  Date de début              Date de fin                    │
 │  ┌────────────────────┐   ┌────────────────────┐          │
 │  │  10/03/2026        │   │  20/03/2026        │          │
 │  └────────────────────┘   └────────────────────┘          │
 │                                                            │
 │  Nombre d'appartements :  [  25  ]                        │
 │                                                            │
 │              [Annuler]    [Créer la campagne]              │
 └────────────────────────────────────────────────────────────┘
```

---

## Écran 3 — Détail d'une campagne (entrepreneur)

Consultation des réponses des locataires et génération des liens.

```
 ┌────────────────────────────────────────────────────────────┐
 │  ← Retour                                                  │
 │  Détail de la campagne                  [🔗 Générer liens] │
 │  12 Rue des Lilas — 10/03/2026 au 20/03/2026               │
 │                                                            │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
 │  │ Répondu  │  │ En att.  │  │ Total    │                 │
 │  │   18     │  │    7     │  │   25     │                 │
 │  └──────────┘  └──────────┘  └──────────┘                 │
 │                                                            │
 │  [Réponses]  [Planning]           (onglets)                │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Réponses des locataires      [📧 Relancer tous]   │    │
 │  │  ┌──────────┬───────┬────────┬────────┬────────┐   │    │
 │  │  │ Logement │ Étage │ Statut │Créneau │Actions │   │    │
 │  │  ├──────────┼───────┼────────┼────────┼────────┤   │    │
 │  │  │ A1       │ RDC   │ ✅     │ 10/03  │ —      │   │    │
 │  │  │ A2       │ RDC   │ ⏳     │ —      │ Rel.   │   │    │
 │  │  │ B3       │ 1er   │ ✅     │ 10/03  │ —      │   │    │
 │  │  └──────────┴───────┴────────┴────────┴────────┘   │    │
 │  └────────────────────────────────────────────────────┘    │
 └────────────────────────────────────────────────────────────┘
```

---

## Écran 4 — Planning optimisé (entrepreneur)

Vue du planning généré avec tri par étage et timeline.

```
 ┌────────────────────────────────────────────────────────────┐
 │  ← Retour au détail                                        │
 │  Planning optimisé                     [📄 PDF] [📅 iCal] │
 │  12 Rue des Lilas — 10/03/2026 au 20/03/2026               │
 │                                                            │
 │  [🟢 Trié par étage (RG3)] [🟠 Pause 15 min (RG9)]        │
 │  [🔵 Pas de chevauchement (RG4)]                           │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  TIMELINE VISUELLE                                │    │
 │  │  ┌──────┬───────────┬────────┬────────┬────────┐  │    │
 │  │  │ #    │ Date      │ Début  │ Fin    │ Logt   │  │    │
 │  │  ├──────┼───────────┼────────┼────────┼────────┤  │    │
 │  │  │ 1    │ Lun 10/03 │ 09:00  │ 09:30  │ RDC-A1 │  │    │
 │  │  │ 2    │ Lun 10/03 │ 09:45  │ 10:15  │ RDC-A2 │  │    │
 │  │  │ 3    │ Lun 10/03 │ 10:30  │ 11:00  │ 1er-B3 │  │    │
 │  │  │ 4    │ Lun 10/03 │ 11:15  │ 11:45  │ 1er-B4 │  │    │
 │  │  └──────┴───────────┴────────┴────────┴────────┘  │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Modifier un créneau                               │    │
 │  │  Logement : [A1 ▼]   Date : [______]              │    │
 │  │  Début : [______]    Fin :  [______]               │    │
 │  │              [Appliquer la modification]           │    │
 │  └────────────────────────────────────────────────────┘    │
 └────────────────────────────────────────────────────────────┘
```

**Règles appliquées sur le planning :**
- **RG3** — Tri par étage croissant (RDC → dernier étage)
- **RG4** — Pas de chevauchement des créneaux
- **RG9** — Pause minimale de 15 min entre deux visites consécutives
