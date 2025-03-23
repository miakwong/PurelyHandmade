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

$request = new Request();
$response = new Response();
$method = getRequestMethod();

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $designerController = new DesignerController();
    
    if ($method === 'GET') {
        // Get designers with filters and pagination
        $filters = [];
        
        if ($request->has('status')) {
            $filters['status'] = $request->getParam('status');
        }
        
        if ($request->has('featured')) {
            $filters['featured'] = $request->getParam('featured');
        }
        
        $page = (int) $request->getParam('page', 1);
        $limit = (int) $request->getParam('limit', 20);
        
        $result = $designerController->getAllDesigners($filters, $page, $limit);
        
        if ($result['success']) {
            $response->success($result['data']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'POST') {
        // Create new designer
        $data = $request->all();
        $result = $designerController->createDesigner($data);
        
        if ($result['success']) {
            $response->success($result['designer'], $result['message'], 201);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update designer
        $data = $request->all();
        
        // Check if ID is provided
        $id = $data['id'] ?? null;
        
        if (!$id) {
            $response->error('Designer ID is required');
            exit;
        }
        
        $result = $designerController->updateDesigner($id, $data);
        
        if ($result['success']) {
            $response->success($result['designer'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'DELETE') {
        // Delete designer
        $id = $request->getParam('id');
        
        if (!$id) {
            $response->error('Designer ID is required');
            exit;
        }
        
        $result = $designerController->deleteDesigner($id);
        
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
    $logger->error('Admin designers error', Utils\Logger::formatException($e));
} 