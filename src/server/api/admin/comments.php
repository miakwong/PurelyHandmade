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

$request = new Request();
$response = new Response();
$method = getRequestMethod();

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $reviewController = new ReviewController();
    
    if ($method === 'GET') {
        // Get reviews with filters and pagination
        $filters = [];
        
        if ($request->has('status')) {
            $filters['status'] = $request->getParam('status');
        }
        
        if ($request->has('product_id')) {
            $filters['product_id'] = $request->getParam('product_id');
        }
        
        if ($request->has('user_id')) {
            $filters['user_id'] = $request->getParam('user_id');
        }
        
        if ($request->has('rating')) {
            $filters['rating'] = $request->getParam('rating');
        }
        
        if ($request->has('start_date')) {
            $filters['start_date'] = $request->getParam('start_date');
        }
        
        if ($request->has('end_date')) {
            $filters['end_date'] = $request->getParam('end_date');
        }
        
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 20);
        $sortBy = $request->getParam('sort_by', 'created_at');
        $sortDirection = $request->getParam('sort_dir', 'desc');
        
        $result = $reviewController->getAdminReviews($filters, $page, $limit, $sortBy, $sortDirection);
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update review status (approve, reject, etc.)
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('Review ID is required');
            exit;
        }
        
        $result = $reviewController->updateReviewStatus($id, $data);
        
        if ($result['success']) {
            $response->success($result['review'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'DELETE') {
        // Delete review
        $id = $request->getParam('id');
        
        if (!$id) {
            $response->error('Review ID is required');
            exit;
        }
        
        $result = $reviewController->deleteReview($id);
        
        if ($result['success']) {
            $response->success(null, $result['message']);
        } else {
            $response->error($result['message']);
        }
    } else {
        $response->error('Method not allowed', 405);
    }
} catch (Exception $e) {
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Admin comments error', Utils\Logger::formatException($e));
} 