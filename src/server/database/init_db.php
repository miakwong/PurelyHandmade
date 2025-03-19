<?php
/**
 * 数据库初始化脚本
 * 执行SQL脚本来创建和填充数据库
 */

// 载入配置文件
$configData = require_once __DIR__ . '/../config.php';
$config = $configData[$configData['ENV_MODE']];

try {
    // 连接到MySQL（不指定数据库，因为可能还不存在）
    $pdo = new PDO(
        "mysql:host={$config['host']};charset=utf8mb4",
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    echo "连接到MySQL成功\n";
    
    // 读取SQL脚本
    $sqlFile = __DIR__ . '/init_database.sql';
    $sql = file_get_contents($sqlFile);
    
    if (!$sql) {
        die("无法读取SQL文件: $sqlFile\n");
    }
    
    echo "成功读取SQL文件\n";
    
    // 分割SQL语句（按分号分割，但忽略引号内的分号）
    $queries = preg_split('/;\s*$/m', $sql);
    
    echo "开始执行SQL语句...\n";
    
    // 执行每个SQL语句
    foreach ($queries as $query) {
        $query = trim($query);
        if (empty($query)) {
            continue;
        }
        
        try {
            $pdo->exec($query);
            echo ".";
        } catch (PDOException $e) {
            echo "\n执行SQL语句时出错: " . $e->getMessage() . "\n";
            echo "查询: " . substr($query, 0, 100) . "...\n";
        }
    }
    
    echo "\n数据库初始化完成！\n";
    
    // 验证数据库是否创建成功
    $result = $pdo->query("SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema = 'purely_handmade'");
    $tableCount = $result->fetch()['tables'];
    
    echo "数据库中创建了 $tableCount 个表\n";
    
    // 检查示例数据
    $pdo->exec("USE purely_handmade");
    
    $tables = ['users', 'categories', 'designers', 'products', 'reviews', 'orders', 'order_items'];
    foreach ($tables as $table) {
        $result = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $count = $result->fetch()['count'];
        echo "$table 表中有 $count 条记录\n";
    }
    
} catch (PDOException $e) {
    die("数据库连接或初始化失败: " . $e->getMessage() . "\n");
} 