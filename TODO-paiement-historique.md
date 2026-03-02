# TODO - Ajout du bouton de paiement dans l'historique

## Étapes complétées ✅

- [x] 1. Mettre à jour le type `InterventionHistoryItem` pour inclure `factureStatus`
- [x] 2. Mettre à jour `InterventionHistory` pour ajouter le bouton "Payer maintenant"
- [x] 3. Mettre à jour `DashboardController` pour retourner `factureStatus` dans l'historique
- [x] 4. Mettre à jour `client-dashboard.tsx` pour passer la fonction de paiement

## Détails des modifications

### 1. Type TypeScript (`resources/js/types/client.ts`)
- Ajout de `factureStatus?: string` à `InterventionHistoryItem`

### 2. Composant InterventionHistory (`resources/js/components/client/intervention-history.tsx`)
- Ajout prop `onPayer?: (factureId: number) => void`
- Ajout du bouton "Payer maintenant" quand `factureStatus === 'en_attente'`

### 3. DashboardController (`app/Http/Controllers/DashboardController.php`)
- Dans `getClientDashboardData()`, inclusion de `factureStatus` dans l'historique

### 4. client-dashboard.tsx (`resources/js/pages/client-dashboard.tsx`)
- Ajout fonction `handlePayer` pour rediriger vers le paiement
- Passage de `onPayer` au composant `InterventionHistory`
- Mapping de `factureStatus` depuis l'API

