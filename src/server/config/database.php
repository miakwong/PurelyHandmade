<?php
/**
 * Database configuration file
 * 
 * This file loads database connection settings from environment variables
 */

return [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? 3306,
    'name' => $_ENV['DB_NAME'] ?? 'purely_handmade',
    'user' => $_ENV['DB_USER'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'socket' => $_ENV['DB_SOCKET'] ?? null,
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]; 