# Règle : Journal de bord automatique

📁 **Emplacement absolu du journal** :  
`C:\Users\wassi\projet-audit-energetique\docs\03_Journal_de_Bord.md`  
*(si le fichier n'existe pas, le créer à cet endroit)*

Déclenchement :
- Après chaque action que l'utilisateur décrit comme "je viens de faire X", "tâche exécutée : Y"
- Après chaque implémentation demandée par l'utilisateur

Comportement de l'IA :
1. Ouvre ou crée le fichier au chemin exact ci-dessus
2. Ajoute une nouvelle entrée au **début du fichier** (ordre antéchronologique)
3. Format de chaque entrée :
   ```markdown
   ## 📅 [DATE] — [HEURE]
   - **Tâche** : [description]
   - **Durée estimée** : [durée]
   - **Durée réelle** : [à demander ou "à compléter"]
   - **Statut** : 🔄 en cours / ✅ terminée / ⚠️ bloquée
   - **Fichiers modifiés** : [chemins relatifs depuis la racine]
   - **Notes** : [optionnel]
   ---
   ```
4. Ne supprime jamais d'entrées existantes
5. Si la durée réelle n'est pas connue, ajouter `⏳ à compléter` et demander à l'utilisateur

Exemple d'entrée :
```markdown
## 📅 2026-05-28 — 14:30
- **Tâche** : Implémentation CRUD campagnes (routes POST/GET/PUT/DELETE)
- **Durée estimée** : 3h
- **Durée réelle** : ⏳ à compléter
- **Statut** : ✅ terminée
- **Fichiers modifiés** : `routes/api.php`, `app/Models/Campagne.php`, `app/Http/Controllers/CampagneController.php`
- **Notes** : Suppression logique implémentée avec SoftDeletes
---
```
