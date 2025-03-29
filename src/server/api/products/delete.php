<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\ProductController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept DELETE requests
if (getRequestMethod() !== 'DELETE') {
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
    $productController = new ProductController();
    
    // Get product ID from request
    $id = $request->getParam('id');
    
    if (!$id) {
        $response->error('Product ID is required');
        exit;
    }
    
    // Delete product
    $result = $productController->deleteProduct($id);
    
    if ($result['success']) {
        $response->success(null, $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Product delete error', Utils\Logger::formatException($e));
} 