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
    
    // Create or update an admin controller that will be extended with settings methods
    $adminController = new AdminController();
    
    if ($method === 'GET') {
        // Get all settings with optional group filter
        $group = $request->getParam('group', null);
        
        $result = $adminController->getSettings($group);
        
        if ($result['success']) {
            $response->success($result['settings']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'POST' || $method === 'PUT') {
        // Update settings
        $data = $request->all();
        
        if (empty($data)) {
            $response->error('No settings provided to update');
            exit;
        }
        
        $result = $adminController->updateSettings($data);
        
        if ($result['success']) {
            $response->success($result['settings'], $result['message']);
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
    $logger->error('Admin settings error', Utils\Logger::formatException($e));
} 