# 5. Documentation Technique Finale

**Version :** 1.1 — 21/05/2026  
*En cours de construction — sera alimentée au fil du développement.*

---

## 5.1 Architecture générale
*(à venir)*

## 5.2 Modèle de données
*(à venir)*

### [AJOUT] 5.2.1 Tables liées à l'échantillonnage
- `typologies` : liste des typologies (T1–T6) avec leur description
- `types_plancher_bas` : liste des types de plancher bas (terre-plein, vide-sanitaire, sur local commercial, garage, autre)
- `types_plancher_haut` : liste des types de plancher haut (combles perdus, combles aménagés, toiture terrasse, extérieur)
- Colonnes supplémentaires dans `logements` : `id_typologie`, `id_type_plancher_bas`, `id_type_plancher_haut`, `est_intermediaire` (booléen)

### [AJOUT] 5.2.2 Table de disponibilités croisées
- Table `jours_disponibles` : lien entre campagne et jours choisis par le diagnostiqueur
- Table `creneaux_occupants` : créneaux horaires saisis par les occupants (filtrés par jours disponibles)

## 5.3 Algorithme de sélection des logements
*(à venir — voir section 2.10 des spécifications)*

### [AJOUT] 5.3.1 Principe
Algorithme de type "set cover" optimisé pour couvrir tous les critères d'échantillonnage (RG11–RG14) avec le minimum de logements.

### [AJOUT] 5.3.2 Entrées
- Liste des logements avec leurs attributs (typologie, plancher bas, plancher haut, étage)
- Critères obligatoires déduits de l'immeuble

### [AJOUT] 5.3.3 Sorties
- Liste des logements sélectionnés
- Statut "Échantillonnage complet / incomplet"
- Critères manquants (si incomplet)
- Comparaison avec le seuil minimal (RG15)

## 5.4 API endpoints
*(à venir)*

### [AJOUT] 5.4.1 Endpoints liés à l'échantillonnage
- `POST /api/campagnes/:id/immeuble/criteres` — sauvegarder les critères de l'immeuble
- `GET /api/campagnes/:id/immeuble/criteres` — récupérer les critères sauvegardés
- `POST /api/campagnes/:id/algorithme/selection` — exécuter l'algorithme et obtenir la sélection
- `PUT /api/campagnes/:id/algorithme/selection` — ajuster manuellement la sélection

### [AJOUT] 5.4.2 Endpoints de disponibilités
- `POST /api/campagnes/:id/jours-disponibles` — définir les jours du diagnostiqueur
- `GET /api/campagnes/:id/jours-disponibles` — consulter les jours disponibles
- `POST /api/liens/:token/creneaux` — saisir les créneaux d'un occupant (filtré)
- `GET /api/campagnes/:id/planning/croise` — obtenir le planning croisé

### [AJOUT] 5.4.3 Endpoints de communication
- `GET /api/campagnes/:id/emails/previsualisation` — prévisualiser les deux types d'emails
- `POST /api/campagnes/:id/emails/envoi` — déclencher l'envoi différencié

## 5.5 Guide d'installation
*(à venir)*

## 5.6 Déploiement
*(à venir)*
