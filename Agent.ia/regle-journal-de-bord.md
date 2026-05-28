# Règle : Journal de bord automatique

## 📁 Emplacement absolu du journal
`C:\Users\wassi\projet-audit-energetique\docs\03_Journal_de_Bord.md`

*(Si le fichier n'existe pas, le créer à cet emplacement exact)*

## 🔄 Déclencheurs (quand l'IA doit écrire dans le journal)

L'IA DOIT ajouter une entrée dans le journal quand :
1. L'utilisateur dit : *"je viens de faire X"*, *"tâche exécutée : Y"*, *"j'ai terminé Z"*
2. L'utilisateur demande explicitement de *"actualiser/mettre à jour le journal"*
3. Une implémentation est terminée (série de routes, correction de bug, tests passants)
4. Un blocage est identifié (ex: erreur 500, test qui échoue)
5. Une étape du projet est validée (ex: tous les tests ✅)

## 📝 Format OBLIGATOIRE de chaque entrée

```markdown
## 📅 [AAAA-MM-JJ] — [HH:MM]
- **Tâche** : [description précise de l'action réalisée]
- **Durée estimée** : [durée en heures/minutes]
- **Durée réelle** : [durée ou "⏳ à compléter"]
- **Statut** : 🔄 en cours / ✅ terminée / ⚠️ bloquée
- **Fichiers modifiés** : `[chemins relatifs depuis la racine]`
- **Notes** : [optionnel, ex: erreur rencontrée, solution trouvée]
---