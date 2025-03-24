<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\DesignerController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;
use Utils\Logger;

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
    $designerController = new DesignerController();
    $logger = new Logger('designer-api.log');
    
    // Get query parameters
    $filters = [];
    
    // Parse filters
    if ($request->has('featured')) {
        $filters['featured'] = $request->getParam('featured');
    }
    
    // 添加对name参数的支持
    if ($request->has('name')) {
        $filters['name'] = $request->getParam('name');
    }
    
    // 记录接收到的过滤参数
    $logger->info('Received filter parameters', $filters);
    
    // Get designers
    $result = $designerController->getDesigners($filters);
    
    if ($result['success']) {
        $response->success($result['data']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Logger();
    $logger->error('Designer listing error', Logger::formatException($e));
}