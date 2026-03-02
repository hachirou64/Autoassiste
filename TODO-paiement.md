# Plan de configuration du paiement en ligne

## Étapes complétées ✅

- [x] 1. ✅ Corriger `DashboardController::endIntervention()` - Retourner les données de la facture créée
- [x] 2. ✅ Corriger `DemandeController::processPayment()` - Mettre à jour la facture existante
- [x] 3. ✅ Route API pour le paiement par facture (existante: FactureController::payerApi)
- [x] 4. ✅ PaymentForm supportant le paiement par ID de facture (existant)
- [x] 5. ✅ Mettre à jour le client dashboard pour afficher le bouton de paiement après intervention terminée
- [x] 6. ✅ Route web pour la page de paiement (existante: /client/paiement/{factureId})

## Résumé des modifications

### 1. DashboardController::endIntervention()
- **Fichier**: `app/Http/Controllers/DashboardController.php`
- **Correction**: Ajout de `$facture = ` devant `Facture::create()` pour récupérer l'instance de la facture créée et la retourner dans la réponse JSON

### 2. DemandeController::processPayment()
- **Fichier**: `app/Http/Controllers/DemandeController.php`
- **Correction**: La méthode cherche maintenant la facture EXISTANTE liée à l'intervention et la met à jour au lieu d'en créer une nouvelle

### 3. DashboardController::getClientDashboardData()
- **Fichier**: `app/Http/Controllers/DashboardController.php`
- **Amélioration**: Les données de la facture (`factureId`, `montant`, `factureStatus`) sont maintenant incluses dans `demande_active`

### 4. Types TypeScript
- **Fichier**: `resources/js/types/client.ts`
- **Ajout**: Champs `factureId`, `montant`, et `factureStatus` dans l'interface `DemandeActive`

### 5. Client Dashboard
- **Fichier**: `resources/js/pages/client-dashboard.tsx`
- **Ajout**: 
  - Import de `DemandeActive`
  - Fonction `handlePayer()` pour rediriger vers la page de paiement
  - Props `factureId`, `montant`, et callback `onPayer` passés à `InterventionTracker`

### Flux de paiement

1. Le dépanneur termine l'intervention → une facture est créée automatiquement
2. Le client voit le bouton "Payer maintenant" sur son dashboard
3. En cliquant, il est redirigé vers `/client/paiement/{factureId}`
4. Il choisit le mode de paiement et finalise
5. La facture est marquée comme payée
6. Le dépanneur est notifié du paiement

