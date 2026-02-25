<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notifications d'inscription
    |--------------------------------------------------------------------------
    |
    | Configuration des notifications envoyées lors de la création d'un compte.
    | Vous pouvez activer/désactiver chaque type de notification.
    |
    */

    // Activer/désactiver les notifications d'inscription
    'enabled' => true,

    // Notifications par email
    'email' => [
        'enabled' => env('NOTIFICATION_EMAIL_ENABLED', true),
        // Adresse sender pour les emails
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'noreply@goassist.com'),
            'name' => env('MAIL_FROM_NAME', 'GoAssist'),
        ],
    ],

    // Notifications par SMS
    'sms' => [
        'enabled' => env('NOTIFICATION_SMS_ENABLED', false),
        // Provider SMS à utiliser: 'log', 'twilio', 'freemobile'
        'provider' => env('SMS_PROVIDER', 'log'),
        
        // Configuration Twilio (si provider = twilio)
        'twilio' => [
            'sid' => env('TWILIO_SID', ''),
            'token' => env('TWILIO_TOKEN', ''),
            'from' => env('TWILIO_FROM', ''),
        ],
        
        // Configuration Free Mobile (si provider = freemobile)
        'freemobile' => [
            'user' => env('FREEMOBILE_USER', ''),
            'key' => env('FREEMOBILE_KEY', ''),
        ],
    ],

    // Notifications in-app
    'in_app' => [
        'enabled' => env('NOTIFICATION_IN_APP_ENABLED', true),
    ],
];

