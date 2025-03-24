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

// Only accept PUT requests
if (getRequestMethod() !== 'PUT') {
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
    
    // Get product data
    $data = $request->all();
    
    // Check if ID is provided
    $id = $data['id'] ?? null;
    
    if (!$id) {
        $response->error('Product ID is required');
        exit;
    }
    
    // Remove ID from data to prevent unintended changes
    unset($data['id']);
    
    // Update product
    $result = $productController->updateProduct($id, $data);
    
    if ($result['success']) {
        $response->success($result['product'], $result['message']);
    } else {
        if (isset($result['errors'])) {
            $response->validationError($result['errors']);
        } else {
            $response->error($result['message']);
        }
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Product update error', Utils\Logger::formatException($e));
} 