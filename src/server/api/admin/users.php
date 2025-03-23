<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AdminController;
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
    
    $adminController = new AdminController();
    
    if ($method === 'GET') {
        // Get users with filters and pagination
        $filters = [];
        
        if ($request->has('status')) {
            $filters['status'] = $request->getParam('status');
        }
        
        if ($request->has('role')) {
            $filters['role'] = $request->getParam('role');
        }
        
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 20);
        
        $result = $adminController->getUsers($filters, $page, $limit);
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update user
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('User ID is required');
            exit;
        }
        
        // Update user
        $result = $adminController->updateUser($id, $data);
        
        if ($result['success']) {
            $response->success($result['user'], $result['message']);
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
    $logger->error('Admin users error', Utils\Logger::formatException($e));
} 