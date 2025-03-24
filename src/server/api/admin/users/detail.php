<?php
require_once __DIR__ . '/../../../bootstrap.php';

use Controllers\AdminController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept GET requests
if (getRequestMethod() !== 'GET') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $request = new Request();
    $response = new Response();
    $adminController = new AdminController();
    
    // Get user ID from query parameters
    $userId = $request->getParam('id');
    
    if (!$userId) {
        $response->error('User ID is required');
        exit;
    }
    
    // Get user detail
    $result = $adminController->getUserById($userId);
    
    if ($result['success']) {
        $response->success($result['data'], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('User detail error', Utils\Logger::formatException($e));
} 