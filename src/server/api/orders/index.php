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
    
    // 管理员参数
    $isAdmin = isset($_REQUEST['isAdmin']) ? (bool)$_REQUEST['isAdmin'] : false;
    
    // 获取status参数 - 直接从$_GET获取，与OrderController保持一致
    $status = $_GET['status'] ?? null;
    
    // Get query parameters for filtering
    $filters = [
        'userId' => $userId // Only show orders for the current user
    ];
    
    // 直接传递isAdmin标记，让OrderController决定是否过滤userId
    $_REQUEST['isAdmin'] = $isAdmin;
    
    // 不在这里处理status参数，让OrderController从$_GET直接获取
    // 这样确保参数处理的一致性
    
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