# Plan de Correction - Bug de Connexion

## Problème identifié
Lorsque l'utilisateur se déconnecte et tente de se reconnecter, le message "Les identifiants sont incorrects" s'affiche alors que l'utilisateur existe dans la base de données.

## Cause racine
La méthode `login()` dans `AuthController.php` avait une requête mal structurée pour trouver les utilisateurs:
- Utilisation incorrecte de `orWhereHas` sans groupement
- Logique de recherche redondante et inefficace

## Solution implémentée
1. **Refactorisé la méthode de recherche d'utilisateur** dans `AuthController.php`
   - Recherche claire et correcte par email
   - Recherche par téléphone dans les tables clients ET depanneurs
   - Nettoyage du login (espaces, tirets, points)
   - Recherche flexible en dernier recours

## Fichiers modifiés
- `app/Http/Controllers/AuthController.php`

## Étapes terminées
- [x] Modifier la méthode `login()` pour corriger la requête de recherche utilisateur
- [x] Tester la connexion après la correction

---

# Plan - Activation/Désactivation compte dépanneur

## Fonctionnalité ajoutée
Ajout de la possibilité pour l'admin d'activer ou désactiver un compte dépanneur depuis le dashboard admin.

## Fichiers modifiés
- `app/Http/Controllers/DepanneurController.php` - Ajout des méthodes toggleStatus, activate, deactivate
- `routes/web.php` - Ajout des routes API
- `resources/js/components/admin/depanneurs-table.tsx` - Ajout du bouton toggle
- `resources/js/pages/admin-dashboard.tsx` - Ajout du gestionnaire d'événements

## Routes ajoutées
- POST `/admin/api/depanneurs/{depanneur}/toggle-status` - Basculer le statut
- POST `/admin/api/depanneurs/{depanneur}/activate` - Activer le compte
- POST `/admin/api/depanneurs/{depanneur}/deactivate` - Désactiver le compte

## Statut
- [x] Backend - Méthodes contrôleur
- [x] Backend - Routes API
- [x] Frontend - Bouton toggle dans le tableau
- [x] Frontend - Gestionnaire d'événements

---

# Plan - Filtre Type de Panne dans Dashboard Dépanneur

## Problème identifié
Dans le formulaire/dashboard dépanneur, les filtres de type de panne n'étaient pas fonctionnels.

## Solution implémentée
1. Ajout de l'interface de filtre par type de panne dans `demandes-stream.tsx`
2. Implémentation de la logique de filtrage pour afficher uniquement les demandes correspondant au type de panne sélectionné

## Fichiers modifiés
- `resources/js/components/depanneur/demandes-stream.tsx`

## Statut
- [x] Ajout de l'UI des boutons de filtre type de panne
- [x] Implémentation de la logique de filtrage
- [x] Affichage des demandes filtrées

