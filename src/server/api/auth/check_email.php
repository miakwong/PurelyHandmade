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
    
    // Get email from request
    $data = $request->getJson();
    $email = $data['email'] ?? '';
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response->error('Invalid email format');
        exit;
    }
    
    // Check if email exists in database
    $user = $authController->findUserByEmail($email);
    
    // Return response
    $response->success([
        'exists' => !empty($user)
    ]);
    
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while checking email: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Email check error', Utils\Logger::formatException($e));
} 