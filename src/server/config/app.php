<?php
/**
 * Application configuration file
 * 
 * This file contains various application settings
 */

return [
    // Application name
    'name' => 'PurelyHandmade API',
    
    // Application version
    'version' => '1.0.0',
    
    // Debug mode (set to false in production)
    'debug' => true,
    
    // Default timezone
    'timezone' => 'UTC',
    
    // JWT settings
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'default-secret-key',
        'expiry' => $_ENV['JWT_EXPIRY'] ?? '24h'
    ],
    
    // Logging settings
    'logging' => [
        'directory' => dirname(__DIR__, 3) . '/logs',
        'level' => 'debug' // debug, info, warning, error
    ],
    
    // CORS settings
    'cors' => [
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With']
    ]
]; 