# TODO - Rendre le dashboard admin dynamique

## Objectif
Remplacer les données statiques (mock data) par des données dynamiques provenant de l'API backend pour la gestion des clients et depanneurs.

## Modifications effectuées

### 1. Création du hook `use-admin-data.ts` ✅
- `useAdminData()` - Hook principal pour les statistiques, alertes et activités
- `useAdminClients()` - Hook pour les clients avec pagination et recherche
- `useAdminDepanneurs()` - Hook pour les depanneurs avec pagination, recherche et filtrage
- `useApi()` - Hook générique pour les requêtes API

### 2. Modification de `admin-dashboard.tsx` ✅
- Intégration des hooks de données dynamiques
- Ajout des états de chargement et d'erreur
- Bouton de rafraîchissement des données
- Gestion des onglets avec données dynamiques

### 3. Route API `recent-activities` ✅
- Ajout de la méthode `getRecentActivitiesApi()` dans DashboardController
- Ajout de la route `/admin/api/recent-activities`

### 4. Types TypeScript ✅
- Types AdminStats, AdminAlert, RecentActivity déjà définis
- Types Client, Depanneur, Zone déjà définis

## Étapes restantes

### 5. Modifier ClientsTable.tsx (Optionnel)
- Le composant accepte déjà les données depuis les props
- La recherche fonctionne via le hook `useAdminClients`

### 6. Modifier DepanneursTable.tsx (Optionnel)
- Le composant accepte déjà les données depuis les props
- Le filtrage par statut fonctionne via le hook `useAdminDepanneurs`

### 7. Modifier StatsCards.tsx (Optionnel)
- Accepte déjà les statistiques depuis les props

## Endpoints API disponibles
- `GET /admin/api/stats` - Statistiques globales
- `GET /admin/api/clients` - Liste des clients (paginé)
- `GET /admin/api/depanneurs` - Liste des depanneurs (paginé)
- `GET /admin/api/alerts` - Alertes admin
- `GET /admin/api/trends` - Données de tendances
- `GET /admin/api/recent-activities` - Activités récentes

## Notes
Le dashboard admin est maintenant dynamique ! Les données sont récupérées depuis l'API backend en temps réel avec :
- Pagination des clients et depanneurs
- Recherche en temps réel
- Filtrage par statut pour les depanneurs
- États de chargement et d'erreur
- Bouton de rafraîchissement manuel

