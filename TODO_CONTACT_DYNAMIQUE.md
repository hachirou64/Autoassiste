# TODO - Page Contact Dynamique

## Objectif
Rendre la page contact dynamique avec possibilité pour l'admin de voir et répondre aux messages

## Tâches

### 1. Types TypeScript
- [x] Migration table contact_messages - FAIT
- [x] Model ContactMessage.php - FAIT
- [x] Controller API ContactController.php - FAIT
- [x] Routes API - FAIT
- [x] Ajouter le type TypeScript ContactMessage dans admin.ts - FAIT
- [x] Exporter le type dans index.ts (pas nécessaire car déjà dans admin.ts)

### 2. Hook pour les données
- [x] Créer le hook useContactMessages dans use-admin-data.ts - FAIT

### 3. Composant Admin
- [x] Créer le composant ContactMessagesPanel.tsx pour afficher les messages - FAIT
- [x] Intégrer dans admin-dashboard.tsx - FAIT
- [x] Ajouter l'item "Messages" dans la navigation admin - FAIT

## Status: TERMINÉ ✅

