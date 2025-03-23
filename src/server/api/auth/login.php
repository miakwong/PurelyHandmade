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
    
    // Get login credentials
    $email = $request->getParam('email');
    $password = $request->getParam('password');
    
    // Validate required fields
    if (!$email || !$password) {
        $response->error('Email and password are required');
        exit;
    }
    
    // Login user
    $result = $authController->login($email, $password);
    
    if ($result['success']) {
        $response->success([
            'token' => $result['token'],
            'user' => $result['user']
        ], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Login error', Utils\Logger::formatException($e));
} 