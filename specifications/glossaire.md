# Glossaire

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 2.0

---

| Terme | Définition |
|---|---|
| **Audit énergétique** | Diagnostic de performance énergétique (DPE) d'un logement, réalisé par un professionnel certifié |
| **Campagne de visites** | Période définie (date de début → date de fin) durant laquelle l'entrepreneur réalise les audits des logements d'un même immeuble |
| **Créneau** | Intervalle de temps (ex : 10h00 – 10h30) attribué à la visite d'un logement spécifique |
| **Dashboard** | Tableau de bord principal affichant les statistiques et la liste des campagnes |
| **Disponibilités** | Ensemble des créneaux horaires qu'un locataire a indiqués comme libres pour la visite |
| **DPE** | Diagnostic de Performance Énergétique — document officiel évaluant la consommation d'énergie d'un logement |
| **Étage** | Niveau dans l'immeuble servant de critère de tri pour l'ordonnancement des visites |
| **Lien unique / Token** | URL sécurisée et non devinable envoyée à chaque locataire, permettant d'accéder au formulaire de saisie sans identifiant ni mot de passe |
| **Logement** | Appartement au sein de l'immeuble devant être visité dans le cadre de la campagne |
| **Ordonnancement** | Algorithme de tri des visites par étage croissant (RDC → dernier étage), puis par date et heure de début |
| **Planning optimisé** | Tableau final des visites classées par ordre de passage effectif, respectant les règles de gestion (RG3, RG4, RG9) |
| **Rappel** | Notification automatique envoyée à un locataire pour l'informer de son créneau attribué (48h et 24h avant) |
| **RDC** | Rez-de-chaussée — point de départ de l'ordonnancement des étages |
| **Relance** | Notification adressée à un locataire n'ayant pas encore saisi ses disponibilités, déclenchée par l'entrepreneur |
| **Timeline** | Représentation visuelle chronologique des visites sur le planning |
| **Visite** | Passage physique de l'entrepreneur dans un logement pour réaliser l'audit énergétique |
| **[AJOUT] Typologie** | Catégorie d'un logement selon le nombre de pièces principales (T1, T2, T3, T4, T5, T6) ; critère d'échantillonnage obligatoire |
| **[AJOUT] Plancher bas** | Structure séparant le logement du sol ou d'un local inférieur ; types : terre-plein, vide-sanitaire, sur local commercial, garage, autre |
| **[AJOUT] Plancher haut** | Structure séparant le logement du toit ou des combles ; types : combles perdus, combles aménagés, toiture terrasse, extérieur |
| **[AJOUT] Étage intermédiaire** | Étage qui n'est ni le rez-de-chaussée (RDC) ni le dernier étage de l'immeuble ; un logement à cet étage doit obligatoirement être visité |
| **[AJOUT] Échantillonnage complet** | Statut atteint lorsque l'algorithme a couvert tous les critères obligatoires (typologies, planchers, étage intermédiaire) dans le respect du seuil minimal |
| **[AJOUT] Échantillonnage incomplet** | Statut affiché quand au moins un critère obligatoire n'est pas couvert par les logements sélectionnés ; le diagnostiqueur peut ajuster manuellement |
| **[AJOUT] Algorithme de sélection** | Algorithme qui calcule la meilleure combinaison de logements à visiter pour couvrir tous les critères d'échantillonnage avec le moins de visites possible |
| **[AJOUT] Jour disponible (diagnostiqueur)** | Jour choisi par le diagnostiqueur dans l'intervalle de la campagne ; les occupants ne peuvent proposer des créneaux que sur ces jours |
| **[AJOUT] Créneau horaire (occupant)** | Plage horaire proposée par un occupant uniquement parmi les jours disponibles du diagnostiqueur |
| **[AJOUT] Seuil minimal de visites** | Nombre minimum de logements à visiter calculé selon la taille de l'immeuble : < 30 lots → pas de seuil ; 31–100 lots → 10 % ; > 100 lots → 5 % (min. 10) |

---

## Relations entre les termes

```
Immeuble
    │
    ├── Typologies présentes (T1, T2, T3, T4, T5, T6)
    ├── Types de plancher bas (terre-plein, vide-sanitaire, ...)
    ├── Types de plancher haut (combles perdus, toiture terrasse, ...)
    │
    ├── Logement 1
    │       ├── Typologie
    │       ├── Type plancher bas
    │       ├── Type plancher haut
    │       ├── Étage (RDC / intermédiaire / dernier)
    │       ├── Disponibilités (créneaux horaires saisis par l'occupant)
    │       └── Créneau attribué (après croisement)
    │
    └── Logement 2 → ...

    Algorithme de sélection → liste des logements à visiter (RG11–RG15)
        ├── Échantillonnage complet (tous critères couverts)
        └── Échantillonnage incomplet (critères manquants listés)

    Jours disponibles (diagnostiqueur) → filtre les créneaux proposables par les occupants

    Communication post-sélection :
        ├── Email visite (créneau + coordonnées)
        └── Email information (simple avis)
```
