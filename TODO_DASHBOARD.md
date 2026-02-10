n# Plan: Rendre le dashboard du dépanneur dynamique

## Tâches terminées:

### 1. ✅ Backend - DashboardController
- [x] Ajouter la méthode `depanneurDashboard()` - récupérer les stats du dépanneur connecté via Inertia
- [x] Ajouter la méthode `getDepanneurDemandes()` - récupérer les demandes disponibles dans ses zones
- [x] Ajouter la méthode `updateDepanneurStatus()` - changer le statut de disponibilité
- [x] Ajouter la méthode `acceptDemande()` - accepter une demande (crée une intervention)
- [x] Ajouter la méthode `refuseDemande()` - refuser une demande
- [x] Ajouter la méthode `startIntervention()` - démarrer une intervention
- [x] Ajouter la méthode `endIntervention()` - terminer une intervention (crée une facture)
- [x] Ajouter les méthodes helpers: `getRevenusJour()`, `getRevenusMois()`, `getRevenusTotal()`, `getNoteMoyenne()`, `formatDemandeForApi()`, `calculateDistance()`

### 2. ✅ Backend - Routes API
- [x] Modifier la route dashboard pour utiliser le contrôleur
- [x] Ajouter les routes API pour le dépanneur dans web.php

### 3. ✅ Frontend - Types TypeScript
- [x] Mettre à jour le type `DepanneurProfile` avec les propriétés optionnelles
- [x] Créer le type `ActiveIntervention` pour les interventions actives

### 4. ✅ Frontend - Routes API
- [x] Ajouter les routes API frontend dans `routes/index.ts`:
  - `depanneurStatus()` - POST /api/depanneur/status
  - `depanneurDemandes()` - GET /api/depanneur/demandes
  - `depanneurAcceptDemande(id)` - POST /api/depanneur/demandes/{id}/accepter
  - `depanneurRefuseDemande(id)` - POST /api/depanneur/demandes/{id}/refuser
  - `depanneurStartIntervention(id)` - POST /api/depanneur/interventions/{id}/start
  - `depanneurEndIntervention(id)` - POST /api/depanneur/interventions/{id}/end
  - `depanneurStats()` - GET /api/depanneur/stats

### 5. ✅ Frontend - Page depanneur-dashboard.tsx
- [x] Utiliser `usePage()` d'Inertia pour récupérer les données du dépanneur connecté
- [x] Remplacer les données mockées par les données réelles
- [x] Ajouter les handlers pour les actions API

## Prochaine étape:
- Compiler le projet avec `npm run dev`
- Tester le dashboard du dépanneur avec un compte réel


