# TODO: Correction de l'affichage des clients dans le dashboard admin

## Problème
Les clients existent dans la base de données mais n'apparaissent pas dans le dashboard admin.

## Étapes de correction

### Étape 1: Corriger le DashboardController::clientsApi()
- [ ] S'assurer que les dates sont formatées en ISO string
- [ ] Vérifier que tous les champs requis sont présents
- [ ] Ajouter une gestion d'erreurs robuste

### Étape 2: Corriger le type Client dans admin.ts
- [ ] Vérifier que le type correspond exactement à ce que l'API retourne
- [ ] Ajouter updatedAt si nécessaire

### Étape 3: Vérifier les données dans la base
- [ ] Vérifier que tous les clients ont createdAt de défini

### Étape 4: Tester l'API
- [ ] Tester manuellement /admin/api/clients
- [ ] Vérifier que le frontend affiche les données correctement

## Notes
- Le seeder crée 10 clients + 3 via l'API inscription = 13 clients
- L'API clientsApi() retourne du JSON paginé

