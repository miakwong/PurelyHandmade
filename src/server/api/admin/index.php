<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AuthController;
use Utils\Request;
use Utils\Response;
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
    $request = new Request();
    $response = new Response();
    $authController = new AuthController();
    
    // 添加调试信息
    $logger = new Utils\Logger();
    $logger->info('Login request data:', [
        'POST' => $_POST,
        'GET' => $_GET,
        'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'RAW_BODY' => file_get_contents('php://input')
    ]);
    
    // Get login credentials
    $identifier = $request->getParam('identifier'); // Support both email and username
    $password = $request->getParam('password');
    
    // 添加参数调试信息
    $logger->info('Parsed credentials:', [
        'identifier' => $identifier,
        'password' => $password ? 'set' : 'not set'
    ]);
    
    // Validate required fields
    if (!$identifier || !$password) {
        $response->error('Username/Email and password are required');
        exit;
    }
    
    // Login user
    $result = $authController->login($identifier, $password);
    
    if ($result['success']) {
        $response->success([
            'token' => $result['token'],
            'user' => $result['user']
        ], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Login error', Utils\Logger::formatException($e));
} 