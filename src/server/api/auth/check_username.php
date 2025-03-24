<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AuthController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept POST requests
if (getRequestMethod() !== 'POST') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    $request = new Request();
    $response = new Response();
    $authController = new AuthController();
    
    // Get username from request
    $data = $request->getJson();
    $username = $data['username'] ?? '';
    
    // Validate username format
    if (empty($username) || strlen($username) < 3) {
        $response->error('Invalid username format');
        exit;
    }
    
    // Check if username exists in database
    $user = $authController->findUserByUsername($username);
    
    // Ensure $user is checked properly
     $exists = !empty($user);
     
    // Return response
    $response->success([
        'exists' => $exists,
        'message' => $exists ? 'This username is already registered.' : 'Username is available.'
    ]);
    
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while checking username: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Username check error', Utils\Logger::formatException($e));
} 