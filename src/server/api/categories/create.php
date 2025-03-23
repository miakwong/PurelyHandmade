<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\CategoryController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept POST requests
if (getRequestMethod() !== 'POST') {
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
    $categoryController = new CategoryController();
    
    // Get category data
    $data = $request->all();
    
    // Create category
    $result = $categoryController->createCategory($data);
    
    if ($result['success']) {
        $response->success($result['category'], $result['message'], 201);
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
    $logger->error('Category creation error', Utils\Logger::formatException($e));
} 