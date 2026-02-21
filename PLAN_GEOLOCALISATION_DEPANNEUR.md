# TODO - Géolocalisation des dépanneurs

## Objectif
Implémenter la géolocalisation automatique des dépanneurs lors de la connexion avec mise à jour périodique en arrière-plan.

## Tâches terminées

### Backend
- [x] Migration pour ajouter le champ `derniere_position_at` dans la table `depanneurs`
- [x] mise à jour du modèle `Depanneur.php`:
  - [x] Ajout du champ `derniere_position_at` dans `$fillable`
  - [x] Ajout du cast pour le timestamp
  - [x] Méthode `mettreAJourPositionAvancee()` avec validation et rate limiting
  - [x] Méthode `validerPosition()` pour valider les bounds du Bénin
  - [x] Méthode `positionRecente()` pour vérifier si la position est récente
- [x] Amélioration du `DashboardController.php`:
  - [x] Amélioration de `updateLocation()` avec validation, rate limiting et réponse enrichie
  - [x] Ajout de `getLocation()` pour récupérer la position actuelle

### Routes API
- [x] Ajout de la route GET `/api/depanneur/location`

### Frontend
- [x] Création du hook `useDepanneurGeolocation.ts` pour:
  - [x] Détection automatique de la position via l'API Geolocation
  - [x] Envoi automatique au serveur
  - [x] Mise à jour automatique toutes les 30 secondes
  - [x] Gestion des erreurs et permissions
- [x] Création du composant `DepanneurGeolocationStatus.tsx` pour:
  - [x] Affichage du statut de géolocalisation
  - [x] Boutons pour activer/désactiver le suivi
  - [x] Indicateur de précision GPS
  - [x] Affichage de la dernière synchronisation
- [x] Intégration dans le dashboard du dépanneur (`depanneur-dashboard.tsx`)

## Tâches restantes

- [ ] Exécuter la migration: `php artisan migrate`
- [ ] Tester l'API de géolocalisation
- [ ] Tester l'intégration frontend

## Détails techniques

### Format des coordonnées
- Stockage: `"lat,lng"` (ex: "6.4968,2.6289")
- Latitude: 6° - 13° (Bénin)
- Longitude: 0° - 4° (Bénin)

### Protection contre les abus
- Limiter à 1 mise à jour toutes les 10 secondes
- Valider que les coordonnées sont dans les bounds du Bénin

### Paramètres de configuration
- Intervalle de mise à jour: 30 secondes (configurable)
- Précision minimum acceptée: 1000m
- Timeout de géolocalisation: 10 secondes

