# Règles de Gestion (RG)

**Projet :** Planif'Audit — Application de planification d'audits énergétiques
**Version :** 1.0

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
