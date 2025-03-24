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
if ($method !== 'GET' && $method !== 'DELETE') {
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // 应用管理员中间件
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $settingsController = new SettingsController();
    
    if ($method === 'GET') {
        // 获取设置组参数
        $group = $request->getParam('group');
        
        // 获取设置
        $result = $settingsController->getSettings($group);
        
        if ($result['success']) {
            $response->success($result['settings'], $result['message']);
        } else {
            $response->error($result['message']);
        }
    } elseif ($method === 'DELETE') {
        // 获取设置键
        $key = $request->getParam('key');
        $group = $request->getParam('group', 'general');
        
        // 删除设置
        $result = $settingsController->deleteSettings($key, $group);
        
        if ($result['success']) {
            $response->success(null, $result['message']);
        } else {
            $response->error($result['message']);
        }
    }
} catch (Exception $e) {
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // 记录错误日志
    $logger = new Utils\Logger('settings.log');
    $logger->error('Settings API error', Utils\Logger::formatException($e));
} 