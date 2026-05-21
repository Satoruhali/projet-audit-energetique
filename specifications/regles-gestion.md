# Règles de Gestion (RG)

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 2.0

---

| ID | Règle | Description | Appliquée dans l'UI |
|---|---|---|---|
| **RG1** | Demi-heure minimum | Chaque créneau de visite dure au minimum 30 minutes | — |
| **RG2** | Un logement = une visite | Un appartement ne peut être visité qu'une seule fois par campagne | — |
| **RG3** | Ordre par étage | L'ordonnancement trie les visites par étage croissant (RDC → dernier étage) avant de trier par date | Badge "Trié par étage" affiché sur le planning |
| **RG4** | Pas de chevauchement | L'entrepreneur ne peut pas avoir deux visites en même temps (même étage ou non) | Badge "Pas de chevauchement" sur le planning |
| **RG5** | Lien unique et sécurisé | Chaque locataire reçoit un lien unique (token) lié à son seul appartement ; il ne voit que ses propres informations | Génération de liens par logement |
| **RG6** | Confidentialité | Un locataire ne voit jamais les disponibilités ou le créneau attribué d'un autre locataire | — |
| **RG7** | Délai de réponse | Si un locataire n'a pas répondu 48h avant la date de fin de la campagne, l'entrepreneur est notifié pour relance | Bouton "Relancer tous" et relance individuelle |
| **RG8** | Rappel automatique | Les locataires reçoivent un rappel 48h et 24h avant leur créneau attribué | — |
| **RG9** | Pause entre visites | Un intervalle minimum de 15 minutes est réservé entre deux visites consécutives pour le déplacement | Badge "Pause 15 min incluse" sur le planning |
| **RG10** | Non-réponse = absence | Tout locataire n'ayant pas répondu dans les délais est marqué "Non disponible" et n'apparaît pas dans le planning | Statut "En attente" dans le tableau des réponses |
| **RG11** | [AJOUT] Échantillonnage par typologie | Au moins 1 logement par typologie présente (T1, T2, T3, T4, T5, T6) doit être visité | Badge "Échantillonnage complet/incomplet" |
| **RG12** | [AJOUT] Échantillonnage par type de plancher bas | Au moins 1 logement par type de plancher bas présent : terre-plein, vide-sanitaire, sur local commercial, garage, autre | Badge "Échantillonnage complet/incomplet" |
| **RG13** | [AJOUT] Échantillonnage par type de plancher haut | Au moins 1 logement par type de plancher haut présent : combles perdus, combles aménagés, toiture terrasse, extérieur | Badge "Échantillonnage complet/incomplet" |
| **RG14** | [AJOUT] Étage intermédiaire | Au moins 1 logement en étage intermédiaire (ni RDC, ni dernier étage) doit être visité | Badge "Échantillonnage complet/incomplet" |
| **RG15** | [AJOUT] Seuil minimal de visites | Si 30 à 99 lots → 10 % minimum ; si 100 lots ou plus → 10 + 5 % minimum | Calcul automatique du seuil |
| **RG16** | [AJOUT] Jours disponibles du diagnostiqueur d'abord | Le diagnostiqueur choisit ses jours disponibles avant que les occupants ne donnent leurs créneaux ; les occupants ne voient que ces jours-là | Calendrier diagnostiqueur → Calendrier occupant filtré |
| **RG17** | [AJOUT] Deux types d'emails | Logement non visité → email d'information simple ; Logement visité → créneau proposé + coordonnées diagnostiqueur | Aperçu emails avant envoi |

---

## Détail des règles principales

### RG3 — Ordre par étage
L'algorithme d'ordonnancement trie les visites selon l'ordre croissant des étages :
1. Rez-de-chaussée (RDC)
2. 1er étage
3. 2e étage
4. etc.

À étage égal, les visites sont triées par date et heure de début.

### RG4 — Pas de chevauchement
Deux visites ne peuvent pas occuper le même intervalle de temps, même si elles se situent à des étages différents. L'algorithme vérifie les disponibilités croisées de l'entrepreneur.

### RG9 — Pause entre visites
Une marge de 15 minutes est automatiquement insérée entre la fin d'une visite et le début de la suivante pour permettre à l'entrepreneur de se déplacer d'un étage à l'autre.

---

### [AJOUT] RG11 — Échantillonnage par typologie
Lors de la configuration de l'immeuble, le diagnostiqueur déclare les typologies présentes (T1, T2, T3, T4, T5, T6). L'algorithme doit sélectionner au moins 1 logement par typologie présente.

### [AJOUT] RG12 — Échantillonnage par type de plancher bas
Le diagnostiqueur déclare les types de plancher bas présents dans l'immeuble :
- **Terre-plein**
- **Vide-sanitaire**
- **Sur local commercial**
- **Garage**
- **Autre**

L'algorithme doit sélectionner au moins 1 logement par type de plancher bas présent. Si plusieurs logements ont le même type, un seul suffit.

### [AJOUT] RG13 — Échantillonnage par type de plancher haut
Le diagnostiqueur déclare les types de plancher haut présents dans l'immeuble :
- **Combles perdus**
- **Combles aménagés**
- **Toiture terrasse**
- **Extérieur**

L'algorithme doit sélectionner au moins 1 logement par type de plancher haut présent.

### [AJOUT] RG14 — Étage intermédiaire
L'algorithme doit sélectionner au moins 1 logement situé à un étage qui n'est ni le RDC ni le dernier étage. Si l'immeuble n'a que 2 niveaux (RDC + 1er), cette règle est sans objet.

### [AJOUT] RG15 — Seuil minimal de visites
Deux seuils s'appliquent :
1. **Immeuble de 30 à 99 logements** → visiter **10 % des lots** minimum (arrondi à l'entier supérieur)
2. **Immeuble de 100 logements ou plus** → visiter **10 logements + 5 % du total** minimum (arrondi à l'entier supérieur)

Si le nombre de logements requis par l'échantillonnage (RG11–RG14) est inférieur au seuil, l'algorithme complète avec des logements supplémentaires choisis aléatoirement ou selon les disponibilités.

### [AJOUT] RG16 — Jours disponibles du diagnostiqueur
1. Le diagnostiqueur choisit d'abord ses **jours disponibles** (un ou plusieurs) dans l'intervalle de la campagne
2. Les occupants reçoivent leur lien et ne peuvent sélectionner des créneaux que parmi ces jours-là
3. Le planning final croise : logements sélectionnés (RG11–RG15) + disponibilités compatibles des occupants

### [AJOUT] RG17 — Deux types d'emails
Après sélection des logements à visiter :
- **Option 1 — Logement non visité** : l'occupant reçoit un email d'information simple l'avertissant qu'une campagne d'audit a lieu dans l'immeuble, sans créneau de visite pour son logement
- **Option 2 — Logement visité** : l'occupant reçoit le créneau proposé + les coordonnées du diagnostiqueur pour confirmer
