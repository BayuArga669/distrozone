<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Server Key
    |--------------------------------------------------------------------------
    |
    | Your Midtrans server key for API authentication.
    |
    */
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Midtrans Client Key
    |--------------------------------------------------------------------------
    |
    | Your Midtrans client key for frontend Snap integration.
    |
    */
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Midtrans Environment
    |--------------------------------------------------------------------------
    |
    | Set to true for production environment, false for sandbox.
    |
    */
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    |--------------------------------------------------------------------------
    | Sanitization
    |--------------------------------------------------------------------------
    |
    | Enable input sanitization for security.
    |
    */
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    /*
    |--------------------------------------------------------------------------
    | 3DS Authentication
    |--------------------------------------------------------------------------
    |
    | Enable 3D Secure authentication for card payments.
    |
    */
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
];
