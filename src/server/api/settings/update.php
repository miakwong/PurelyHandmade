<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\SettingsController;
use Utils\Request;
use Utils\Response;
use Utils\Database;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Add debugging information
error_log('=== Settings Update API Called ===');

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$request = new Request();
$response = new Response();

// 获取请求方法
$method = getRequestMethod();
error_log("Request method: $method");

if ($method !== 'POST' && $method !== 'PUT') {
    error_log("Method not allowed: $method");
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // 检查Settings表是否存在
    $db = new Database();
    $db->connect();
    error_log("Database connected successfully");
    
    // 检查Settings表是否存在
    $tableExists = false;
    try {
        $result = $db->fetch("SHOW TABLES LIKE 'Settings'");
        $tableExists = !empty($result);
        error_log("Settings table exists check: " . ($tableExists ? "Yes" : "No"));
        
        if (!$tableExists) {
            // 创建Settings表
            error_log("Creating Settings table...");
            $createTableSQL = "
                CREATE TABLE IF NOT EXISTS `Settings` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `key` varchar(191) NOT NULL,
                  `value` text,
                  `group` varchar(191) NOT NULL DEFAULT 'general',
                  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `group_key` (`group`, `key`)
                )
            ";
            $db->query($createTableSQL);
            error_log("Settings table created successfully");
        }
    } catch (Exception $e) {
        error_log("Error checking/creating Settings table: " . $e->getMessage());
    }
    
    // 应用管理员中间件
    error_log("Applying Admin middleware...");
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    error_log("Admin middleware applied successfully");
    
    $settingsController = new SettingsController();
    
    // 获取请求体 - 尝试不同的方法来获取数据
    error_log("Getting request data...");
    $data = $request->getJson();
    
    // 如果JSON解析失败，尝试使用其他方法
    if (!$data) {
        error_log("JSON parsing failed, trying all() method");
        $data = $request->all();
    }
    
    // 记录接收到的数据
    error_log('Settings update received data: ' . print_r($data, true));
    
    // 如果数据为空，返回错误
    if (empty($data)) {
        error_log("No data received");
        $response->error('No data received', 400);
        exit;
    }
    
    // 更新设置
    error_log("Updating settings...");
    $result = $settingsController->updateSettings($data);
    error_log("Settings update result: " . print_r($result, true));
    
    if ($result['success']) {
        error_log("Settings updated successfully");
        $response->success($result['settings'], $result['message']);
    } else {
        error_log("Failed to update settings: " . $result['message']);
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $errorMsg = 'An error occurred while processing your request: ' . $e->getMessage();
    error_log("Settings update error: " . $errorMsg);
    error_log("Error stack trace: " . $e->getTraceAsString());
    
    $response->serverError($errorMsg);
    
    // 记录错误日志
    $logger = new Utils\Logger('settings.log');
    $logger->error('Settings update API error', Utils\Logger::formatException($e));
} 