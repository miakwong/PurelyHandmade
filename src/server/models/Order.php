<?php
namespace Models;

use Utils\Database;

class Order {
    private $db;
    private $table = '`Order`';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM $this->table WHERE id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function create($data) {
        // Set default values
        $data['status'] = $data['status'] ?? 'pending';
        $data['orderDate'] = date('Y-m-d H:i:s');
        $data['createdAt'] = date('Y-m-d H:i:s');
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        // Handle JSON data
        if (isset($data['shippingInfo']) && is_array($data['shippingInfo'])) {
            $data['shippingInfo'] = json_encode($data['shippingInfo']);
        }
        
        if (isset($data['paymentInfo']) && is_array($data['paymentInfo'])) {
            $data['paymentInfo'] = json_encode($data['paymentInfo']);
        }
        
        return $this->db->insert($this->table, $data);
    }
    
    public function update($id, $data) {
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        // Handle JSON data
        if (isset($data['shippingInfo']) && is_array($data['shippingInfo'])) {
            $data['shippingInfo'] = json_encode($data['shippingInfo']);
        }
        
        if (isset($data['paymentInfo']) && is_array($data['paymentInfo'])) {
            $data['paymentInfo'] = json_encode($data['paymentInfo']);
        }
        
        return $this->db->update(
            $this->table, 
            $data, 
            'id = :id', 
            ['id' => $id]
        );
    }
    
    public function delete($id) {
        return $this->db->delete(
            $this->table, 
            'id = :id', 
            ['id' => $id]
        );
    }
    
    public function getAll($filters = [], $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        $whereConditions = [];
        $params = [];
        
        if (isset($filters['userId']) && !empty($filters['userId'])) {
            $whereConditions[] = 'userId = :userId';
            $params['userId'] = $filters['userId'];
        }
        
        if (isset($filters['status']) && !empty($filters['status'])) {
            $whereConditions[] = 'status = :status';
            $params['status'] = $filters['status'];
        }
        
        $whereClause = !empty($whereConditions) 
            ? 'WHERE ' . implode(' AND ', $whereConditions)
            : '';
        
        // Count total orders matching the filters
        $countSql = "SELECT COUNT(*) as total FROM $this->table $whereClause";
        $totalResult = $this->db->fetch($countSql, $params);
        $total = $totalResult['total'] ?? 0;
        
        // Get orders with pagination
        $sql = "SELECT * FROM $this->table $whereClause ORDER BY createdAt DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $orders = $this->db->fetchAll($sql, $params);
        
        // Decode JSON data
        foreach ($orders as &$order) {
            if (isset($order['shippingInfo']) && !is_null($order['shippingInfo'])) {
                $order['shippingInfo'] = json_decode($order['shippingInfo'], true);
            }
            
            if (isset($order['paymentInfo']) && !is_null($order['paymentInfo'])) {
                $order['paymentInfo'] = json_decode($order['paymentInfo'], true);
            }
        }
        
        return [
            'orders' => $orders,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit)
        ];
    }
    
    public function getOrderWithItems($id) {
        // Get order
        $order = $this->findById($id);
        
        if (!$order) {
            return null;
        }
        
        // Decode JSON data
        if (isset($order['shippingInfo']) && !is_null($order['shippingInfo'])) {
            $order['shippingInfo'] = json_decode($order['shippingInfo'], true);
        }
        
        if (isset($order['paymentInfo']) && !is_null($order['paymentInfo'])) {
            $order['paymentInfo'] = json_decode($order['paymentInfo'], true);
        }
        
        // Get order items
        $orderItem = new OrderItem($this->db);
        $items = $orderItem->getOrderItems($id);
        
        $order['items'] = $items;
        
        return $order;
    }
    
    public function calculateTotalAmount($items) {
        $total = 0;
        foreach ($items as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        return $total;
    }
    
    public function getOrderStats() {
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(totalAmount) as revenue
                FROM $this->table";
        
        return $this->db->fetch($sql);
    }
} 