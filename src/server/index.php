<?php
// 项目入口文件
session_start();

// 定义项目根目录
define('ROOT_PATH', dirname(dirname(__DIR__)));
define('SERVER_PATH', __DIR__);
define('CONTROLLERS_PATH', SERVER_PATH . '/controllers');
define('CLIENT_PATH', dirname(__DIR__) . '/client');
define('HTML_PATH', CLIENT_PATH . '/html');

// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 处理URL路由
$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$request_method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

// 解析URL，确定要调用的控制器和方法
$url_parts = parse_url($request_uri);
$path = isset($url_parts['path']) ? $url_parts['path'] : '/';

// 加载主页
if ($path == '/' || $path == '/index.php') {
    include HTML_PATH . '/index.html';
    exit;
}

// 加载静态HTML页面
$html_pages = [
    '/index.html' => HTML_PATH . '/index.html',
    '/admin-tools.html' => HTML_PATH . '/admin-tools.html',
    '/404.html' => HTML_PATH . '/404.html',
    '/login-test.html' => HTML_PATH . '/login-test.html'
];

if (isset($html_pages[$path])) {
    include $html_pages[$path];
    exit;
}

// 处理登录请求
if ($path == '/login' && $request_method == 'POST') {
    require_once CONTROLLERS_PATH . '/AuthController.php';
    $controller = new AuthController();
    $controller->login();
    exit;
}

// 处理个人资料请求
if ($path == '/profile' && $request_method == 'GET') {
    require_once CONTROLLERS_PATH . '/ProfileController.php';
    $controller = new ProfileController();
    $controller->view();
    exit;
}

// 处理个人资料更新请求
if ($path == '/profile/update' && $request_method == 'POST') {
    require_once CONTROLLERS_PATH . '/ProfileController.php';
    $controller = new ProfileController();
    $controller->update();
    exit;
}

// 处理管理工具请求
if ($path == '/admin-tools') {
    require_once CONTROLLERS_PATH . '/AdminController.php';
    $controller = new AdminController();
    $controller->viewTools();
    exit;
}

// 处理管理员API请求 - 获取用户列表
if ($path == '/api/admin/users' && $request_method == 'GET') {
    require_once CONTROLLERS_PATH . '/AdminController.php';
    $controller = new AdminController();
    $controller->getUsers();
    exit;
}

// 处理管理员API请求 - 获取统计数据
if ($path == '/api/admin/stats' && $request_method == 'GET') {
    require_once CONTROLLERS_PATH . '/AdminController.php';
    $controller = new AdminController();
    $controller->getStats();
    exit;
}

// 处理静态文件 (CSS, JS, 图片)
$extension = pathinfo($path, PATHINFO_EXTENSION);
$static_extensions = ['css', 'js', 'jpg', 'jpeg', 'png', 'gif'];

if (in_array($extension, $static_extensions)) {
    // 确定文件类型和目录
    $type_dirs = [
        'css' => CLIENT_PATH . '/css',
        'js' => CLIENT_PATH . '/js',
        'jpg' => CLIENT_PATH . '/img',
        'jpeg' => CLIENT_PATH . '/img',
        'png' => CLIENT_PATH . '/img',
        'gif' => CLIENT_PATH . '/img'
    ];
    
    // 尝试在新结构中查找文件
    $file_path = $type_dirs[$extension] . '/' . basename($path);
    
    // 如果不存在，尝试在根目录查找
    if (!file_exists($file_path)) {
        $file_path = ROOT_PATH . $path;
    }
    
    if (file_exists($file_path)) {
        $mime_types = [
            'css' => 'text/css',
            'js' => 'text/javascript',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ];
        
        header('Content-Type: ' . $mime_types[$extension]);
        readfile($file_path);
        exit;
    }
}

// 如果没有匹配的路由，返回404页面
include HTML_PATH . '/404.html'; 