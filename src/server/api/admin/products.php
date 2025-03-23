<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AdminController;
use Controllers\ProductController;
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
    $productController = new ProductController();
    
    if ($method === 'GET') {
        // Get products with filters and pagination
        $filters = [];
        
        if ($request->has('category')) {
            $filters['category'] = $request->getParam('category');
        }
        
        if ($request->has('designer')) {
            $filters['designer'] = $request->getParam('designer');
        }
        
        if ($request->has('status')) {
            $filters['status'] = $request->getParam('status');
        }
        
        if ($request->has('featured')) {
            $filters['featured'] = $request->getParam('featured');
        }
        
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 20);
        $sortBy = $request->getParam('sort_by', 'created_at');
        $sortDirection = $request->getParam('sort_dir', 'desc');
        
        $result = $productController->getAdminProducts($filters, $page, $limit, $sortBy, $sortDirection);
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'POST') {
        // Create new product
        $data = $request->all();
        $result = $productController->createProduct($data);
        
        if ($result['success']) {
            $response->success($result['product'], $result['message'], 201);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update product
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('Product ID is required');
            exit;
        }
        
        $result = $productController->updateProduct($id, $data);
        
        if ($result['success']) {
            $response->success($result['product'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'DELETE') {
        // Delete product
        $id = $request->getParam('id');
        
        if (!$id) {
            $response->error('Product ID is required');
            exit;
        }
        
        $result = $productController->deleteProduct($id);
        
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
    $logger->error('Admin products error', Utils\Logger::formatException($e));
} 