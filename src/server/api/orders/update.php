<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\OrderController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Accept both PUT and POST requests
$method = getRequestMethod();
if ($method !== 'PUT' && $method !== 'POST') {
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
    $orderController = new OrderController();
    
    // Get order data
    $data = $request->all();
    
    // Check if ID is provided
    $id = $data['id'] ?? null;
    
    if (!$id) {
        $response->error('Order ID is required');
        exit;
    }
    
    // Check if this is a delete action
    if (isset($data['action']) && $data['action'] === 'delete') {
        // Delete the order
        $result = $orderController->deleteOrder($id);
        
        if ($result['success']) {
            $response->success(null, $result['message']);
        } else {
            $response->error($result['message']);
        }
        exit;
    }
    
    // If not delete, then it's a status update
    $status = $data['status'] ?? null;
    $notes = $data['notes'] ?? null;
    
    if (!$status) {
        $response->error('Status is required');
        exit;
    }
    
    // Update order status
    $result = $orderController->updateOrderStatus($id, $status, $notes);
    
    if ($result['success']) {
        $response->success($result['order'], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Order update error', Utils\Logger::formatException($e));
} 