<?php
/**
 * PurelyHandmade 主入口文件
 * 根据请求路径路由到前端或API
 */

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 获取请求路径
$requestUri = $_SERVER['REQUEST_URI'];

// 检查是否是API请求
if (strpos($requestUri, '/api/') === 0) {
    // 重定向到API入口
    include __DIR__ . '/server/api.php';
    exit;
}

// 否则重定向到前端应用
header('Location: /client/');
exit; 