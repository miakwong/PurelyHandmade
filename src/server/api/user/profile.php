<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\UserController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;
use Middleware\AuthMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// 应用Auth中间件
$authMiddleware = new AuthMiddleware();
$userData = $authMiddleware->handle(); // 这会在认证失败时自动退出

// Only accept GET requests
if (getRequestMethod() !== 'GET') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    $request = new Request();
    $response = new Response();
    
    // 使用从AuthMiddleware获取的用户数据
    // 不再需要从controller获取
    if ($userData) {
        $response->success($userData);
    } else {
        $response->error('User profile not found');
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request');
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('User profile error', Utils\Logger::formatException($e));
} 