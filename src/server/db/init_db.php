<?php
/**
 * 数据库初始化脚本
 * 这个脚本用于创建数据库表并插入初始数据
 */

// 载入配置
$configData = require __DIR__ . "/../config.php";
$config = $configData[$configData['ENV_MODE']];

// 创建数据库连接
try {
    $pdo = new PDO(
        "mysql:host=" . $config['host'],
        $config['username'],
        $config['password']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 创建数据库（如果不存在）
    echo "Creating database if not exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . $config['dbname'] . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    
    // 切换到指定数据库
    $pdo->exec("USE `" . $config['dbname'] . "`;");
    
    // 读取SQL文件
    echo "Reading SQL initialization file...\n";
    $sql = file_get_contents(__DIR__ . '/init_database.sql');
    
    // 执行SQL脚本
    echo "Executing SQL script...\n";
    $result = $pdo->exec($sql);
    
    echo "Database initialization completed successfully!\n";
    
    // 验证数据是否插入成功
    echo "\nVerifying data...\n";
    
    // 验证用户表
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "Users: {$userCount}\n";
    
    // 验证类别表
    $categoryCount = $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    echo "Categories: {$categoryCount}\n";
    
    // 验证设计师表
    $designerCount = $pdo->query("SELECT COUNT(*) FROM designers")->fetchColumn();
    echo "Designers: {$designerCount}\n";
    
    // 验证产品表
    $productCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    echo "Products: {$productCount}\n";
    
    // 验证评论表
    $reviewCount = $pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
    echo "Reviews: {$reviewCount}\n";
    
    echo "\nDatabase setup completed successfully!\n";
} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?> 