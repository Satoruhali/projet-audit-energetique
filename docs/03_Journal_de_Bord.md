# 3. Journal de Bord

**Version :** 1.0 — 18/05/2026

---

| Date | Séance | Actions menées | Problèmes | Solutions |
|---|---|---|---|---|
| 18/05/2026 | 1 | Création du dossier professionnel v1.0 — rédaction du brief initial, des spécifications préliminaires et de la structure du dossier | Aucun | — |
| 18/05/2026 | 2 | Restructuration du dossier : passage de 1 fichier à 5 fichiers distincts. Déplacement du dossier vers `C:\Users\wassi\projet-audit-energetique\` | Aucun | — |
| 19/05/2026 | 3 | Ajout des sections suivantes dans `02_Specifications.md` : • Personas (3 profils) • User stories (10 stories) • Wireframes ASCII (3 écrans) • Parcours utilisateur • Cas d'utilisation (diagramme + 4 fiches) • Règles de gestion (10 règles) • Glossaire (10 termes). Le fichier spec est désormais un dossier de conception complet. | Aucun | — |
| 19/05/2026 | 4 | Génération du frontend complet (HTML/CSS/JS) via OpenCode — 3 vues : Dashboard, Détail campagne (onglets Réponses + Planning), Planning optimisé. Stack vanilla, responsive mobile-first. Palette : vert (#2ecc71), orange (#e67e22), bleu (#3498db). Implémentation RG3 (tri étage), RG4 (pas chevauchement), RG9 (pause 15 min). | Aucun | — |
| 19/05/2026 | 5 | Rédaction du fichier `index.html` : structure SPA avec 3 sections (view-dashboard, view-detail, view-planning), navigation par hash routing, barre sticky, cartes stats, formulaires création et modification, tableaux, timeline, toasts. | Aucun | — |
| 19/05/2026 | 6 | Rédaction du fichier `styles.css` : reset CSS, variables de palette, design mobile-first avec breakpoints à 480px/768px/1024px, composants (topbar, stats, cards, tables, tabs, timeline, badges, formulaires, toasts). Transitions et états hover/active. | Aucun | — |
| 19/05/2026 | 7 | Rédaction du fichier `script.js` : données mockées (3 campagnes, 15 locataires), hash routing SPA, interactions CRUD (création/suppression campagne), onglets détail, génération planning avec RG3/RG4/RG9, fonctions toast, timeline visuelle, relance individuelle/masse, export simulé, modification créneaux avec formulaire. | Aucun | — |
| 20/05/2026 | 8 | Restructuration complète de l'arborescence du projet Planif'Audit. Création dossiers Agent.ia/, skills/, prompts/, specifications/, docs/, backup/. Déplacement des .md racine vers docs/. Création de 6 fichiers specs modulaires (user-stories, personas, wireframes, regles-gestion, cas-utilisation, glossaire). Création config.json agent IA. Déplacement brief-projet.md vers specifications/. Mise à jour du journal de bord. | Aucun | — |
| 20/05/2026 | 9 | Refonte du formulaire de création de campagne : passage en 2 étapes (immeuble → locataires), ajout champs nom/email/téléphone/digicode, colonne Nom dans tous les tableaux, mise à jour mock data avec noms et emails. | Aucun | — |

---

## 20/05/2026 — Séance n°9 - Revue de conception

### Constat / Problème identifié :
Le formulaire de création de campagne actuel est trop limité. Il ne permet pas de saisir :
- Les noms des locataires
- Leurs adresses email (indispensable pour envoyer les invitations)
- Leurs numéros de téléphone
- Les codes d'accès / digicode

### Décision majeure :
**Refonte du formulaire de création de campagne** avec saisie individuelle des locataires.

### Nouveaux champs à ajouter par locataire :
| Champ | Obligatoire | Utilité |
|-------|-------------|---------|
| Nom complet | ✅ | Personnalisation |
| Email | ✅ | Envoi des liens d'invitation |
| Téléphone | ❌ | Relance SMS future |
| Numéro appartement | ✅ | Identification |
| Étage | ✅ | Planning (RG3) |
| Code d'accès | ❌ | Instructions visite |

### Architecture technique retenue :
- **Base de données** : MySQL
- **Backend** : Node.js + Express
- **Frontend** : HTML/CSS/JS (actuel à modifier)
- **Types d'utilisateurs** : 
  - Entrepreneur (admin) : création campagnes, consultation planning
  - Locataire : formulaire public pour choisir créneau

### Prochaines actions immédiates :
1. [x] Modifier le formulaire HTML en 2 étapes (immeuble → locataires)
2. [x] Ajouter la saisie dynamique des locataires en JavaScript
3. [x] Mettre à jour les mock data avec noms et emails
4. [x] Adapter l'affichage détail campagne pour montrer les noms
5. [ ] Modifier le schéma MySQL (ajout colonnes locataires)

### Blocages éventuels :
- Aucun blocage identifié, mais la modification du frontend est prioritaire avant le backend

### Notes complémentaires :
- L'import CSV sera une fonctionnalité secondaire (plus tard)
- Les emails d'invitation seront gérés après la refonte du formulaire
