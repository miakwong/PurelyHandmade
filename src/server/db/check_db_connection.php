<?php
/**
 * 数据库连接测试脚本
 * 测试数据库连接是否成功
 */

// 载入配置
$configData = require __DIR__ . "/../config.php";
$config = $configData[$configData['ENV_MODE']];

echo "尝试连接到数据库...\n";
echo "环境: " . $configData['ENV_MODE'] . "\n";
echo "主机: " . $config['host'] . "\n";
echo "用户名: " . $config['username'] . "\n";
echo "数据库: " . $config['dbname'] . "\n\n";

try {
    // 首先尝试不指定数据库名称进行连接
    $pdo = new PDO(
        "mysql:host=" . $config['host'],
        $config['username'],
        $config['password']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "MySql服务器连接成功！\n";
    
    // 检查数据库是否存在
    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . $config['dbname'] . "'");
    $dbExists = $stmt->fetch();
    
    if ($dbExists) {
        echo "数据库 '" . $config['dbname'] . "' 已存在\n";
        
        // 切换到指定数据库
        $pdo->exec("USE `" . $config['dbname'] . "`;");
        echo "成功切换到数据库 '" . $config['dbname'] . "'\n\n";
        
        // 获取所有表名
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($tables) > 0) {
            echo "数据库中存在以下表:\n";
            foreach ($tables as $table) {
                // 获取表中的记录数
                $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
                echo "- $table ($count 条记录)\n";
            }
        } else {
            echo "数据库中没有表\n";
            echo "您可能需要运行初始化脚本: php src/server/db/init_db.php\n";
        }
    } else {
        echo "数据库 '" . $config['dbname'] . "' 不存在\n";
        echo "您可以运行初始化脚本创建数据库: php src/server/db/init_db.php\n";
    }
    
    echo "\n数据库连接测试完成！\n";
} catch (PDOException $e) {
    echo "数据库连接失败: " . $e->getMessage() . "\n";
    
    // 提供更详细的错误诊断信息
    if (strpos($e->getMessage(), "Access denied") !== false) {
        echo "\n可能的原因: 用户名或密码错误\n";
        echo "请检查config.php中的用户名和密码设置\n";
    } else if (strpos($e->getMessage(), "Unknown database") !== false) {
        echo "\n可能的原因: 数据库不存在\n";
        echo "您可以运行初始化脚本创建数据库: php src/server/db/init_db.php\n";
    } else if (strpos($e->getMessage(), "Connection refused") !== false) {
        echo "\n可能的原因: MySQL服务未运行或主机设置错误\n";
        echo "请确保MySQL服务已启动，并检查config.php中的host设置\n";
    }
}
?> 