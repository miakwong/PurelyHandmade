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
    
    // Get order ID from query parameters
    $orderId = $request->getParam('id');
    
    if (!$orderId) {
        $response->error('Order ID is required');
        exit;
    }
    
    // Get order with items
    $result = $orderController->getOrderById($orderId, $userId);
    
    if ($result['success']) {
        $response->success($result['order']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Order detail error', Utils\Logger::formatException($e));
} 