# Intégration Payment Gateway - FedaPay (Benin)

## Résumé

L'intégration du paiement via FedaPay est maintenant complète. FedaPay est un payment gateway africain qui gère :
- MTN MoMo
- Moov Money
- Cartes bancaires (Visa, Mastercard)

Cette intégration est plus simple à configurer et à utiliser que l'API MTN MoMo directe.

## Fichiers créés

### Backend (Laravel)
- `config/fedapay.php` - Configuration FedaPay
- `app/Services/FedaPayService.php` - Service API pour les paiements
- `app/Http/Controllers/FedaPayController.php` - Contrôleur API REST

### Base de données
- `database/migrations/2026_02_26_000000_add_momo_fields_to_factures_table.php` - Migration mise à jour avec champs FedaPay

### Frontend (React/TypeScript)
- `resources/js/components/client/payment-form.tsx` - Interface de paiement modernisée

## Configuration

### 1. Variables d'environnement à ajouter dans .env

```env
# FedaPay Configuration
FEDAPAY_ENVIRONMENT=sandbox  # ou 'live' pour production
FEDAPAY_API_KEY=votre_api_key
FEDAPAY_SECRET_KEY=votre_secret_key
FEDAPAY_CALLBACK_URL=/api/fedapay/callback
FEDAPAY_RETURN_URL=/client/dashboard
```

### 2. Créer un compte FedaPay

1. Rendez-vous sur [FedaPay](https://fedapay.com/)
2. Créez un compte développeur
3. Récupérez vos API Keys dans le dashboard
4. Configurez les URLs de callback dans le dashboard FedaPay

### 3. Exécuter la migration

```bash
php artisan migrate
```

## Fonctionnalités

- ✅ Paiement Mobile Money (MTN, Moov)
- ✅ Paiement par carte bancaire
- ✅ Paiement en espèces
- ✅ Interface utilisateur modernisée
- ✅ Suivi du statut en temps réel
- ✅ Webhook pour notifications de paiement
- ✅ Fallback vers API MTN MoMo si FedaPay non configuré

## Détails techniques

- **API Base URL (Sandbox)**: https://sandboxapi.fedapay.com
- **API Base URL (Production)**: https://api.fedapay.com
- **Devise**: XOF (Franc CFA)
- **Pays supportés**: Benin, Burkina Faso, Côte d'Ivoire, Senegal

