# Wireframes

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 2.0

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

---

## [AJOUT] Écran 5 — Configuration de l'immeuble (diagnostiqueur)

Saisie des critères pour l'algorithme d'échantillonnage.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Configuration de l'immeuble                               │
 │                                                            │
 │  Adresse : 12 Rue des Lilas, Paris 75011                   │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Typologies présentes                              │    │
 │  │  ☑ T1  ☑ T2  ☑ T3  ☑ T4  ☐ T5  ☐ T6              │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Types de plancher bas                             │    │
 │  │  ☑ Terre-plein  ☑ Vide-sanitaire  ☐ Sur local     │    │
 │  │  ☐ Garage        ☑ Autre                          │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Types de plancher haut                            │    │
 │  │  ☑ Combles perdus  ☐ Combles aménagés             │    │
 │  │  ☑ Toiture terrasse  ☐ Extérieur                  │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Liste des logements                               │    │
 │  │  ┌──────┬──────┬───────────┬──────────┬─────────┐  │    │
 │  │  │ Logt │ Typo │ Pl. bas   │ Pl. haut │ Étage   │  │    │
 │  │  ├──────┼──────┼───────────┼──────────┼─────────┤  │    │
 │  │  │ A1   │ T2   │ Terre-plein│Combles  │ RDC     │  │    │
 │  │  │ A2   │ T2   │ Terre-plein│Combles  │ RDC     │  │    │
 │  │  │ B3   │ T3   │ VS         │ Toiture  │ 1er    │  │    │
 │  │  │ B4   │ T4   │ VS         │ Toiture  │ 1er    │  │    │
 │  │  │ C5   │ T3   │ VS         │ Toiture  │ 2e     │  │    │
 │  │  │ D6   │ T1   │ VS         │ Toiture  │ 3e     │  │    │
 │  │  └──────┴──────┴───────────┴──────────┴─────────┘  │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │              [Enregistrer]    [Lancer la sélection]        │
 └────────────────────────────────────────────────────────────┘
```

---

## [AJOUT] Écran 6 — Résultat de l'algorithme de sélection

Affichage des logements sélectionnés avec statut complet/incomplet.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Résultat de la sélection                                  │
 │  12 Rue des Lilas — 45 logements                           │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Statut : 🔴 ÉCHANTILLONNAGE INCOMPLET             │    │
 │  │  Critères manquants :                               │    │
 │  │  • Typologie T5 (aucun logement T5 dans l'immeuble)│    │
 │  │  • Plancher bas : garage (aucun logement avec       │    │
 │  │    ce type de plancher)                             │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  Logements sélectionnés (7 / 10 minimum requis)             │
 │  ┌──────┬──────┬───────────┬──────────┬─────────┬────────┐ │
 │  │ Logt │ Typo │ Pl. bas   │ Pl. haut │ Étage   │ Couvre │ │
 │  ├──────┼──────┼───────────┼──────────┼─────────┼────────┤ │
 │  │ A1   │ T2   │Terre-plein│Combles   │ RDC     │ T2+PB  │ │
 │  │ B3   │ T3   │ VS        │ Toiture  │ 1er     │ T3+PH  │ │
 │  │ B4   │ T4   │ VS        │ Toiture  │ 1er     │ T4     │ │
 │  │ D6   │ T1   │ VS        │ Toiture  │ 3e      │ T1+Etg │ │
 │  │ F10  │ T5   │ VS        │ Combles  │ 5e      │ T5     │ │
 │  │ G12  │ T6   │Ter-plein  │ Toiture  │ 8e      │ T6     │ │
 │  │ H15  │ T4   │ Garage    │ Combles  │ RDC     │ PB     │ │
 │  └──────┴──────┴───────────┴──────────┴──────────┴────────┘ │
 │                                                            │
 │  Seuil minimal : 10 logements (10% de 100) → 3 manquants   │
 │                                                            │
 │              [Ajuster manuellement]    [Valider]           │
 └────────────────────────────────────────────────────────────┘
```

