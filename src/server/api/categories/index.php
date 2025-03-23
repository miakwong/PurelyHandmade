<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\CategoryController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;

// 显示错误信息，用于调试
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Apply CORS middleware
    $corsMiddleware = new CorsMiddleware();
    $corsMiddleware->handle();
    
    // Only accept GET requests
    if (getRequestMethod() !== 'GET') {
        $response = new Response();
        $response->error('Method not allowed', 405);
        exit;
    }
    
    $request = new Request();
    $response = new Response();
    $categoryController = new CategoryController();
    
    // Get query parameters
    $filters = [];
    
    // Parse filters
    if ($request->has('featured')) {
        $filters['featured'] = $request->getParam('featured');
    }
    
    // Get categories
    $result = $categoryController->getCategories($filters);
    
    if ($result['success']) {
        $response->success($result['data']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    // 打印错误信息用于调试
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    
    $response = new Response();
    $response->serverError('An error occurred: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Category listing error', Utils\Logger::formatException($e));
} 