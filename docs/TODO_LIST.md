# TO DO LIST – Projet Audit Énergétique (v2.0 — Échantillonnage réglementaire)

| Date | Objectifs du jour | Statut | Remarques |
|------|-------------------|--------|------------|
| **Phase 1 — Mise à jour des spécifications** ||||
| 21/05 | Enrichir la documentation avec les règles d'échantillonnage (RG11–RG17) | ✅ Terminé | Nouveau périmètre fonctionnel |
| 21/05 | Mettre à jour tous les fichiers specs (stories, cas, glossaire, personas, wireframes) | ✅ Terminé | Cohérence globale v2.0 |
| **Phase 2 — Backend (API REST)** ||||
| 22/05 | Initialiser Node.js + dépendances + connexion MariaDB | ⬜ À faire | |
| 22/05 | Mettre à jour le schéma BDD : tables typologies, planchers, jours_disponibles | ⬜ À faire | Obéit aux RG11–RG14 |
| 22/05 | Créer les modèles SQL pour toutes les tables (5 existantes + nouvelles) | ⬜ À faire | |
| 23/05 | Implémenter l'algorithme de sélection des logements (set cover) | ⬜ À faire | Algorithme cœur (RG11–RG15) |
| 23/05 | Créer les routes et controllers pour les critères immeuble et la sélection | ⬜ À faire | Endpoints échantillonnage |
| 23/05 | Implémenter l'authentification JWT | ⬜ À faire | |
| **Phase 3 — Disponibilités croisées** ||||
| 24/05 | Implémenter la sélection des jours disponibles du diagnostiqueur | ⬜ À faire | RG16 |
| 24/05 | Filtrer le calendrier des occupants selon les jours disponibles | ⬜ À faire | |
| 24/05 | Implémenter le croisement disponibilités → planning final | ⬜ À faire | |
| 25/05 | Adapter l'ordonnancement existant (RG3, RG4, RG9) au nouveau flux | ⬜ À faire | |
| **Phase 4 — Communication** ||||
| 25/05 | Créer le module d'envoi d'emails différenciés (nodemailer) | ⬜ À faire | RG17 |
| 25/05 | Ajouter la prévisualisation des emails | ⬜ À faire | |
| **Phase 5 — Frontend** ||||
| 26/05 | Interface de configuration de l'immeuble (typologies, planchers) | ⬜ À faire | Écran 4 des wireframes |
| 26/05 | Interface de résultat de l'algorithme (complet/incomplet) | ⬜ À faire | Écran 5 |
| 26/05 | Interface de sélection des jours disponibles | ⬜ À faire | Écran 6 |
| 27/05 | Brancher le frontend existant aux vraies API | ⬜ À faire | Remplacer mock data |
| **Phase 6 — Tests** ||||
| 27/05 | Tests unitaires de l'algorithme de sélection | ⬜ À faire | |
| 28/05 | Tests d'intégration des contraintes RG11–RG17 | ⬜ À faire | |
| 28/05 | Tests E2E du parcours complet (création → sélection → dispo → planning → emails) | ⬜ À faire | |
| **Phase 7 — Finalisation** ||||
| 29/05 | Documentation technique complète | ⬜ À faire | |
| 29/05 | Déploiement (Render / Railway / VPS) | ⬜ À faire | |
| 30/05 | Corrections finales et livraison | ⬜ À faire | | |

**Légende** :  
- ⬜ À faire  
- 🟡 En cours  
- ✅ Terminé