---

## [AJOUT] Écran 7 — Sélection des jours disponibles (diagnostiqueur)

Choix des jours avant invitation des occupants.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Mes jours disponibles                                     │
 │  12 Rue des Lilas — Campagne du 10/03 au 20/03/2026       │
 │                                                            │
 │  Sélectionnez les jours où vous serez disponible :         │
 │                                                            │
 │  ┌─────────┬─────────┬─────────┬─────────┬─────────┐      │
 │  │  Lun 10 │  Mar 11 │  Mer 12 │  Jeu 13 │  Ven 14 │      │
 │  │  ☐      │  ☑      │  ☑      │  ☑      │  ☐      │      │
 │  ├─────────┼─────────┼─────────┼─────────┼─────────┤      │
 │  │  Sam 15 │  Dim 16 │  Lun 17 │  Mar 18 │  Mer 19 │      │
 │  │  ☐      │  ☐      │  ☑      │  ☑      │  ☑      │      │
 │  └─────────┴─────────┴─────────┴─────────┴─────────┘      │
 │                                                            │
 │  Jours sélectionnés : 6 jours                              │
 │                                                            │
 │              [Valider et envoyer les liens]                │
 └────────────────────────────────────────────────────────────┘
```

---

## [AJOUT] Écran 8 — Aperçu des emails avant envoi

Prévisualisation des deux types d'emails.

```
 ┌────────────────────────────────────────────────────────────┐
 │  Communication — Aperçu des emails                         │
 │  12 Rue des Lilas                                          │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Occupants visités (7) : email avec créneau        │    │
 │  │  ┌──────────────────────────────────────────────┐  │    │
 │  │  │  Objet : Votre rendez-vous DPE collectif     │  │    │
 │  │  │                                                │  │    │
 │  │  │  Bonjour [Nom],                              │  │    │
 │  │  │                                                │  │    │
 │  │  │  Votre logement a été sélectionné pour        │  │    │
 │  │  │  l'audit énergétique. Rendez-vous le :        │  │    │
 │  │  │  📅 12/03/2026 à 09h00                        │  │    │
 │  │  │                                                │  │    │
 │  │  │  Diagnostiqueur : Sarah Dupont                │  │    │
 │  │  │  📞 06 12 34 56 78                            │  │    │
 │  │  │  ✉ sarah.d@exemple.fr                        │  │    │
 │  │  └──────────────────────────────────────────────┘  │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │  ┌────────────────────────────────────────────────────┐    │
 │  │  Occupants non visités (38) : email d'information  │    │
 │  │  ┌──────────────────────────────────────────────┐  │    │
 │  │  │  Objet : Information audit DPE collectif     │  │    │
 │  │  │                                                │  │    │
 │  │  │  Bonjour [Nom],                              │  │    │
 │  │  │                                                │  │    │
 │  │  │  Une campagne d'audit énergétique a lieu      │  │    │
 │  │  │  dans votre immeuble du 10 au 20/03/2026.    │  │    │
 │  │  │  Votre logement n'a pas été retenu pour       │  │    │
 │  │  │  une visite cette année.                      │  │    │
 │  │  │                                                │  │    │
 │  │  │  Pour toute question, contactez votre         │  │    │
 │  │  │  syndic ou le diagnostiqueur.                 │  │    │
 │  │  └──────────────────────────────────────────────┘  │    │
 │  └────────────────────────────────────────────────────┘    │
 │                                                            │
 │              [Modifier les emails]    [Envoyer tout]       │
 └────────────────────────────────────────────────────────────┘
 ```

 **Éléments :**
 - Séparateur "Occupants visités / Occupants non visités"
 - Prévisualisation des emails avec champs dynamiques ([Nom], dates)
 - Bouton "Modifier les emails" pour ajuster le contenu
 - Bouton "Envoyer tout" qui déclenche l'envoi différencié
