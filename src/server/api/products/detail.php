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
    
    // Get product identifier from query parameters
    $id = $request->getParam('id');
    $slug = $request->getParam('slug');
    
    if (!$id && !$slug) {
        $response->error('Product ID or slug is required');
        exit;
    }
    
    if ($id) {
        // Get product by ID
        $result = $productController->getProductById($id);
    } else {
        // Get product by slug
        $result = $productController->getProductBySlug($slug);
    }
    
    if ($result['success']) {
        $response->success($result['product']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Product detail error', Utils\Logger::formatException($e));
}