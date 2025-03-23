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
    
    // Get query parameters
    $filters = [];
    
    // Parse filters
    if ($request->has('category')) {
        $filters['category'] = $request->getParam('category');
    }
    
    if ($request->has('designer')) {
        $filters['designer'] = $request->getParam('designer');
    }
    
    if ($request->has('featured')) {
        $filters['featured'] = $request->getParam('featured');
    }
    
    if ($request->has('active')) {
        $filters['active'] = $request->getParam('active');
    }
    
    // Parse pagination
    $page = (int) $request->getParam('page', 1);
    $limit = (int) $request->getParam('limit', 10);
    
    // Search term
    $search = $request->getParam('search');
    
    if ($search) {
        // Handle search
        $result = $productController->searchProducts($search, $page, $limit);
    } else {
        // Get filtered products
        $result = $productController->getProducts($filters, $page, $limit);
    }
    
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
    $logger->error('Product listing error', Utils\Logger::formatException($e));
} 