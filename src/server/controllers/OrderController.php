<?php
/**
 * 订单控制器
 * 处理订单相关的API请求
 */
require_once __DIR__ . '/models.php';
require_once __DIR__ . '/Database.php';

class OrderController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * 创建新订单
     */
    public function createOrder() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['items']) || !is_array($data['items']) || empty($data['items']) || 
            !isset($data['shippingAddress']) || !isset($data['billingAddress']) || 
            !isset($data['paymentMethod'])) {
            sendApiResponse("Missing required fields", false, 400);
            return;
        }
        
        // 检查用户是否已登录
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        
        try {
            // 开始事务
            $this->db->beginTransaction();
            
            // 计算总金额并检查库存
            $totalAmount = 0;
            $orderItems = [];
            
            foreach ($data['items'] as $item) {
                if (!isset($item['productId']) || !isset($item['quantity'])) {
                    throw new Exception("Invalid item data");
                }
                
                // 获取产品信息
                $product = $this->db->fetchOne("
                    SELECT id, name, price, on_sale, sale_price, stock 
                    FROM products 
                    WHERE id = ?
                ", [$item['productId']]);
                
                if (!$product) {
                    throw new Exception("Product not found: " . $item['productId']);
                }
                
                // 检查库存
                if ($product['stock'] < $item['quantity']) {
                    throw new Exception("Not enough stock for product: " . $product['name']);
                }
                
                // 计算价格
                $price = $product['on_sale'] ? $product['sale_price'] : $product['price'];
                $subtotal = $price * $item['quantity'];
                
                // 更新总金额
                $totalAmount += $subtotal;
                
                // 准备订单项数据
                $orderItems[] = [
                    'product_id' => $product['id'],
                    'product_name' => $product['name'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $subtotal
                ];
                
                // 更新产品库存
                $newStock = $product['stock'] - $item['quantity'];
                $this->db->update(
                    "products",
                    [
                        'stock' => $newStock,
                        'updated_at' => date('Y-m-d H:i:s')
                    ],
                    "id = ?",
                    [$product['id']]
                );
            }
            
            // 创建订单
            $orderData = [
                'user_id' => $userId,
                'order_date' => date('Y-m-d H:i:s'),
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'shipping_address' => $data['shippingAddress'],
                'billing_address' => $data['billingAddress'],
                'payment_method' => $data['paymentMethod'],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $orderId = $this->db->insert("orders", $orderData);
            
            if (!$orderId) {
                throw new Exception("Failed to create order");
            }
            
            // 创建订单项
            foreach ($orderItems as $item) {
                $orderItemData = [
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
                
                $success = $this->db->insert("order_items", $orderItemData);
                
                if (!$success) {
                    throw new Exception("Failed to create order item");
                }
            }
            
            // 提交事务
            $this->db->commit();
            
            // 获取完整订单信息
            $order = $this->getOrderDetails($orderId);
            
            sendApiResponse($order, true, 201);
        } catch (Exception $e) {
            // 回滚事务
            $this->db->rollback();
            sendApiResponse("Error creating order: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取用户订单列表
     */
    public function getUserOrders() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            sendApiResponse("Not logged in", false, 401);
            return;
        }
        
        try {
            $orders = $this->db->fetchAll("
                SELECT * FROM orders 
                WHERE user_id = ? 
                ORDER BY order_date DESC
            ", [$_SESSION['user_id']]);
            
            $formattedOrders = [];
            foreach ($orders as $order) {
                // 获取订单项
                $items = $this->db->fetchAll("
                    SELECT * FROM order_items 
                    WHERE order_id = ?
                ", [$order['id']]);
                
                $formattedItems = [];
                foreach ($items as $item) {
                    $formattedItems[] = [
                        'id' => $item['id'],
                        'productId' => $item['product_id'],
                        'productName' => $item['product_name'],
                        'quantity' => (int)$item['quantity'],
                        'price' => (float)$item['price'],
                        'subtotal' => (float)$item['subtotal']
                    ];
                }
                
                $formattedOrders[] = [
                    'id' => $order['id'],
                    'userId' => $order['user_id'],
                    'orderDate' => $order['order_date'],
                    'status' => $order['status'],
                    'totalAmount' => (float)$order['total_amount'],
                    'shippingAddress' => $order['shipping_address'],
                    'billingAddress' => $order['billing_address'],
                    'paymentMethod' => $order['payment_method'],
                    'items' => $formattedItems,
                    'createdAt' => $order['created_at'],
                    'updatedAt' => $order['updated_at']
                ];
            }
            
            sendApiResponse($formattedOrders);
        } catch (Exception $e) {
            sendApiResponse("Error fetching orders: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取单个订单详情
     * @param int $id 订单ID
     */
    public function getOrder($id) {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        try {
            // 获取订单信息
            $order = $this->db->fetchOne("SELECT * FROM orders WHERE id = ?", [$id]);
            
            if (!$order) {
                sendApiResponse("Order not found", false, 404);
                return;
            }
            
            // 检查是否为当前用户的订单或管理员
            if ($order['user_id'] != $_SESSION['user_id'] && !$this->isAdmin()) {
                sendApiResponse("Unauthorized", false, 403);
                return;
            }
            
            // 获取完整订单信息
            $orderDetails = $this->getOrderDetails($id);
            
            sendApiResponse($orderDetails);
        } catch (Exception $e) {
            sendApiResponse("Error fetching order: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 更新订单状态（管理员功能）
     * @param int $id 订单ID
     */
    public function updateOrderStatus($id) {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['status'])) {
            sendApiResponse("Status is required", false, 400);
            return;
        }
        
        // 检查状态值是否有效
        $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($data['status'], $validStatuses)) {
            sendApiResponse("Invalid status value", false, 400);
            return;
        }
        
        // 检查订单是否存在
        $order = $this->db->fetchOne("SELECT id FROM orders WHERE id = ?", [$id]);
        if (!$order) {
            sendApiResponse("Order not found", false, 404);
            return;
        }
        
        // 更新订单状态
        $success = $this->db->update(
            "orders",
            [
                'status' => $data['status'],
                'updated_at' => date('Y-m-d H:i:s')
            ],
            "id = ?",
            [$id]
        );
        
        if ($success) {
            // 获取更新后的订单信息
            $updatedOrder = $this->getOrderDetails($id);
            
            sendApiResponse($updatedOrder);
        } else {
            sendApiResponse("Failed to update order status", false, 500);
        }
    }
    
    /**
     * 获取所有订单（管理员功能）
     */
    public function getAllOrders() {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        try {
            $orders = $this->db->fetchAll("
                SELECT o.*, u.username
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.order_date DESC
            ");
            
            $formattedOrders = [];
            foreach ($orders as $order) {
                // 获取订单项
                $items = $this->db->fetchAll("
                    SELECT * FROM order_items 
                    WHERE order_id = ?
                ", [$order['id']]);
                
                $formattedItems = [];
                foreach ($items as $item) {
                    $formattedItems[] = [
                        'id' => $item['id'],
                        'productId' => $item['product_id'],
                        'productName' => $item['product_name'],
                        'quantity' => (int)$item['quantity'],
                        'price' => (float)$item['price'],
                        'subtotal' => (float)$item['subtotal']
                    ];
                }
                
                $formattedOrders[] = [
                    'id' => $order['id'],
                    'userId' => $order['user_id'],
                    'username' => $order['username'],
                    'orderDate' => $order['order_date'],
                    'status' => $order['status'],
                    'totalAmount' => (float)$order['total_amount'],
                    'shippingAddress' => $order['shipping_address'],
                    'billingAddress' => $order['billing_address'],
                    'paymentMethod' => $order['payment_method'],
                    'items' => $formattedItems,
                    'createdAt' => $order['created_at'],
                    'updatedAt' => $order['updated_at']
                ];
            }
            
            sendApiResponse($formattedOrders);
        } catch (Exception $e) {
            sendApiResponse("Error fetching orders: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取订单详细信息
     * @param int $orderId 订单ID
     * @return array 订单详情
     */
    private function getOrderDetails($orderId) {
        // 获取订单信息
        $order = $this->db->fetchOne("
            SELECT o.*, u.username
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        ", [$orderId]);
        
        // 获取订单项
        $items = $this->db->fetchAll("
            SELECT * FROM order_items 
            WHERE order_id = ?
        ", [$orderId]);
        
        $formattedItems = [];
        foreach ($items as $item) {
            $formattedItems[] = [
                'id' => $item['id'],
                'productId' => $item['product_id'],
                'productName' => $item['product_name'],
                'quantity' => (int)$item['quantity'],
                'price' => (float)$item['price'],
                'subtotal' => (float)$item['subtotal']
            ];
        }
        
        return [
            'id' => $order['id'],
            'userId' => $order['user_id'],
            'username' => $order['username'] ?? null,
            'orderDate' => $order['order_date'],
            'status' => $order['status'],
            'totalAmount' => (float)$order['total_amount'],
            'shippingAddress' => $order['shipping_address'],
            'billingAddress' => $order['billing_address'],
            'paymentMethod' => $order['payment_method'],
            'items' => $formattedItems,
            'createdAt' => $order['created_at'],
            'updatedAt' => $order['updated_at']
        ];
    }
    
    /**
     * 检查当前用户是否为管理员
     * @return bool
     */
    private function isAdmin() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
        
        // 获取用户角色
        $user = $this->db->fetchOne("SELECT role FROM users WHERE id = ?", [$_SESSION['user_id']]);
        
        return $user && $user['role'] === 'admin';
    }
} 