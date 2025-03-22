<?php
/**
 * 数据库表结构查看脚本
 * 查看特定表的结构和字段信息
 */

// 载入配置
$configData = require __DIR__ . "/../config.php";
$config = $configData[$configData['ENV_MODE']];

// 要检查的表名
$tableName = isset($argv[1]) ? $argv[1] : 'orders';

echo "检查表 '{$tableName}' 的结构...\n\n";

try {
    // 连接数据库
    $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['dbname'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 获取表结构
    $stmt = $pdo->query("DESCRIBE `{$tableName}`");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($columns) > 0) {
        echo "表 '{$tableName}' 的结构如下:\n";
        echo str_repeat('-', 80) . "\n";
        echo sprintf("%-20s %-20s %-10s %-10s %-20s\n", "字段名", "类型", "可为空", "键", "默认值");
        echo str_repeat('-', 80) . "\n";
        
        foreach ($columns as $column) {
            echo sprintf(
                "%-20s %-20s %-10s %-10s %-20s\n",
                $column['Field'],
                $column['Type'],
                $column['Null'],
                $column['Key'],
                $column['Default'] === null ? 'NULL' : $column['Default']
            );
        }
        
        // 获取表的创建语句
        $stmt = $pdo->query("SHOW CREATE TABLE `{$tableName}`");
        $createTable = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\n完整的创建表语句:\n";
        echo str_repeat('-', 80) . "\n";
        echo $createTable['Create Table'] . ";\n";
    } else {
        echo "表 '{$tableName}' 不存在或没有列信息\n";
    }
    
    echo "\n表结构检查完成\n";
} catch (PDOException $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?> 