<?php
/**
 * API Entry Point for the PurelyHandmade Backend
 */

require_once __DIR__ . '/bootstrap.php';

use Utils\Response;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Get the request path
$path = getRequestPath();

// For debugging
error_log("Original Request Path: " . $path);

// Remove base path if present (e.g. /api)
$basePath = '/api';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

// For debugging
error_log("Processed Path: " . $path);

// Define API routes
$routes = [
    // Auth routes
    '/auth/register' => 'api/auth/register.php',
    '/auth/login' => 'api/auth/login.php',
    '/auth/profile' => 'api/auth/profile.php',
    
    // Product routes
    '/products' => 'api/products/index.php',
    '/products/detail' => 'api/products/detail.php',
    '/products/create' => 'api/products/create.php',
    '/products/update' => 'api/products/update.php',
    
    // Category routes
    '/categories' => 'api/categories/index.php',
    '/categories/detail' => 'api/categories/detail.php',
    '/categories/create' => 'api/categories/create.php',
    '/categories/update' => 'api/categories/update.php',
    
    // Designer routes
    '/designers' => 'api/designers/index.php',
    '/designers/detail' => 'api/designers/detail.php',
    '/designers/create' => 'api/designers/create.php',
    '/designers/update' => 'api/designers/update.php',
    '/designers/featured' => 'api/designers/featured.php',
    
    // Review routes
    '/reviews' => 'api/reviews/index.php',
    '/reviews/create' => 'api/reviews/create.php',
    '/reviews/update' => 'api/reviews/update.php',
    
    // Order routes
    '/orders' => 'api/orders/index.php',
    '/orders/detail' => 'api/orders/detail.php',
    '/orders/create' => 'api/orders/create.php',
    '/orders/update' => 'api/orders/update.php',
    
    // Settings routes
    '/settings' => 'api/settings/index.php',
    '/settings/update' => 'api/settings/update.php',
    
    // Admin routes
    '/admin/users' => 'api/admin/users.php',
    '/admin/dashboard' => 'api/admin/dashboard.php',
    '/admin/reports' => 'api/admin/reports.php',
    
    // Debug routes - remove in production
    '/debug/settings_test' => 'api/debug/settings_test.php'
];

// For debugging
error_log("Available Routes: " . json_encode(array_keys($routes)));
error_log("Is route found?: " . (isset($routes[$path]) ? "YES" : "NO"));
if (!isset($routes[$path])) {
    error_log("Path not found in routes: '$path'");
}

// Check if the path exists in our routes
if (isset($routes[$path])) {
    // Include the corresponding file
    include_once __DIR__ . '/' . $routes[$path];
} else {
    // Route not found
    $response = new Response();
    $response->notFound('API endpoint not found');
} 