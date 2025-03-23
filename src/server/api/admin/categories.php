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

$request = new Request();
$response = new Response();
$method = getRequestMethod();

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $categoryController = new CategoryController();
    
    if ($method === 'GET') {
        // Get all categories with pagination
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 50);
        
        $result = $categoryController->getAllCategories($page, $limit);
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'POST') {
        // Create new category
        $data = $request->all();
        $result = $categoryController->createCategory($data);
        
        if ($result['success']) {
            $response->success($result['category'], $result['message'], 201);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update category
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('Category ID is required');
            exit;
        }
        
        $result = $categoryController->updateCategory($id, $data);
        
        if ($result['success']) {
            $response->success($result['category'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'DELETE') {
        // Delete category
        $id = $request->getParam('id');
        
        if (!$id) {
            $response->error('Category ID is required');
            exit;
        }
        
        $result = $categoryController->deleteCategory($id);
        
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
    $logger->error('Admin categories error', Utils\Logger::formatException($e));
} 