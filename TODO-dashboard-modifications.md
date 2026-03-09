# TODO - Modifications Dashboard Dépanneur

## Tâche 1: Améliorer la fonction Demandes
- [x] Analyser le code existant
- [x] Supprimer les sections "Carte intervention" et "Demande disponible" de l'Overview
- [x] La vue Demandes existe déjà et est bien conçue

## Tâche 2: Ajouter notifications avancées avec filtres et pagination
- [x] Mettre à jour le composant depanneur-notifications.tsx
- [x] Ajouter filtres par type (nouvelle_demande, rappel, evaluation, message, system, paiement_recu, etc.)
- [x] Ajouter pagination
- [x] Mettre à jour l'API DashboardController pour supporter filtres et pagination
- [x] Mettre à jour les types TypeScript (NotificationType)

## Tâche 3: Afficher la liste des interventions
- [x] Le composant InterventionHistory existe déjà
- [x] Accessible via l'onglet 'history'

## Tâche 4: Notification client au démarrage d'intervention
- [x] Modifier DashboardController::startIntervention() pour créer notification client
- [x] Type de notification: 'intervention_demalee'
- [x] Message: "Le dépanneur [nom] a démarré l'intervention sur votre demande [code]"

## Tâche 5: Ajouter onglet Notifications dans la navigation
- [x] Ajouter 'notifications' aux navItems
- [x] Ajouter 'notifications' au type TabType
- [x] Ajouter le case dans renderTabContent
- [x] Ajouter le titre dans getPageTitle
- [x] Ajouter les handlers pour marquer comme lu
- [x] Ajouter la route API markAllNotificationsRead

## Fichiers modifiés:
1. resources/js/pages/depanneur-dashboard.tsx
2. resources/js/components/depanneur/depanneur-notifications.tsx
3. resources/js/types/depanneur.ts
4. app/Http/Controllers/DashboardController.php
5. routes/web.php

## Progression: TERMINÉ ✓

