<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        env('FRONTEND_URL', 'https://codemafia.ng'),
        'https://codemafia.ng',
        'https://www.codemafia.ng',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Content-Disposition',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,
];
