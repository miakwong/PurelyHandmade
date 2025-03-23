<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\ReviewController;
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
    $reviewController = new ReviewController();
    
    // Get review data
    $data = $request->all();
    
    // Check if ID and status are provided
    $id = $data['id'] ?? null;
    $status = $data['status'] ?? null;
    
    if (!$id) {
        $response->error('Review ID is required');
        exit;
    }
    
    if (!$status) {
        $response->error('Status is required');
        exit;
    }
    
    // Update review status
    $result = $reviewController->updateReviewStatus($id, $status);
    
    if ($result['success']) {
        $response->success($result['review'], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Review update error', Utils\Logger::formatException($e));
} 