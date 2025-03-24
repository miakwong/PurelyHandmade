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
    if (!$data || !isset($data['email'])) {
        $response->error('Missing email parameter', 400);
        exit;
    }
    
    $email = trim($data['email']);
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response->error('Invalid email format');
        exit;
    }
    
    // Check if email exists in database
    $user = $authController->findUserByEmail($email);
    
     // Ensure $user is checked properly
     $exists = !empty($user);
    
     $response->success([
         'exists' => $exists,
         'message' => $exists ? 'This email is already registered.' : 'Email is available.'
     ]);
    
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while checking email: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Email check error', Utils\Logger::formatException($e));
} 