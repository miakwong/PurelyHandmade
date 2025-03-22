<?php
/**
 * 高级数据库操作示例脚本
 * 展示如何使用数据库事务和执行复杂查询
 */

// 引入Database类
require_once __DIR__ . "/../controllers/Database.php";

echo "PurelyHandmade高级数据库操作示例\n";
echo "==============================\n\n";

try {
    // 创建数据库连接实例
    $db = new Database();
    echo "数据库连接成功！\n\n";
    
    // 示例1: 使用事务进行订单创建
    echo "示例1: 使用事务创建订单\n";
    echo "----------------------\n";
    
    // 模拟订单数据
    $userId = 1; // 假设用户ID为1
    $currentDate = date('Y-m-d H:i:s');
    $orderData = [
        'user_id' => $userId,
        'status' => 'pending',
        'total_amount' => 205.97, // 更新为25.99 + (89.99 * 2)
        'shipping_address' => '123 Main St, Anytown, AN 12345',
        'billing_address' => '123 Main St, Anytown, AN 12345',
        'payment_method' => 'credit_card', // 添加支付方式
        'created_at' => $currentDate,
        'updated_at' => $currentDate, // 添加更新时间
        'order_date' => $currentDate // 更新为datetime格式
    ];
    
    // 模拟订单项数据
    $orderItems = [
        [
            'product_id' => 1, // 修改为整数ID
            'quantity' => 1,
            'price' => 25.99
        ],
        [
            'product_id' => 2, // 修改为整数ID
            'quantity' => 2,
            'price' => 89.99
        ]
    ];
    
    echo "开始创建订单事务...\n";
    
    // 开始事务
    $db->beginTransaction();
    
    try {
        // 1. 插入订单记录
        $orderId = $db->insert('orders', $orderData);
        echo "创建订单记录，ID: {$orderId}\n";
        
        // 2. 插入订单项记录
        foreach ($orderItems as $item) {
            // 获取产品名称
            $product = $db->fetchOne("SELECT name FROM products WHERE id = ?", [$item['product_id']]);
            $productName = $product ? $product['name'] : 'Unknown Product';
            
            $orderItemData = [
                'order_id' => $orderId,
                'product_id' => $item['product_id'],
                'product_name' => $productName,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['quantity'] * $item['price'],
                'created_at' => $currentDate,
                'updated_at' => $currentDate
            ];
            
            $orderItemId = $db->insert('order_items', $orderItemData);
            echo "添加订单项：产品 {$item['product_id']}，数量 {$item['quantity']}，价格 {$item['price']}\n";
        }
        
        // 提交事务
        $db->commit();
        echo "订单事务提交成功！\n\n";
    } catch (Exception $e) {
        // 回滚事务
        $db->rollback();
        echo "订单创建失败，事务已回滚: " . $e->getMessage() . "\n\n";
    }
    
    // 示例2: 复杂查询 - 获取带有关联数据的订单
    echo "示例2: 复杂查询 - 获取带有关联数据的订单\n";
    echo "------------------------------------------\n";
    
    $orderQuery = "
        SELECT o.*, u.username, COUNT(oi.id) as item_count, SUM(oi.quantity) as total_items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ";
    
    $orders = $db->fetchAll($orderQuery);
    
    echo "查询到 " . count($orders) . " 个订单\n";
    foreach ($orders as $order) {
        echo "订单ID: {$order['id']}, 用户: {$order['username']}, 状态: {$order['status']}, " .
             "总金额: {$order['total_amount']}, 商品数量: {$order['total_items']}\n";
             
        // 获取订单详情
        $itemsQuery = "
            SELECT oi.*, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ";
        
        $items = $db->fetchAll($itemsQuery, [$order['id']]);
        
        echo "  包含 " . count($items) . " 个商品:\n";
        foreach ($items as $item) {
            echo "  - {$item['product_name']} (ID: {$item['product_id']}), " .
                 "数量: {$item['quantity']}, 单价: {$item['price']}, 小计: {$item['subtotal']}\n";
        }
        echo "\n";
    }
    
    // 示例3: 高级统计查询
    echo "示例3: 高级统计查询\n";
    echo "-------------------\n";
    
    // 各分类的产品数量和平均价格
    $categoryStatsQuery = "
        SELECT c.id, c.name, COUNT(p.id) as product_count, 
               AVG(p.price) as avg_price, MIN(p.price) as min_price, MAX(p.price) as max_price
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
    ";
    
    $categoryStats = $db->fetchAll($categoryStatsQuery);
    
    echo "分类统计:\n";
    foreach ($categoryStats as $stat) {
        echo "分类: {$stat['name']}, 产品数量: {$stat['product_count']}, " .
             "平均价格: " . number_format($stat['avg_price'], 2) . ", " .
             "价格范围: " . number_format($stat['min_price'], 2) . " - " . number_format($stat['max_price'], 2) . "\n";
    }
    
    echo "\n高级数据库操作示例完成！\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?> 