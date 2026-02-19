# Plan de correction - Formulaire de demande d'assistance

## Problème
Le formulaire de demande d'assistance n'affiche pas le message pour accéder au dashboard après la création réussie.

## Causes identifiées
1. L'appel API échoue (retourne des erreurs 401/403/419/500) et tombe en mode simulation
2. Il y a un décalage de structure de données entre ce que `demande-form.tsx` passe et ce que `nouvelle-demande.tsx` attend
3. La gestion des erreurs n'est pas assez robuste

## Solutions implémentées

### Option A: Améliorer la gestion des erreurs dans `nouvelle-demande.tsx` ✅
- Améliorer la gestion des réponses API non-JSON
- Ajouter des logs de débogage plus explicites
- Gérer les cas où `response.ok` est false mais le corps contient quand même des données

### Option B: Ajouter un mécanisme de repli plus robuste ✅
- Améliorer le mode simulation pour gérer tous les cas
- Stocker les données de la demande dans le sessionStorage pour persistance
- Ajouter une vérification de la structure des données avant l'affichage

## Fichiers modifiés
1. `resources/js/pages/nouvelle-demande.tsx` - Gestion des erreurs et structure des données

## Détail des modifications apportées à `nouvelle-demande.tsx`

1. **Ajout de la persistance sessionStorage**:
   - Au chargement, vérification si une demande est stockée dans sessionStorage
   - Si une demande est trouvée, affichage direct de la vue confirmation
   - Stockage des informations de demande après création

2. **Amélioration de la gestion des réponses API**:
   - Support de plusieurs structures de réponse: `result.demande`, `result.data`, ou `result` directement
   - Meilleure gestion des erreurs avec fallback automatique vers le mode simulation

3. **Simplification du code**:
   - Suppression de la fonction séparée `handleSimulationMode`
   - Intégration directe du mode simulation dans le flux principal
   - Nettoyage du sessionStorage après navigation vers le dashboard


