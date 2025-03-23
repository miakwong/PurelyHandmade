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
    
    // Get registration data
    $data = $request->all();
    
    // Register user
    $result = $authController->register($data);
    
    if ($result['success']) {
        $response->success($result['user'], $result['message'], 201);
    } else {
        if (isset($result['errors'])) {
            $response->validationError($result['errors']);
        } else {
            $response->error($result['message']);
        }
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Registration error', Utils\Logger::formatException($e));
} 