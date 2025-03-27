<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AdminController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;
use Middleware\AuthMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// 应用Auth中间件并检查是否为管理员
$authMiddleware = new AuthMiddleware();
$userData = $authMiddleware->handle(); // 这会在认证失败时自动退出

// 检查是否为管理员
if (!$userData['isAdmin'] && $userData['role'] !== 'admin') {
    $response = new Response();
    $response->error('Unauthorized - Admin access required', 403);
    exit;
}

// Only accept GET requests
if (getRequestMethod() !== 'GET') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    $request = new Request();
    $response = new Response();
    $adminController = new AdminController();
    
    // Get parameters
    $period = $request->getParam('period', 'all'); // all, month, week, day
    
    // Get admin statistics
    $result = $adminController->getDashboardStatistics($period);
    
    if ($result['success']) {
        $response->success($result['data']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Admin statistics error', Utils\Logger::formatException($e));
} 