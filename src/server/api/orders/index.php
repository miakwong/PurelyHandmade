<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\OrderController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
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
    // Apply Auth middleware
    $authMiddleware = new AuthMiddleware();
    $authMiddleware->handle();
    
    $request = new Request();
    $response = new Response();
    $orderController = new OrderController();
    
    // Get user ID from the request
    $userId = $_REQUEST['userId'];
    
    // Get query parameters for filtering
    $filters = [
        'userId' => $userId // Only show orders for the current user
    ];
    
    // Add additional filters
    if ($request->has('status')) {
        $filters['status'] = $request->getParam('status');
    }
    
    // Parse pagination
    $page = (int) $request->getParam('page', 1);
    $limit = (int) $request->getParam('limit', 10);
    
    // Get orders
    $result = $orderController->getOrders($filters, $page, $limit);
    
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
    $logger->error('Orders listing error', Utils\Logger::formatException($e));
} 