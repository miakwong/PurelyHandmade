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

$request = new Request();
$response = new Response();
$method = getRequestMethod();

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $orderController = new OrderController();
    
    if ($method === 'GET') {
        // Get orders with filters and pagination
        $filters = [];
        
        if ($request->has('status')) {
            $filters['status'] = $request->getParam('status');
        }
        
        if ($request->has('payment_status')) {
            $filters['payment_status'] = $request->getParam('payment_status');
        }
        
        if ($request->has('start_date')) {
            $filters['start_date'] = $request->getParam('start_date');
        }
        
        if ($request->has('end_date')) {
            $filters['end_date'] = $request->getParam('end_date');
        }
        
        if ($request->has('user_id')) {
            $filters['user_id'] = $request->getParam('user_id');
        }
        
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 20);
        $sortBy = $request->getParam('sort_by', 'order_date');
        $sortDirection = $request->getParam('sort_dir', 'desc');
        
        // If order_id is specified, get single order details
        if ($request->has('order_id')) {
            $orderId = $request->getParam('order_id');
            $result = $orderController->getOrderDetails($orderId);
        } else {
            $result = $orderController->getAdminOrders($filters, $page, $limit, $sortBy, $sortDirection);
        }
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update order status
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('Order ID is required');
            exit;
        }
        
        $result = $orderController->updateOrderStatus($id, $data);
        
        if ($result['success']) {
            $response->success($result['order'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } else {
        $response->error('Method not allowed', 405);
    }
} catch (Exception $e) {
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Admin orders error', Utils\Logger::formatException($e));
} 