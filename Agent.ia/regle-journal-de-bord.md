# Règle : Mise à jour automatique du journal de bord

## Objectif

Chaque fois que l'IA exécute une tâche pour le compte de l'utilisateur, elle doit enregistrer une entrée dans `journal-de-bord.md` à la racine du projet. L’historique des entrées est conservé — jamais supprimé.

## Format d'une entrée

```markdown
## [YYYY-MM-DD HH:mm]

- **Tâche** : brève description impérative (ex. "Ajout de la fonction de connexion")
- **Contexte** : pourquoi cette tâche est nécessaire (1 phrase max)
- **Durée estimée** : X min
- **Durée réelle** : X min
- **État** : `✅ Terminée` | `🔄 En cours` | `❌ Bloquée`
- **Fichiers modifiés** :
  - `chemin/vers/fichier1.ext`
  - `chemin/vers/fichier2.ext`
- **Notes** : (optionnel) décision, difficulté, ou prochaine étape
```

## Déclencheurs

1. **Fin de tâche** → l'IA ajoute automatiquement l'entrée avec l'état `✅ Terminée`.
2. **Début de tâche longue** → l'IA ajoute une entrée avec l'état `🔄 En cours` avant de commencer.
3. **Blocage** → l'IA ajoute une entrée avec l'état `❌ Bloquée` et décrit le blocage dans les notes.

## Règles impératives

- Toujours **ajouter** une nouvelle ligne — ne jamais écraser ni réécrire les entrées passées.
- La durée réelle est mesurée depuis le début de la tâche (ou depuis la dernière entrée `🔄 En cours`).
- Si l'utilisateur donne une tâche, l'IA peut estimer la durée et l'enregistrer en `🔄 En cours` immédiatement.
- Si le fichier `journal-de-bord.md` n'existe pas, l'IA le crée avec un en-tête `# Journal de bord` avant la première entrée.

## Exemple concret

**Tâche reçue :** « Ajouter une validation email sur le formulaire d'inscription. »

1. L'IA estime 15 min, crée une entrée `🔄 En cours`, et travaille.
2. Une fois terminé, l'IA met à jour l'entrée existante et ajoute un bloc final `✅ Terminée` :

```markdown
## [2026-05-28 14:30]

- **Tâche** : Validation email sur le formulaire d'inscription
- **Contexte** : Empêcher les inscriptions avec des emails invalides
- **Durée estimée** : 15 min
- **Durée réelle** : 12 min
- **État** : `✅ Terminée`
- **Fichiers modifiés** :
  - `src/validators/email.ts`
  - `src/components/InscriptionForm.tsx`
- **Notes** : Utilisation d'une regex RFC 5322 simplifiée
```
