<?php
/**
 * 数据库操作示例脚本
 * 展示如何使用Database类执行常见操作
 */

// 引入Database类
require_once __DIR__ . "/../controllers/Database.php";

echo "PurelyHandmade数据库操作示例\n";
echo "============================\n\n";

try {
    // 创建数据库连接实例
    $db = new Database();
    echo "数据库连接成功！\n\n";
    
    // 示例1: 查询所有产品
    echo "示例1: 查询所有产品\n";
    echo "--------------------\n";
    $products = $db->fetchAll("SELECT * FROM products LIMIT 5");
    
    echo "产品数量: " . count($products) . "\n";
    foreach ($products as $product) {
        echo "ID: {$product['id']}, 名称: {$product['name']}, 价格: {$product['price']}\n";
    }
    echo "\n";
    
    // 示例2: 查询特定分类的产品
    echo "示例2: 查询特定分类的产品\n";
    echo "-------------------------\n";
    $categoryId = 1; // 假设ID为1的是某个分类
    $categoryProducts = $db->fetchAll(
        "SELECT p.*, c.name as category_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         WHERE p.category_id = ? 
         LIMIT 5", 
        [$categoryId]
    );
    
    echo "分类ID {$categoryId} 的产品数量: " . count($categoryProducts) . "\n";
    if (count($categoryProducts) > 0) {
        echo "分类名称: " . ($categoryProducts[0]['category_name'] ?? '未知') . "\n";
        foreach ($categoryProducts as $product) {
            echo "ID: {$product['id']}, 名称: {$product['name']}, 价格: {$product['price']}\n";
        }
    } else {
        echo "该分类没有产品\n";
    }
    echo "\n";
    
    // 示例3: 查询用户数据
    echo "示例3: 查询用户数据\n";
    echo "--------------------\n";
    $users = $db->fetchAll("SELECT * FROM users LIMIT 5");
    
    echo "用户数量: " . count($users) . "\n";
    foreach ($users as $user) {
        // 出于安全考虑，不显示密码
        echo "ID: {$user['id']}, 用户名: {$user['username']}, 邮箱: {$user['email']}\n";
    }
    echo "\n";
    
    // 示例4: 计算表的统计数据
    echo "示例4: 数据库统计信息\n";
    echo "--------------------\n";
    $tables = ['products', 'categories', 'users', 'orders', 'reviews', 'designers'];
    
    foreach ($tables as $table) {
        $count = $db->fetchOne("SELECT COUNT(*) as count FROM {$table}");
        echo "表 '{$table}' 中有 " . ($count['count'] ?? 0) . " 条记录\n";
    }
    
    echo "\n数据库操作示例完成！\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?> 