<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\CategoryController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;

// 显示错误信息
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // 允许 CORS
    $corsMiddleware = new CorsMiddleware();
    $corsMiddleware->handle();
    
    // 仅允许 GET 请求
    if (getRequestMethod() !== 'GET') {
        $response = new Response();
        $response->error('Method not allowed', 405);
        exit;
    }

    $request = new Request();
    $response = new Response();
    $categoryController = new CategoryController();
    
    // 获取分类数据
    $filters = [];
    if ($request->has('featured')) {
        $filters['featured'] = $request->getParam('featured');
    }

    $result = $categoryController->getCategories($filters);
    
    if ($result['success']) {
        // 确保数据格式正确
        $categoriesData = is_array($result['data']) ? $result['data'] : [];

        // 获取每个分类的产品数量
        foreach ($categoriesData as &$category) {
            if (isset($category['id'])) {
                $category['productCount'] = $categoryController->getProductCount($category['id']);
                $totalProductCount += $category['productCount'];

                error_log("📌 Category: " . $category['name'] . " (ID: " . $category['id'] . ")");
                error_log("📊 Product Count: " . $category['productCount']);
            }
        }

        // **修正数据结构**
        $responseData = [
            'success' => true,
            'message' => 'Success',
            'data' => [
                'categories' => $categoriesData,
                'total' => count($categoriesData),
            ]
        ];

        // 记录日志
        error_log("✅ Categories API Response: " . json_encode($responseData));

        // 返回修正后的数据
        $response->success($responseData);

    } else {
        $response->error($result['message']);
        
    }
} catch (Exception $e) {
    // 记录错误日志
    error_log("❌ Error: " . $e->getMessage());
    error_log("❌ File: " . $e->getFile() . " Line: " . $e->getLine());
    error_log("❌ Trace: " . $e->getTraceAsString());

    $response = new Response();
    $response->serverError('An error occurred: ' . $e->getMessage());

    // 记录日志
    $logger = new Utils\Logger();
    $logger->error('Category listing error', Utils\Logger::formatException($e));
}
