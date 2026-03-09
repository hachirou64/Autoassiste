<?php

/**
 * Configuration MTN Mobile Money (MoMo) - Benin
 * 
 * Documentation: https://momodeveloper.mtn.com/
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | Specify the MTN MoMo environment: 'sandbox' or 'production'
    |
    */
    'environment' => env('MOMO_ENVIRONMENT', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | API Configuration - Benin
    |--------------------------------------------------------------------------
    */
    'benin' => [
        'base_url' => env('MOMO_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),
        'country' => 'BEN',
        'currency' => 'XOF',
        'callback_url' => env('MOMO_CALLBACK_URL', '/api/momo/callback'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Credentials
    |--------------------------------------------------------------------------
    |
    | These credentials are obtained from MTN MoMo Developer Portal
    |
    */
    'client_id' => env('MOMO_CLIENT_ID', ''),
    'client_secret' => env('MOMO_CLIENT_SECRET', ''),
    'subscription_key' => env('MOMO_SUBSCRIPTION_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | API Version
    |--------------------------------------------------------------------------
    */
    'api_version' => env('MOMO_API_VERSION', '2.0'),

    /*
    |--------------------------------------------------------------------------
    | Timeout Configuration
    |--------------------------------------------------------------------------
    */
    'timeouts' => [
        'request_to_pay' => 30, // seconds
        'get_status' => 10, // seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Retry Configuration
    |--------------------------------------------------------------------------
    */
    'retry' => [
        'max_attempts' => 3,
        'delay_ms' => 1000, // milliseconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider Callback Secret
    |--------------------------------------------------------------------------
    |
    | Secret for verifying callbacks from MTN
    |
    */
    'callback_secret' => env('MOMO_CALLBACK_SECRET', ''),
];

