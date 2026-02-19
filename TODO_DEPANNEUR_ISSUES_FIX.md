# Plan de correction - Problèmes Dépanneur

## Problèmes identifiés

### Problème 1: Distance et temps affichés à 0 sur la carte
**Cause**: Les dépanneurs nouvellement inscrits n'ont pas de `localisation_actuelle` définie dans leur profil.

### Problème 2: Les dépanneurs ne reçoivent pas les demandes dynamiquement
**Cause**: 
1. Le scope `disponible()` dans le modèle Depanneur filtre par `status = disponible` ET `isActive = true`
2. Les nouveaux dépanneurs ont `isActive = false` par défaut (en attente d'activation admin)
3. Les notifications ne sont créées que pour les dépanneurs qui passent le filtre

## Solutions à implémenter

### 1. Modifier le scope de recherche des dépanneurs pour ignorer isActive lors de la recherche
Dans `DemandeController.php`, modifier `findNearbyDepanneurs` pour chercher tous les dépanneurs actifs (isActive=true) mais pas nécessairement en statut "disponible"

### 2. Modifier la logique de notification pour envoyer aux dépanneurs actifs
- Envoyer les notifications aux dépanneurs avec `isActive = true` peu importe leur statut
- Le dépanneur doit accepter la demande pour devenir "occupé"

### 3. Ajouter une valeur par défaut de localisation pour les nouveaux dépanneurs
Dans le registration du dépanneur, définir une localisation par défaut (comme le centre de Cotonou)

### 4. Récupérer la localisation réelle du dépanneur dans le dashboard
Dans `depanneur-dashboard.tsx`, utiliser la localisation du profil au lieu des valeurs codées

## Fichiers à modifier
1. `app/Http/Controllers/DemandeController.php` - Logique de notification
2. `app/Models/Depanneur.php` - Scope disponible
3. `resources/js/pages/depanneur-dashboard.tsx` - Utiliser la localisation du profil

