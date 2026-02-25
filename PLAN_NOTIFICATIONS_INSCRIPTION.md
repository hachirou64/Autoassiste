# Plan: Notifications d'inscription utilisateur

## Objectif
Notifier les utilisateurs par email et/ou SMS lorsqu'ils créent un compte sur l'application GoAssist.

## Analyse du code existant

### Flux de création de compte actuel
1. **Client**: `ClientRegistrationController::register()` - Crée Client + Utilisateur
2. **Dépanneur**: `DepanneurController::store()` - Crée Depanneur + Utilisateur  
3. **Admin**: `ClientController::storeApi()` - Crée Client via admin

### Notifications existantes
- Le système utilise déjà `Notification::create()` pour les notifications in-app
- Pas de Mails ou SMS configurés actuellement

## Implémentation prévue

### 1. Notifications par Email

#### Étape 1.1: Créer les Mails Laravel
- `app/Mail/WelcomeClient.php` - Email de bienvenue pour client
- `app/Mail/WelcomeDepanneur.php` - Email de bienvenue pour depanneur
- `app/Mail/AccountCreatedByAdmin.php` - Email quand admin crée le compte

#### Étape 1.2: Mettre à jour les Controllers
- `ClientRegistrationController::register()` - Envoyer email de bienvenue
- `DepanneurController::store()` - Envoyer email de bienvenue
- `ClientController::storeApi()` - Envoyer email quand créé par admin

### 2. Notifications par SMS

#### Option A: SMS via API externe (Twilio, etc.)
- Nécessite configuration API payante
- Non implémenté pour le moment

#### Option B: Simulation SMS (Log)
- Écrire dans les logs pour demonstration
- Peut être remplacé par vraie API plus tard

#### Option C: SMS via Free Mobile (France)
- Service gratuit pour clients Free
- Solution simple si utilisateurs francophones

### 3. Service de notification centralisé

Créer `app/Services/NotificationService.php`:
```php
class NotificationService
{
    public function sendWelcomeEmail($user, $type);
    public function sendWelcomeSMS($user, $type);
    public function sendWelcomeNotification($user, $type);
}
```

## Fichiers à créer/modifier

### Nouveaux fichiers
1. `app/Mail/WelcomeClient.php`
2. `app/Mail/WelcomeDepanneur.php`  
3. `app/Mail/AccountCreatedByAdmin.php`
4. `app/Services/NotificationService.php`

### Fichiers à modifier
1. `app/Http/Controllers/Api/ClientRegistrationController.php`
2. `app/Http/Controllers/DepanneurController.php`
3. `app/Http/Controllers/ClientController.php`

## Configuration requise

### Email
- Configurer `.env`:
  ```
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.gmail.com
  MAIL_PORT=587
  MAIL_USERNAME=your-email@gmail.com
  MAIL_PASSWORD=your-app-password
  MAIL_ENCRYPTION=tls
  MAIL_FROM_ADDRESS=noreply@goassist.com
  MAIL_FROM_NAME="${APP_NAME}"
  ```

### SMS (Optionnel)
- Configuration API SMS dans `.env`
- Variables: `SMS_API_KEY`, `SMS_SENDER`, etc.

## Dépendances Composer à installer (si needed)
- Pour SMS: `twilio/sdk` ou autre package

## Tests
- Vérifier que les emails sont envoyés lors de l'inscription
- Vérifier que les SMS sont envoyés (si configuré)
- Vérifier que les notifications in-app sont créées

