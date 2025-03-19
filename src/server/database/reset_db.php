<?php
/**
 * 数据库重置脚本
 * 删除并重新创建数据库
 */

// 载入配置文件
$configData = require_once __DIR__ . '/../config.php';
$config = $configData[$configData['ENV_MODE']];

try {
    // 连接到MySQL（不指定数据库）
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
    
    // 删除数据库（如果存在）
    $dbname = $config['dbname'];
    $pdo->exec("DROP DATABASE IF EXISTS `$dbname`");
    echo "已删除数据库 '$dbname'（如果存在）\n";
    
    // 创建数据库
    $pdo->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "已创建新数据库 '$dbname'\n";
    
    // 选择数据库
    $pdo->exec("USE `$dbname`");
    
    // 读取SQL脚本
    $sqlFile = __DIR__ . '/init_database.sql';
    $sql = file_get_contents($sqlFile);
    
    if (!$sql) {
        die("无法读取SQL文件: $sqlFile\n");
    }
    
    echo "成功读取SQL文件\n";
    
    // 移除创建数据库语句（因为我们已经创建过了）
    $sql = preg_replace('/CREATE DATABASE.*?;/s', '', $sql);
    $sql = preg_replace('/USE.*?;/s', '', $sql);
    
    // 分割SQL语句
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
    
    echo "\n数据库重置和初始化完成！\n";
    
    // 验证数据库是否创建成功
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll();
    
    echo "数据库中创建了 " . count($tables) . " 个表:\n";
    foreach ($tables as $table) {
        $tableName = $table[array_key_first($table)];
        $count = $pdo->query("SELECT COUNT(*) as count FROM `$tableName`")->fetch()['count'];
        echo "- $tableName ($count 条记录)\n";
    }
    
} catch (PDOException $e) {
    die("数据库连接或初始化失败: " . $e->getMessage() . "\n");
} 