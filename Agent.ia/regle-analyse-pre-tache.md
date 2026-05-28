# Règle : Analyse préalable avant modification

## Objectif

Avant d'écrire ou de modifier le moindre fichier, l'IA doit produire une **analyse structurée** du projet et de l'impact de la tâche demandée. **Aucune modification de code n'est autorisée** tant que l'utilisateur n'a pas validé l'analyse.

## Déclencheur

Cette règle s'applique à **toute tâche** qui implique de modifier, créer ou supprimer des fichiers de code, de configuration ou de documentation.

## Étapes obligatoires (ordre strict)

### 1. Comprendre la structure du projet

- Lister les dossiers racine et les fichiers de configuration majeurs (`package.json`, `Cargo.toml`, `pyproject.toml`, `Dockerfile`, `compose.yml`, etc.).
- Identifier le framework et le langage principal.

### 2. Lire les documents clés

| Document        | Utilité                                              |
|-----------------|------------------------------------------------------|
| `README.md`     | Objectif du projet, commandes de base                |
| `ARCHITECTURE.md` ou dossier `docs/` | Comprendre l'organisation du code |
| `CONTRIBUTING.md` (si existe)        | Conventions de contribution            |

### 3. Analyser le code existant concerné

- Chercher les fichiers proches de la zone de modification (même dossier, imports, dépendances).
- Vérifier les tests existants pour ne pas les casser.
- Identifier les patterns utilisés (ex. repository, service, controller, composant React, etc.).

### 4. Produire le rapport d'analyse

L'IA communique à l'utilisateur un message structuré :

````markdown
### Analyse préalable — *<nom de la tâche>*

**Structure identifiée :**
- Langage / framework : ...
- Dossiers impactés : ...
- Fichiers existants pertinents : ...

**Impact estimé :**
- Fichiers à modifier : ...
- Fichiers à créer : ...
- Risque de régression : ✅ Aucun / ⚠️ Faible / 🔴 Élevé (justifier)

**Proposition d'implémentation :**
- Courte description de l'approche (2-3 phrases max)

**Commande de validation :**
> `✅ Prêt à implémenter` — l'utilisateur répond ce message pour autoriser.
````

### 5. Attendre la validation explicite

- L'IA **ne fait rien** tant que l'utilisateur n'a pas répondu par une phrase contenant "prêt" ou "valide".
- En cas de refus ou de question, l'IA ajuste sa proposition.

## Règles impératives

- Ne jamais modifier du code sans validation.
- Si l'utilisateur dit « vas-y directement », considérer que l'analyse est implicite et passer à l'étape 5 comme si validée.
- L'analyse peut être courte si la tâche est triviale (ex. « corriger une typo » → juste citer le fichier et le changement).

## Exemple concret

**Tâche :** « Ajouter une route API GET /users/:id. »

1. L'IA liste la structure → projet Node.js/Express, dossier `routes/`, `controllers/`, `models/`.
2. Lit `README.md` → confirme les conventions de nommage.
3. Examine `routes/users.js` et `controllers/userController.js`.
4. Produit l'analyse :

> **Analyse préalable — *Route GET /users/:id***
>
> **Structure identifiée :**
> - Langage / framework : Node.js / Express
> - Dossiers impactés : `routes/`, `controllers/`
> - Fichiers existants pertinents : `routes/users.js`, `controllers/userController.js`
>
> **Impact estimé :**
> - Fichiers à modifier : `routes/users.js`, `controllers/userController.js`
> - Fichiers à créer : `middleware/validateId.js` (optionnel)
> - Risque de régression : ⚠️ Faible — route nouvelle, pas de breaking change
>
> **Proposition :**
> - Ajouter `getUserById` dans `userController`, ajouter la route dans `users.js`, utiliser `req.params.id`.
>
> **Commande de validation :**
> > `✅ Prêt à implémenter`

5. Attend la réponse de l'utilisateur avant d'écrire une ligne.
