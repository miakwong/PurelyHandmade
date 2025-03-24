<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\DesignerController;
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
    $designerController = new DesignerController();
    
    // Get designer data
    $data = $request->all();
    
    // Create designer
    $result = $designerController->createDesigner($data);
    
    if ($result['success']) {
        $response->success($result['designer'], $result['message'], 201);
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
    $logger->error('Designer creation error', Utils\Logger::formatException($e));
} 