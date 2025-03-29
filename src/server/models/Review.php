<?php
namespace Models;

use Utils\Database;

class Review {
    private $db;
    public $table = 'Review';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        $sql = "SELECT r.*, u.username, p.name as productName 
                FROM $this->table r
                LEFT JOIN User u ON r.userId = u.id
                LEFT JOIN Product p ON r.productId = p.id
                WHERE r.id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function create($data) {
        // Set default values
        $data['status'] = $data['status'] ?? 'pending';
        $data['createdAt'] = date('Y-m-d H:i:s');
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        return $this->db->insert($this->table, $data);
    }
    
    public function update($id, $data) {
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
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
        
        if (isset($filters['productId']) && !empty($filters['productId'])) {
            $whereConditions[] = 'r.productId = :productId';
            $params['productId'] = $filters['productId'];
        }
        
        if (isset($filters['userId']) && !empty($filters['userId'])) {
            $whereConditions[] = 'r.userId = :userId';
            $params['userId'] = $filters['userId'];
        }
        
        if (isset($filters['status']) && !empty($filters['status'])) {
            $whereConditions[] = 'r.status = :status';
            $params['status'] = $filters['status'];
        } else {
            // By default, only show approved reviews
            $whereConditions[] = 'r.status = :status';
            $params['status'] = 'approved';
        }
        
        $whereClause = !empty($whereConditions) 
            ? 'WHERE ' . implode(' AND ', $whereConditions)
            : '';
        
        // Count total reviews matching the filters
        $countSql = "SELECT COUNT(*) as total FROM $this->table r $whereClause";
        $totalResult = $this->db->fetch($countSql, $params);
        $total = $totalResult['total'] ?? 0;
        
        // Get reviews with pagination
        $sql = "SELECT r.*, u.username, p.name as productName 
                FROM $this->table r
                LEFT JOIN User u ON r.userId = u.id
                LEFT JOIN Product p ON r.productId = p.id
                $whereClause
                ORDER BY r.createdAt DESC 
                LIMIT :limit OFFSET :offset";
        
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $reviews = $this->db->fetchAll($sql, $params);
        
        return [
            'reviews' => $reviews,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit)
        ];
    }
    
    public function getAverageRating($productId) {
        $sql = "SELECT AVG(rating) as average FROM $this->table WHERE productId = :productId AND status = 'approved'";
        $result = $this->db->fetch($sql, ['productId' => $productId]);
        return round($result['average'] ?? 0, 1);
    }
    
    public function hasUserReviewed($userId, $productId) {
        $sql = "SELECT COUNT(*) as count FROM $this->table WHERE userId = :userId AND productId = :productId";
        $result = $this->db->fetch($sql, [
            'userId' => $userId,
            'productId' => $productId
        ]);
        return ($result['count'] ?? 0) > 0;
    }
} 