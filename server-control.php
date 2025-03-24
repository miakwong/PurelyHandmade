<?php
// 简易项目控制脚本 - 适用于受限制的托管环境
session_start();
$admin_password = "admin123"; // 请修改为强密码

// 服务器配置
$server_config = [
    'port' => 8000,          // 默认端口
    'host' => '127.0.0.1',   // 默认主机
    'root_dir' => __DIR__    // 项目根目录
];

// 处理登录
if (isset($_POST['password'])) {
    if ($_POST['password'] === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        $error = "密码错误";
    }
}

// 处理登出
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// 服务器状态管理
$output = '';
$status = '未知';
$server_pid = 0;

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in']) {
    $pid_file = __DIR__ . '/server.pid';
    $port_file = __DIR__ . '/server.port';
    
    // 检查服务器状态
    $is_running = false;
    if (file_exists($pid_file)) {
        $server_pid = (int)file_get_contents($pid_file);
        
        // 基本进程检查 - 适应性更强的方法
        $check_cmd = function_exists('shell_exec') ? 
            shell_exec("ps -p $server_pid 2>/dev/null") : '';
        
        $is_running = $check_cmd && strpos($check_cmd, $server_pid) !== false;
    }
    
    // 获取当前使用的端口
    $current_port = file_exists($port_file) ? file_get_contents($port_file) : $server_config['port'];
    
    // 处理操作命令
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'start':
                if ($is_running) {
                    $output = "服务器已经在运行中 (PID: $server_pid, 端口: $current_port)";
                } else {
                    // 尝试启动服务器
                    $port = (isset($_POST['port']) && is_numeric($_POST['port'])) ? 
                        (int)$_POST['port'] : $server_config['port'];
                    
                    $root_dir = $server_config['root_dir'];
                    $log_file = "$root_dir/server.log";
                    
                    // 构造启动命令 - 使用相对安全的方法
                    $start_cmd = '';
                    
                    if (function_exists('shell_exec')) {
                        // 使用shell_exec启动PHP服务器
                        $cmd = "cd $root_dir && php -S {$server_config['host']}:$port -t . > $log_file 2>&1 & echo $!";
                        $pid = shell_exec($cmd);
                        
                        if ($pid && is_numeric(trim($pid))) {
                            $pid = (int)trim($pid);
                            file_put_contents($pid_file, $pid);
                            file_put_contents($port_file, $port);
                            $server_pid = $pid;
                            $is_running = true;
                            $current_port = $port;
                            $output = "服务器已启动 (PID: $pid, 端口: $port)";
                        } else {
                            $output = "启动服务器时出错。可能需要使用命令行手动启动。";
                        }
                    } else {
                        // 如果无法执行shell命令，提供备用指令
                        $output = "无法自动启动服务器。请使用SSH连接到服务器并执行以下命令：<br>
                                  <code>cd $root_dir && php -S {$server_config['host']}:$port -t .</code>";
                    }
                }
                break;
                
            case 'stop':
                if ($is_running) {
                    $stop_successful = false;
                    
                    if (function_exists('shell_exec')) {
                        shell_exec("kill $server_pid 2>/dev/null");
                        // 检查是否成功终止
                        sleep(1);
                        $check = shell_exec("ps -p $server_pid 2>/dev/null");
                        $stop_successful = !$check || strpos($check, $server_pid) === false;
                    }
                    
                    if ($stop_successful) {
                        @unlink($pid_file);
                        $output = "服务器已停止 (PID: $server_pid)";
                        $is_running = false;
                    } else {
                        $output = "无法自动停止服务器。请使用SSH连接到服务器并执行以下命令：<br>
                                  <code>kill $server_pid</code>";
                    }
                } else {
                    $output = "服务器未运行";
                }
                break;
                
            case 'status':
                $output = $is_running ? 
                    "服务器正在运行 (PID: $server_pid, 端口: $current_port)" : 
                    "服务器未运行";
                break;
                
            case 'viewlog':
                if (file_exists(__DIR__ . "/server.log")) {
                    // 显示最后100行日志
                    if (function_exists('shell_exec')) {
                        $log = shell_exec("tail -n 100 " . __DIR__ . "/server.log");
                    } else {
                        $log = file_get_contents(__DIR__ . "/server.log");
                        // 仅保留最后的部分
                        $log_lines = explode("\n", $log);
                        if (count($log_lines) > 100) {
                            $log_lines = array_slice($log_lines, -100);
                            $log = implode("\n", $log_lines);
                        }
                    }
                    $output = "<pre>" . htmlspecialchars($log) . "</pre>";
                } else {
                    $output = "日志文件不存在";
                }
                break;
        }
    }
    
    // 更新状态
    $status = $is_running ? 
        "服务器正在运行 (PID: $server_pid, 端口: $current_port)" : 
        "服务器未运行";
}
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目服务器控制</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4a7b60;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .login-form {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn {
            display: inline-block;
            padding: 8px 15px;
            background-color: #4a7b60;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
        }
        .btn:hover {
            background-color: #3a6b50;
        }
        .btn-danger {
            background-color: #d9534f;
        }
        .btn-danger:hover {
            background-color: #c9433f;
        }
        .status-panel {
            margin: 20px 0;
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #4a7b60;
        }
        .controls {
            margin: 20px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .output {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow-x: auto;
        }
        .error {
            color: #d9534f;
            margin-bottom: 15px;
        }
        code {
            font-family: Consolas, Monaco, monospace;
            background-color: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .advanced-options {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #ddd;
        }
        .inline-form {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .inline-form input[type="number"] {
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PurelyHandmade 服务器控制</h1>
        
        <?php if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']): ?>
            <!-- 登录表单 -->
            <div class="login-form">
                <h2>管理员登录</h2>
                
                <?php if (isset($error)): ?>
                    <div class="error"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="post">
                    <div class="form-group">
                        <label for="password">管理员密码:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn">登录</button>
                </form>
            </div>
            
        <?php else: ?>
            <!-- 已登录 - 控制面板 -->
            <div style="text-align: right;">
                <a href="?logout=1" class="btn btn-danger">退出登录</a>
            </div>
            
            <div class="status-panel">
                <strong>当前状态:</strong> <?php echo $status; ?>
            </div>
            
            <div class="controls">
                <form method="post">
                    <button type="submit" name="action" value="start" class="btn">启动服务器</button>
                </form>
                
                <form method="post">
                    <button type="submit" name="action" value="stop" class="btn btn-danger">停止服务器</button>
                </form>
                
                <form method="post">
                    <button type="submit" name="action" value="status" class="btn">检查状态</button>
                </form>
                
                <form method="post">
                    <button type="submit" name="action" value="viewlog" class="btn">查看日志</button>
                </form>
            </div>
            
            <div class="advanced-options">
                <h3>高级选项</h3>
                <form method="post" class="inline-form">
                    <label for="custom-port">指定端口启动:</label>
                    <input type="number" id="custom-port" name="port" value="<?php echo $current_port; ?>" min="1024" max="65535">
                    <input type="hidden" name="action" value="start">
                    <button type="submit" class="btn">使用此端口启动</button>
                </form>
            </div>
            
            <?php if ($output): ?>
                <div class="output">
                    <?php echo $output; ?>
                </div>
            <?php endif; ?>
            
            <div class="manual-instructions" style="margin-top: 30px;">
                <h3>手动控制指令</h3>
                <p>如果自动控制不起作用，您可以使用SSH连接到服务器并执行以下命令：</p>
                
                <h4>启动服务器</h4>
                <code>cd <?php echo htmlspecialchars($server_config['root_dir']); ?> && php -S <?php echo htmlspecialchars($server_config['host']); ?>:<?php echo htmlspecialchars($current_port); ?> -t .</code>
                
                <?php if ($is_running): ?>
                <h4>停止服务器</h4>
                <code>kill <?php echo htmlspecialchars($server_pid); ?></code>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html> 