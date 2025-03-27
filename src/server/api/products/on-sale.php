<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\ProductController;
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
    $productController = new ProductController();
    
    // Get query parameters for pagination
    $page = (int) $request->getParam('page', 1);
    $limit = (int) $request->getParam('limit', 8); // Default to 8 for on-sale products
    
    // 使用过滤器来获取特价产品，而不是调用不存在的方法
    $filters = ['sale' => 1]; // 假设数据库中有sale字段表示特价商品
    
    // 使用getProducts方法而不是getOnSaleProducts
    $result = $productController->getProducts($filters, $page, $limit);
    
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
    $logger->error('On-sale products error', Utils\Logger::formatException($e));
} 