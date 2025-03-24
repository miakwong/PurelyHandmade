<?php
// 安全保护 - 简单密码验证
session_start();
$admin_password = "admin123"; // 请修改为强密码

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

// 处理操作命令
$output = "";
$status = "";
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in']) {
    $pid_file = __DIR__ . "/server.pid";
    
    // 检查服务器状态
    $is_running = false;
    if (file_exists($pid_file)) {
        $pid = (int)file_get_contents($pid_file);
        // 检查进程是否运行
        exec("ps -p $pid -o pid=", $output_array, $return_code);
        $is_running = $return_code === 0;
    }
    
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'start':
                if ($is_running) {
                    $output = "服务器已经在运行中 (PID: $pid)";
                } else {
                    // 启动服务器，获取可用端口
                    exec("netstat -an | grep LISTEN | grep tcp4 | awk '{print $4}' | grep -o '[0-9]*$' | sort -n", $ports);
                    $port = 8000;
                    while (in_array($port, $ports)) {
                        $port++;
                    }
                    
                    $root_dir = __DIR__;
                    $log_file = "$root_dir/server.log";
                    
                    // 使用nohup确保进程在后台运行
                    $command = "cd $root_dir && nohup php -S 0.0.0.0:$port -t . > $log_file 2>&1 & echo $!";
                    exec($command, $output_array);
                    $new_pid = (int)$output_array[0];
                    
                    if ($new_pid > 0) {
                        file_put_contents($pid_file, $new_pid);
                        $output = "服务器已启动 (PID: $new_pid, 端口: $port)";
                        $is_running = true;
                        $pid = $new_pid;
                        // 保存端口信息
                        file_put_contents(__DIR__ . "/server.port", $port);
                    } else {
                        $output = "启动服务器时出错";
                    }
                }
                break;
                
            case 'stop':
                if ($is_running) {
                    exec("kill $pid", $output_array, $return_code);
                    if ($return_code === 0) {
                        unlink($pid_file);
                        if (file_exists(__DIR__ . "/server.port")) {
                            unlink(__DIR__ . "/server.port");
                        }
                        $output = "服务器已停止 (PID: $pid)";
                        $is_running = false;
                    } else {
                        $output = "停止服务器时出错";
                    }
                } else {
                    $output = "服务器未运行";
                }
                break;
                
            case 'restart':
                // 先停止
                if ($is_running) {
                    exec("kill $pid", $output_array, $return_code);
                    if ($return_code === 0) {
                        unlink($pid_file);
                    }
                }
                
                // 再启动
                // 获取可用端口
                exec("netstat -an | grep LISTEN | grep tcp4 | awk '{print $4}' | grep -o '[0-9]*$' | sort -n", $ports);
                $port = 8000;
                while (in_array($port, $ports)) {
                    $port++;
                }
                
                $root_dir = __DIR__;
                $log_file = "$root_dir/server.log";
                
                $command = "cd $root_dir && nohup php -S 0.0.0.0:$port -t . > $log_file 2>&1 & echo $!";
                exec($command, $output_array);
                $new_pid = (int)$output_array[0];
                
                if ($new_pid > 0) {
                    file_put_contents($pid_file, $new_pid);
                    file_put_contents(__DIR__ . "/server.port", $port);
                    $output = "服务器已重启 (PID: $new_pid, 端口: $port)";
                    $is_running = true;
                    $pid = $new_pid;
                } else {
                    $output = "重启服务器时出错";
                }
                break;
                
            case 'status':
                if ($is_running) {
                    $port = file_exists(__DIR__ . "/server.port") ? file_get_contents(__DIR__ . "/server.port") : "未知";
                    $output = "服务器正在运行 (PID: $pid, 端口: $port)";
                } else {
                    $output = "服务器未运行";
                }
                break;
                
            case 'viewlog':
                if (file_exists(__DIR__ . "/server.log")) {
                    $log_content = file_get_contents(__DIR__ . "/server.log");
                    $output = "<pre>" . htmlspecialchars($log_content) . "</pre>";
                } else {
                    $output = "日志文件不存在";
                }
                break;
        }
    }
    
    // 获取状态信息
    if ($is_running) {
        $port = file_exists(__DIR__ . "/server.port") ? file_get_contents(__DIR__ . "/server.port") : "未知";
        $status = "服务器正在运行 (PID: $pid, 端口: $port)";
    } else {
        $status = "服务器未运行";
    }
}
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PurelyHandmade 项目控制面板</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #5a8c70;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .login-form {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="password"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: #5a8c70;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
            margin-right: 10px;
        }
        .btn:hover {
            background-color: #4a7b60;
        }
        .btn-danger {
            background-color: #dc3545;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }
        .btn-info {
            background-color: #17a2b8;
        }
        .btn-info:hover {
            background-color: #138496;
        }
        .control-panel {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .status {
            margin: 20px 0;
            padding: 10px;
            border-radius: 4px;
            background-color: #e9ecef;
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
            color: #dc3545;
            margin-bottom: 15px;
        }
        .logout {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PurelyHandmade 项目控制面板</h1>
        
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
            <div class="logout">
                <a href="?logout=1" class="btn btn-danger">退出登录</a>
            </div>
            
            <div class="status">
                <strong>当前状态:</strong> <?php echo $status; ?>
            </div>
            
            <div class="control-panel">
                <form method="post">
                    <button type="submit" name="action" value="start" class="btn">启动服务器</button>
                    <button type="submit" name="action" value="stop" class="btn btn-danger">停止服务器</button>
                    <button type="submit" name="action" value="restart" class="btn">重启服务器</button>
                    <button type="submit" name="action" value="status" class="btn btn-info">检查状态</button>
                    <button type="submit" name="action" value="viewlog" class="btn btn-info">查看日志</button>
                </form>
            </div>
            
            <?php if ($output): ?>
                <div class="output">
                    <?php echo $output; ?>
                </div>
            <?php endif; ?>
            
        <?php endif; ?>
    </div>
</body>
</html> 