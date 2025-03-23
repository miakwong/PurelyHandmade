<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\CategoryController;
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
    $categoryController = new CategoryController();
    
    // Get category identifier from query parameters
    $id = $request->getParam('id');
    $slug = $request->getParam('slug');
    
    if (!$id && !$slug) {
        $response->error('Category ID or slug is required');
        exit;
    }
    
    if ($id) {
        // Get category by ID
        $result = $categoryController->getCategoryById($id);
    } else {
        // Get category by slug
        $result = $categoryController->getCategoryBySlug($slug);
    }
    
    if ($result['success']) {
        $response->success($result['category']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Category detail error', Utils\Logger::formatException($e));
} 