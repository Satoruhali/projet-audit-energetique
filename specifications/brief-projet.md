# 1. Brief Initial

**Projet :** Site web pour auto-entrepreneur en audits énergétiques  
**Version :** 2.0 — 21/05/2026

---

## 1.1 Contexte
Un auto-entrepreneur réalise des audits énergétiques dans des immeubles comportant de nombreux appartements. Actuellement, il organise ses rendez-vous manuellement, ce qui devient ingérable lorsque le nombre de logements augmente.

## 1.2 Problème
Difficulté à planifier et ordonnancer les visites dans un immeuble, notamment quand le volume d'appartements est élevé. L'organisation actuelle entraîne des pertes de temps et des allers-retours inutiles entre les étages.

## 1.3 Objectifs du site
- Permettre à l'entrepreneur de fixer une amplitude de dates pour ses interventions (ex : 10 au 20 mars).
- Permettre aux locataires de saisir leurs créneaux de disponibilité.
- Trier et organiser les visites par étage (1er étage ensemble, puis 2e, etc.) afin d'optimiser les déplacements et enchaîner les visites sans perte de temps.
- **[AJOUT]** Sélectionner automatiquement les logements à visiter selon les règles d'échantillonnage réglementaire (typologies, planchers, seuil minimal).
- **[AJOUT]** Croiser les disponibilités du diagnostiqueur et des occupants pour générer un planning optimisé.
- **[AJOUT]** Communiquer de façon différenciée avec les occupants (visité / non visité).

## 1.4 Acteurs
| Acteur | Rôle |
|---|---|
| **Auto-entrepreneur / Diagnostiqueur** | Définit les plages de dates, configure les critères de l'immeuble, exécute l'algorithme de sélection, choisit ses jours disponibles, consulte le planning optimisé, envoie les emails différenciés |
| **Occupant / Locataire** | Saisit ses disponibilités pour la visite de son logement (filtrées par jours disponibles du diagnostiqueur), reçoit un email adapté à son statut |

## 1.5 Contraintes identifiées (à valider)
- Respect de la réglementation DPE collectif : échantillonnage par typologie (T1–T6), par type de plancher bas/haut, étage intermédiaire.
- Seuil minimal de visites selon la taille de l'immeuble (< 30 lots → pas de seuil ; 31–100 lots → 10% ; > 100 lots → 5%, min. 10).
- Le diagnostiqueur choisit ses jours disponibles avant les occupants.
- Deux types d'emails selon que le logement est visité ou non.
