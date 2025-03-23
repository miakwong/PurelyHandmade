<?php
namespace Controllers;

use Models\Order;
use Models\OrderItem;
use Models\Product;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class OrderController {
    private $db;
    private $order;
    private $orderItem;
    private $product;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->order = new Order($this->db);
        $this->orderItem = new OrderItem($this->db);
        $this->product = new Product($this->db);
        $this->logger = new Logger('order.log');
    }
    
    public function getOrders($filters = [], $page = 1, $limit = 10) {
        try {
            // 获取用户ID和请求参数
            $userId = $_REQUEST['userId'] ?? null;
            $isAdmin = isset($_REQUEST['isAdmin']) ? (bool)$_REQUEST['isAdmin'] : false;
            $getAll = isset($_GET['all']) && $_GET['all'] == '1';
            
            // 获取日期过滤参数
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            
            // 初始化一个新的过滤器数组，避免传入的filters被直接修改
            $queryFilters = [];
            
            // 管理员请求所有订单时，不添加userId过滤
            if ($isAdmin && $getAll) {
                // 不添加userId过滤，返回所有订单
                $this->logger->info('管理员请求所有订单，不添加userId过滤');
            } else {
                // 否则只返回当前用户的订单
                $queryFilters['userId'] = $userId;
            }
            
            // 添加日期过滤条件
            if ($startDate) {
                $queryFilters['start_date'] = $startDate;
                $this->logger->info('添加开始日期过滤: ' . $startDate);
            }
            
            if ($endDate) {
                $queryFilters['end_date'] = $endDate;
                $this->logger->info('添加结束日期过滤: ' . $endDate);
            }
            
            // 记录日志，帮助调试
            $this->logger->info('获取订单', [
                'userId' => $userId,
                'isAdmin' => $isAdmin ? 'true' : 'false',
                'getAll' => $getAll ? 'true' : 'false',
                'filters' => $queryFilters,
                'date_range' => [$startDate, $endDate]
            ]);
            
            $result = $this->order->getAll($queryFilters, $page, $limit);
            
            $this->logger->info('查询结果', [
                'total' => $result['total'],
                'orders_count' => count($result['orders'])
            ]);
            
            return [
                'success' => true,
                'message' => 'Success',
                'data' => $result
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get orders failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get orders: ' . $e->getMessage()
            ];
        }
    }
    
    public function getOrderById($id, $userId = null) {
        try {
            $order = $this->order->getOrderWithItems($id);
            
            if (!$order) {
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }
            
            // If userId is provided, ensure it matches the order's userId
            if ($userId !== null && $order['userId'] != $userId) {
                return [
                    'success' => false,
                    'message' => 'You do not have permission to view this order'
                ];
            }
            
            return [
                'success' => true,
                'order' => $order
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get order by ID failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get order: ' . $e->getMessage()
            ];
        }
    }
    
    public function createOrder($data) {
        try {
            // Start a transaction
            $this->db->query('START TRANSACTION');
            
            // Validate input
            $validator = new Validator($data, [
                'userId' => 'required|integer',
                'items' => 'required'
            ]);
            
            if (!$validator->validate()) {
                $this->db->query('ROLLBACK');
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors()
                ];
            }
            
            // Validate items
            if (!is_array($data['items']) || empty($data['items'])) {
                $this->db->query('ROLLBACK');
                return [
                    'success' => false,
                    'message' => 'Order must contain at least one item'
                ];
            }
            
            // Check product availability and collect item details
            $orderItems = [];
            $totalAmount = 0;
            
            foreach ($data['items'] as $item) {
                // Validate item data
                if (!isset($item['productId']) || !isset($item['quantity']) || $item['quantity'] <= 0) {
                    $this->db->query('ROLLBACK');
                    return [
                        'success' => false,
                        'message' => 'Invalid item data'
                    ];
                }
                
                // Get product details
                $product = $this->product->findById($item['productId']);
                
                if (!$product) {
                    $this->db->query('ROLLBACK');
                    return [
                        'success' => false,
                        'message' => 'Product not found: ' . $item['productId']
                    ];
                }
                
                // Check if product is active
                if (!$product['active']) {
                    $this->db->query('ROLLBACK');
                    return [
                        'success' => false,
                        'message' => 'Product is not available: ' . $product['name']
                    ];
                }
                
                // Check if enough stock is available
                if ($product['stock'] < $item['quantity']) {
                    $this->db->query('ROLLBACK');
                    return [
                        'success' => false,
                        'message' => 'Not enough stock available for ' . $product['name'] . '. Available: ' . $product['stock']
                    ];
                }
                
                // Add to order items
                $orderItems[] = [
                    'productId' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'price' => $product['price']
                ];
                
                // Update total amount
                $totalAmount += $product['price'] * $item['quantity'];
            }
            
            // Create order
            $orderData = [
                'userId' => $data['userId'],
                'totalAmount' => $totalAmount,
                'status' => 'pending'
            ];
            
            // Add shipping info if present
            if (isset($data['shippingInfo'])) {
                $orderData['shippingInfo'] = $data['shippingInfo'];
            }
            
            // Add payment info if present
            if (isset($data['paymentInfo'])) {
                $orderData['paymentInfo'] = $data['paymentInfo'];
            }
            
            // Add notes if present
            if (isset($data['notes'])) {
                $orderData['notes'] = $data['notes'];
            }
            
            $orderId = $this->order->create($orderData);
            
            // Create order items
            foreach ($orderItems as $item) {
                $this->orderItem->create([
                    'orderId' => $orderId,
                    'productId' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);
                
                // Update product stock
                $this->product->updateStock($item['productId'], $item['quantity']);
            }
            
            // Commit transaction
            $this->db->query('COMMIT');
            
            // Get the created order with items
            $order = $this->order->getOrderWithItems($orderId);
            
            $this->logger->info('Order created', [
                'id' => $orderId, 
                'userId' => $data['userId'],
                'totalAmount' => $totalAmount
            ]);
            
            return [
                'success' => true,
                'message' => 'Order created successfully',
                'order' => $order
            ];
        } catch (\Exception $e) {
            // Rollback transaction on error
            $this->db->query('ROLLBACK');
            
            $this->logger->error('Create order failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateOrderStatus($id, $status, $notes = null) {
        try {
            // Check if order exists
            $existingOrder = $this->order->findById($id);
            if (!$existingOrder) {
                return [
                    'success' => false,
                    'message' => 'Order not found'
                ];
            }
            
            // Validate status
            $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!in_array($status, $validStatuses)) {
                return [
                    'success' => false,
                    'message' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)
                ];
            }
            
            // Update order status
            $updateData = [
                'status' => $status
            ];
            
            if ($notes !== null) {
                $updateData['notes'] = $notes;
            }
            
            $this->order->update($id, $updateData);
            
            // Get updated order
            $updatedOrder = $this->order->getOrderWithItems($id);
            
            $this->logger->info('Order status updated', ['id' => $id, 'status' => $status]);
            
            return [
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => $updatedOrder
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update order status failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ];
        }
    }
    
    public function getUserOrders($userId, $page = 1, $limit = 10) {
        try {
            $filters = ['userId' => $userId];
            return $this->getOrders($filters, $page, $limit);
        } catch (\Exception $e) {
            $this->logger->error('Get user orders failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get user orders: ' . $e->getMessage()
            ];
        }
    }
    
    public function getOrderStats() {
        try {
            $stats = $this->order->getOrderStats();
            
            return [
                'success' => true,
                'stats' => $stats
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get order stats failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get order statistics: ' . $e->getMessage()
            ];
        }
    }
} 