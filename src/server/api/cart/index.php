<?php
/**
 * API endpoint to get cart items
 * GET /api/cart
 */

use Controllers\CartController;
use Utils\Response;
use Utils\Logger;
use Middleware\AuthMiddleware;

// Create response object
$response = new Response();
$logger = new Logger('cart-api.log');

// 应用身份验证中间件，确保用户已登录
try {
    $authMiddleware = new AuthMiddleware();
    $userData = $authMiddleware->handle();
    
    // 获取用户ID
    $userId = $userData['id'];
    
    // 检查是否为GET请求
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        $response->methodNotAllowed('Method not allowed. Only GET requests are accepted.');
        exit;
    }
    
    try {
        // 创建购物车控制器
        $cartController = new CartController();
        
        // 获取购物车商品
        $result = $cartController->getCart($userId);
        
        // 记录结果
        $logger->info('Cart API response', [
            'success' => $result['success'],
            'message' => $result['message'],
            'dataType' => gettype($result['data']),
            'dataIsArray' => is_array($result['data']),
            'dataCount' => is_array($result['data']) ? count($result['data']) : 0
        ]);
        
        // 返回响应
        if ($result['success']) {
            $response->success($result['data'], $result['message']);
        } else {
            $response->badRequest($result['message']);
        }
    } catch (Exception $e) {
        $logger->error('Cart API error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        $response->error('Failed to get cart items: ' . $e->getMessage());
    }
} catch (Exception $e) {
    // 认证失败，返回401响应
    $logger->error('Cart API auth error', [
        'error' => $e->getMessage()
    ]);
    $response->unauthorized('Authentication required to access cart');
} 