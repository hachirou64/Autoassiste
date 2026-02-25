# Configuration des Notifications (Email & SMS)

Ce guide explique comment configurer les notifications par email et SMS pour l'application GoAssist.

## Table des matières
1. [Configuration Email (SMTP)](#configuration-email-smtp)
2. [Configuration SMS](#configuration-sms)
3. [Activation/Désactivation des notifications](#activationdésactivation-des-notifications)

---

## Configuration Email (SMTP)

### Étape 1: Modifier le fichier `.env`

Ajoutez ou modifiez les variables suivantes dans votre fichier `.env`:

```
env
# =============================================================================
# CONFIGURATION EMAIL - SMTP
# =============================================================================

# Mode mailer: smtp, sendmail, log, array
MAIL_MAILER=smtp

# Hôte SMTP (exemples courants)
# Gmail: smtp.gmail.com
# Outlook: smtp.office365.com
# Mailtrap (développement): smtp.mailtrap.io
MAIL_HOST=smtp.gmail.com

# Port SMTP
# 587 (TLS)
# 465 (SSL)
MAIL_PORT=587

# Nom d'utilisateur SMTP
# Pour Gmail: votre email complet (ex:@gmail.com)
MAIL_USERNAME=your-email@gmail.com

# Mot de passe SMTP
# Pour Gmail: utilisez un "App Password" (pas votre mot de passe Google)
MAIL_PASSWORD=your-app-password

# Chiffrement
MAIL_ENCRYPTION=tls

# Adresse expéditeur
MAIL_FROM_ADDRESS=noreply@goassist.com
MAIL_FROM_NAME="${APP_NAME}"

# =============================================================================
# CONFIGURATION NOTIFICATIONS
# =============================================================================

# Activer les notifications par email (true/false)
NOTIFICATION_EMAIL_ENABLED=true

# Activer les notifications in-app (true/false)
NOTIFICATION_IN_APP_ENABLED=true
```

### Étape 2: Générer un "App Password" Gmail (si vous utilisez Gmail)

1. Allez sur https://myaccount.google.com/
2. Sélectionnez **Sécurité**
3. Activez la **Validation en deux étapes**
4. Allez dans **Mots de passe des applications**
5. Créez un nouveau mot de passe d'application
6. Utilisez ce mot de passe pour `MAIL_PASSWORD`

### Étape 3: Vider le cache (optionnel en développement)

```
bash
php artisan config:clear
php artisan cache:clear
```

---

## Configuration SMS

### Option A: Twilio (International)

1. Créez un compte sur [Twilio](https://www.twilio.com/)
2. Obtenez votre SID, Token et numéro de téléphone

```
env
# =============================================================================
# CONFIGURATION SMS - TWILIO
# =============================================================================

# Activer les notifications SMS
NOTIFICATION_SMS_ENABLED=true

# Provider SMS: twilio, freemobile, log
SMS_PROVIDER=twilio

# Configuration Twilio
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_FROM=+1234567890
```

### Option B: Free Mobile (France uniquement)

1. Créez un compte sur [Free Mobile](https://mobile.free.fr/)
2. Activez l'option "SMS API" dans votre espace client

```
env
# =============================================================================
# CONFIGURATION SMS - FREE MOBILE
# =============================================================================

# Activer les notifications SMS
NOTIFICATION_SMS_ENABLED=true

# Provider SMS
SMS_PROVIDER=freemobile

# Configuration Free Mobile
FREEMOBILE_USER=your-free-mobile-username
FREEMOBILE_KEY=your-free-mobile-api-key
```

### Option C: Mode Log (Développement)

Pour tester sans provider SMS:

```
env
# =============================================================================
# CONFIGURATION SMS - LOG (DÉVELOPPEMENT)
# =============================================================================

NOTIFICATION_SMS_ENABLED=true
SMS_PROVIDER=log
```

Les SMS seront alors écrits dans les logs (`storage/logs/laravel.log`).

---

## Activation/Désactivation des notifications

Vous pouvez activer/désactiver chaque type de notification individuellement:

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NOTIFICATION_EMAIL_ENABLED` | Activer les emails | `true` |
| `NOTIFICATION_SMS_ENABLED` | Activer les SMS | `false` |
| `NOTIFICATION_IN_APP_ENABLED` | Activer les notifications in-app | `true` |

---

## Vérification

### Tester l'envoi d'email

```bash
php artisan tinker
```

Puis:
```
php
use App\Services\NotificationService;
use App\Models\Utilisateur;

$user = Utilisateur::first();
$service = app(NotificationService::class);
$service->sendWelcomeEmail($user, 'client');
```

### Tester l'envoi de SMS

```
php
$service->sendWelcomeSMS($user, 'client');
```

### Vérifier les logs

```
bash
tail -f storage/logs/laravel.log
```

---

## Dépannage

### Emails non envoyés
- Vérifiez que `MAIL_MAILER=smtp` (pas `log`)
- Vérifiez les credentials SMTP
- Vérifiez que le port est correct (587 pour TLS, 465 pour SSL)
- Vérifiez les logs: `tail -f storage/logs/laravel.log`

### SMS non envoyés
- Vérifiez que `NOTIFICATION_SMS_ENABLED=true`
- Vérifiez que `SMS_PROVIDER` est correctement défini
- Pour Twilio: vérifiez le numéro `from` est valide
- Pour Free Mobile: vérifiez les identifiants API

### Notifications in-app non créées
- Vérifiez que `NOTIFICATION_IN_APP_ENABLED=true`
- Vérifiez la table `notifications` dans la base de données

---

## Dépendances Composer

Les packages suivants sont déjà inclus ou recommandés:

```
bash
# Pour SMS Twilio (si utilisé)
composer require twilio/sdk

# Pour SMS Free Mobile (inclus dans Laravel)
# Pas de package supplémentaire requis

# Pour emails (inclus dans Laravel)
# Pas de package supplémentaire requis
