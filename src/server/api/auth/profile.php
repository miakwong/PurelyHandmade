<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AuthController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$request = new Request();
$response = new Response();
$method = getRequestMethod();

try {
    // Apply Auth middleware
    $authMiddleware = new AuthMiddleware();
    $authMiddleware->handle();
    
    // Get user ID from the request
    $userId = $_REQUEST['userId'];
    
    $authController = new AuthController();
    
    if ($method === 'GET') {
        // Get user profile
        $result = $authController->getProfile($userId);
        
        if ($result['success']) {
            $response->success($result['user']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'PUT') {
        // Update user profile
        $data = $request->all();
        
        $result = $authController->updateProfile($userId, $data);
        
        if ($result['success']) {
            $response->success($result['user'], $result['message']);
        } else {
            if (isset($result['errors'])) {
                $response->validationError($result['errors']);
            } else {
                $response->error($result['message']);
            }
        }
    } else {
        $response->error('Method not allowed', 405);
    }
} catch (Exception $e) {
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Profile error', Utils\Logger::formatException($e));
} 