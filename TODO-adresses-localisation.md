# TODO: Afficher les adresses au lieu des coordonnées GPS

## Problème
L'application affiche les coordonnées GPS (ex: "6,3619132,2,3976987") au lieu d'afficher une adresse lisible (ville, quartier, rue).

## Solution
Utiliser l'API de géocodage inverse (`/api/geocode/reverse`) pour convertir les coordonnées en adresse lisible.

## Étapes terminées ✅

### 1. ✅ Créer un hook React pour le géocodage inverse
- [x] Créer `resources/js/hooks/useGeocoding.ts` pour réutiliser la logique de géocodage

### 2. ✅ Mettre à jour les composants d'affichage

#### Client Dashboard
- [x] `resources/js/components/client/intervention-tracker.tsx` - Adresse dans le tracker
- [x] `resources/js/components/client/demande-list.tsx` - Liste des demandes

#### Depanneur Dashboard
- [x] `resources/js/components/depanneur/demandes-stream.tsx` - Demandes en streaming
- [x] `resources/js/components/depanneur/current-intervention.tsx` - Intervention en cours (2 endroits: localisation + adresse complète)

## API disponible
- **Reverse Geocoding**: `GET /api/geocode/reverse?latitude=6.36&longitude=2.39`
- Retourne: `{ success: true, data: { formatted_address: "Rue de la Paix, Cotonou, Bél", city: "Cotonou", suburb: "Akpakpa", ... } }`

## Notes
- L'API Nominatim est gratuite mais limitée à 1 requête/seconde
- Les résultats sont mis en cache pour éviter les requêtes répétées
- Si l'API échoue, les coordonnées sont affichées en fallback

