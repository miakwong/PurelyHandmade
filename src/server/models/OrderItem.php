<?php
namespace Models;

use Utils\Database;

class OrderItem {
    private $db;
    private $table = 'OrderItem';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM $this->table WHERE id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function create($data) {
        return $this->db->insert($this->table, $data);
    }
    
    public function getOrderItems($orderId) {
        $sql = "SELECT oi.*, p.name, p.image, p.slug 
                FROM $this->table oi
                LEFT JOIN Product p ON oi.productId = p.id
                WHERE oi.orderId = :orderId";
        
        return $this->db->fetchAll($sql, ['orderId' => $orderId]);
    }
    
    public function createOrderItems($orderId, $items) {
        foreach ($items as $item) {
            $this->create([
                'orderId' => $orderId,
                'productId' => $item['productId'],
                'quantity' => $item['quantity'],
                'price' => $item['price']
            ]);
        }
    }
    
    public function getTopSellingProducts($limit = 5) {
        $sql = "SELECT p.id, p.name, p.slug, p.image, SUM(oi.quantity) as total_sold 
                FROM $this->table oi
                JOIN Product p ON oi.productId = p.id
                JOIN `Order` o ON oi.orderId = o.id
                WHERE o.status != 'cancelled'
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT :limit";
        
        return $this->db->fetchAll($sql, ['limit' => $limit]);
    }
    
    public function getProductSalesData($productId) {
        $sql = "SELECT SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as total_revenue 
                FROM $this->table oi
                JOIN `Order` o ON oi.orderId = o.id
                WHERE oi.productId = :productId AND o.status != 'cancelled'";
        
        return $this->db->fetch($sql, ['productId' => $productId]);
    }
} 