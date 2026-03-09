<?php

/**
 * Configuration FedaPay - Payment Gateway pour le Benin
 * 
 * Documentation: https://docs.fedapay.com/
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | Specify the FedaPay environment: 'sandbox' ou 'live'
    |
    */
    'environment' => env('FEDAPAY_ENVIRONMENT', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | API Credentials
    |--------------------------------------------------------------------------
    */
    'api_key' => env('FEDAPAY_API_KEY', ''),
    'secret_key' => env('FEDAPAY_SECRET_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    */
    'callback_url' => env('FEDAPAY_CALLBACK_URL', '/api/fedapay/callback'),
    'return_url' => env('FEDAPAY_RETURN_URL', '/client/dashboard'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */
    'currency' => 'XOF',

    /*
    |--------------------------------------------------------------------------
    | Timeout Configuration
    |--------------------------------------------------------------------------
    */
    'timeout' => 30,
];

