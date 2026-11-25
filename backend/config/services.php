<?php

return [

    'frontend_url' => env('FRONTEND_URL', 'https://apex-team.space'),

    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'secret_key' => env('SUPABASE_SECRET_KEY'),
        'bucket' => env('SUPABASE_BUCKET', 'apex-assets'),
        // Optional: comma-separated hosts for permanently deleted projects only (not paused).
        'dead_hosts' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('SUPABASE_DEAD_HOSTS', ''))
        ))),
    ],

    'media_placeholder_url' => env(
        'MEDIA_PLACEHOLDER_URL',
        'https://www.apex-team.space/favicon.svg'
    ),

    'turnstile' => [
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', 'https://api.apex-team.space/auth/google/callback'),
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_REDIRECT_URI', 'https://api.apex-team.space/auth/github/callback'),
    ],
    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME', 'apex'),
        'api_key' => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

];
