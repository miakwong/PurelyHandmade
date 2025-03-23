<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\SettingsController;
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

// 获取请求方法
$method = getRequestMethod();
if ($method !== 'POST' && $method !== 'PUT') {
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // 应用管理员中间件
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $settingsController = new SettingsController();
    
    // 获取请求体
    $data = $request->getBody();
    
    // 更新设置
    $result = $settingsController->updateSettings($data);
    
    if ($result['success']) {
        $response->success($result['settings'], $result['message']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // 记录错误日志
    $logger = new Utils\Logger('settings.log');
    $logger->error('Settings update API error', Utils\Logger::formatException($e));
} 