# Glossaire

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 1.0

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

---

## Relations entre les termes

```
Campagne (période globale)
    │
    ├── Logement 1 (appartement)
    │       ├── Disponibilités (créneaux libres saisis par le locataire)
    │       └── Créneau attribué (intervalle planifié après ordonnancement)
    │
    ├── Logement 2
    │       └── ...
    │
    └── Planning optimisé = ensemble des créneaux attribués, triés par étage

    ├── Relance → envoyée si pas de réponse
    └── Rappel → envoyé avant la visite
```
