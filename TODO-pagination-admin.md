# TODO - Pagination Admin Dashboard

## Étapes complétées:

- [x] 1. Modifier DashboardController pour supporter la pagination (getAlerts, getRecentActivitiesApi)
- [x] 2. Mettre à jour les routes API
- [x] 3. Mettre à jour le hook useAdminData (ajout des hooks paginés)
- [x] 4. Mettre à jour AlertsPanel avec pagination (composant frontend)
- [x] 5. Mettre à jour RecentActivities avec pagination (composant frontend)

## Ce qui a été fait:
- Backend: API getRecentActivitiesApi avec pagination
- Backend: Nouvelle API getAlertsWithPagination avec pagination par type
- Backend: Routes API ajoutées
- Frontend: Hooks useAdminAlertsPaginated et useAdminActivitiesPaginated créés
- Frontend: AlertsPanel et RecentActivities avec contrôles de pagination

