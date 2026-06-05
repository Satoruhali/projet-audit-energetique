---
name: journal
description: /journal — Ajoute une entrée dans le journal de bord du projet. Use when the user says /journal, "ajoute au journal", "écris dans le journal", "mets à jour le journal de bord", or wants to log a session.
---

# Journal de Bord — Skill

Ajoute une nouvelle entrée dans le journal de bord du projet Planif'Audit.

## Emplacement du fichier

`C:\Users\wassi\projet-audit-energetique\docs\03_Journal_de_Bord.md`

## Format obligatoire de chaque entrée

```markdown
## 📅 [AAAA-MM-JJ] — [HH:MM]
- **Tâche** : [description précise de l'action réalisée]
- **Durée estimée** : [durée en heures/minutes]
- **Durée réelle** : [durée ou "⏳ à compléter"]
- **Statut** : 🔄 en cours / ✅ terminée / ⚠️ bloquée
- **Fichiers modifiés** : `[chemins relatifs depuis la racine]`
- **Notes** : [optionnel, ex: erreur rencontrée, solution trouvée]
---
```

## Règles

1. Lire le fichier existant avant d'écrire pour connaître les dernières entrées.
2. Ajouter la nouvelle entrée à la suite du fichier.
3. Si le fichier n'existe pas, le créer avec l'en-tête `# 3. Journal de Bord`.
