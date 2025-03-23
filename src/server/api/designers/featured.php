<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\DesignerController;
use Utils\Request;
use Utils\Response;
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
    $request = new Request();
    $response = new Response();
    $designerController = new DesignerController();
    
    // Set featured filter
    $filters = ['featured' => 1];
    
    // Get featured designers
    $result = $designerController->getDesigners($filters);
    
    if ($result['success']) {
        $response->success($result['data']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Featured designer listing error', Utils\Logger::formatException($e));
} 