<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\ReviewController;
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
    $reviewController = new ReviewController();
    
    // Get query parameters for filtering
    $filters = [];
    
    // Parse filters
    if ($request->has('product')) {
        $filters['productId'] = $request->getParam('product');
    }
    
    if ($request->has('status')) {
        $filters['status'] = $request->getParam('status');
    }
    
    // Parse pagination
    $page = (int) $request->getParam('page', 1);
    $limit = (int) $request->getParam('limit', 10);
    
    // Get reviews
    $result = $reviewController->getReviews($filters, $page, $limit);
    
    if ($result['success']) {
        $response->success($result['data']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Reviews listing error', Utils\Logger::formatException($e));
} 