<?php
// Main application entry point

// Route API requests to the server
if (strpos($_SERVER['REQUEST_URI'], '/api') === 0) {
    require_once __DIR__ . '/src/server/index.php';
} else {
    // For now, just show a basic response for non-API requests
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'PurelyHandmade API server is running',
        'api_base' => '/api'
    ]);
}

// 自动检测当前服务器URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . "://" . $host;
$currentDir = dirname($_SERVER['SCRIPT_NAME']);
$baseUrl .= $currentDir == '/' ? '' : $currentDir;

// 检查服务器状态
$is_running = false;
$server_port = null;
$pid_file = __DIR__ . '/server.pid';
$port_file = __DIR__ . '/server.port';

if (file_exists($pid_file) && file_exists($port_file)) {
    $pid = (int)file_get_contents($pid_file);
    $server_port = file_get_contents($port_file);
    
    // 检查进程是否运行 (简单检查)
    if (function_exists('shell_exec')) {
        $check = shell_exec("ps -p $pid 2>/dev/null");
        $is_running = $check && strpos($check, $pid) !== false;
    }
}

// 如果服务器在运行，构建应用URL
$app_url = $is_running ? "http://localhost:{$server_port}" : null;
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PurelyHandmade 项目主页</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        .header {
            background-color: #5a8c70;
            color: white;
            padding: 2rem 0;
            text-align: center;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow: hidden;
        }
        .card-header {
            background-color: #f0f0f0;
            padding: 1rem;
            border-bottom: 1px solid #ddd;
        }
        .card-body {
            padding: 1.5rem;
        }
        .btn {
            display: inline-block;
            background-color: #5a8c70;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 4px;
            margin-right: 1rem;
            margin-bottom: 1rem;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #4a7b60;
        }
        .btn-secondary {
            background-color: #6c757d;
        }
        .btn-secondary:hover {
            background-color: #5c656d;
        }
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.875rem;
            margin-left: 0.5rem;
        }
        .status-running {
            background-color: #28a745;
            color: white;
        }
        .status-stopped {
            background-color: #dc3545;
            color: white;
        }
        .link-section {
            margin-top: 2rem;
        }
        .footer {
            text-align: center;
            padding: 2rem 0;
            background-color: #f0f0f0;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PurelyHandmade 项目</h1>
        <p>手工制品讨论与展示平台</p>
    </div>
    
    <div class="container">
        <div class="card">
            <div class="card-header">
                <h2>项目状态 
                    <?php if($is_running): ?>
                    <span class="status-badge status-running">运行中</span>
                    <?php else: ?>
                    <span class="status-badge status-stopped">已停止</span>
                    <?php endif; ?>
                </h2>
            </div>
            <div class="card-body">
                <?php if($is_running): ?>
                <p>项目服务器正在运行 (端口: <?php echo htmlspecialchars($server_port); ?>)</p>
                <?php else: ?>
                <p>项目服务器未启动。请使用控制面板启动服务器。</p>
                <?php endif; ?>
                
                <a href="server-control.php" class="btn">服务器控制面板</a>
                <a href="admin-panel.php" class="btn">高级控制面板</a>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2>项目页面</h2>
            </div>
            <div class="card-body">
                <?php if($is_running): ?>
                <div class="link-section">
                    <h3>项目主要页面</h3>
                    <a href="<?php echo $app_url; ?>/src/client/views/admin/designers.html" class="btn">设计师管理页面</a>
                    <a href="<?php echo $app_url; ?>/src/client/views/admin/dashboard.html" class="btn">管理员控制台</a>
                    <a href="<?php echo $app_url; ?>/src/client/views/index.html" class="btn">前台首页</a>
                </div>
                
                <div class="link-section">
                    <h3>API 测试</h3>
                    <a href="<?php echo $app_url; ?>/api/designers" class="btn btn-secondary">设计师 API</a>
                    <a href="<?php echo $app_url; ?>/api/designers?name=david" class="btn btn-secondary">按名称过滤</a>
                    <a href="<?php echo $app_url; ?>/api/designers?featured=1" class="btn btn-secondary">精选设计师</a>
                    <a href="<?php echo $app_url; ?>/test_api.php" class="btn btn-secondary">测试 API</a>
                </div>
                <?php else: ?>
                <p>请先启动服务器，然后刷新此页面查看可用链接。</p>
                <a href="server-control.php" class="btn">转到服务器控制面板</a>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2>手动操作指南</h2>
            </div>
            <div class="card-body">
                <h3>启动服务器</h3>
                <p>如果控制面板不起作用，您可以使用命令行启动服务器：</p>
                <pre><code>cd <?php echo htmlspecialchars(__DIR__); ?> && php -S localhost:8000 -t .</code></pre>
                
                <h3>通过浏览器访问</h3>
                <p>服务器启动后，您可以通过以下URL访问项目：</p>
                <pre><code>http://localhost:8000/src/client/views/admin/designers.html</code></pre>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>PurelyHandmade &copy; 2025</p>
    </div>
</body>
</html> 