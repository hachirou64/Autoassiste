# Plan: Conversion Thème Sombre → Thème Clair (Dashboard Dépanneur)

## Résumé de l'analyse

### Composants déjà en thème clair
- ✅ `depanneur-profile.tsx` - utilise déjà `bg-white`, `text-gray-900`, etc.

### Composants à convertir en thème clair
- ❌ `depanneur-dashboard.tsx` - page principale
- ❌ `depanneur-stats.tsx` - cartes de statistiques
- ❌ `availability-toggle.tsx` - gestion disponibilité
- ❌ `demandes-stream.tsx` - flux de demandes
- ❌ `current-intervention.tsx` - intervention en cours
- ❌ `intervention-history.tsx` - historique des interventions
- ❌ `financial-dashboard.tsx` - finances
- ❌ `depanneur-notifications.tsx` - notifications
- ❌ `depanneur-geolocation-status.tsx` - géolocalisation
- ❌ `depanneur-map.tsx` - carte (à vérifier)

##Mappings de couleurs (Dark → Light)

| Élément | Dark Theme | Light Theme |
|---------|------------|-------------|
| Background principal | `bg-slate-950` | `bg-gray-50` |
| Background header mobile | `bg-slate-900` | `bg-white` |
| Sidebar background | `bg-slate-900` | `bg-white` |
| Sidebar border | `border-slate-700` | `border-gray-200` |
| Card background | `bg-slate-800/50` | `bg-white` |
| Card border | `border-slate-700` | `border-gray-200` |
| Bouton primary | `bg-amber-500` | `bg-amber-500` |
| Texte principal | `text-white` | `text-gray-900` |
| Texte secondaire | `text-slate-400` | `text-gray-500` |
| Texte tertiary | `text-slate-300` | `text-gray-600` |

## Étapes de conversion

### Étape 1: depanneur-dashboard.tsx
- Header mobile: `bg-slate-900` → `bg-white`
- Sidebar: `bg-slate-900`, `border-slate-700` → `bg-white`, `border-gray-200`
- Main content: `bg-slate-950` → `bg-gray-50`
- Tous les textes: `text-white`, `text-slate-400` → adaptations

### Étape 2: depanneur-stats.tsx
- Cards: `bg-slate-800/50`, `border-slate-700` → `bg-white`, `border-gray-200`
- Titres: `text-white` → `text-gray-900`

### Étape 3: availability-toggle.tsx
- Container: `bg-slate-800/50`, `border-slate-700` → `bg-white`, `border-gray-200`
- Status badges et buttons: adaptations nécessaires

### Étape 4: demandes-stream.tsx
- Cards: `bg-slate-800/50`, `border-slate-700` → `bg-white`, `border-gray-200`
- Filtres et badges: adaptations

### Étape 5: current-intervention.tsx
- Cards: `bg-slate-800/50`, `border-slate-700` → `bg-white`, `border-gray-200`
- Timer et formulaires: adaptations

### Étape 6: intervention-history.tsx
- Cards et tableaux: conversions similaires

### Étape 7: financial-dashboard.tsx
- Cards, graphiques, onglets: conversions similaires

### Étape 8: depanneur-notifications.tsx
- Card: conversion similaire

### Étape 9: depanneur-geolocation-status.tsx
- Card: conversion similaire

## Critères de succès
- Tous les composants doivent avoir un fond clair (blanc ou gris clair)
- Le texte doit être lisible (gris foncé sur fond clair)
- Les bordures doivent être discrètes (gris clair)
- Les éléments interactifs doivent rester visibles et fonctionnels

