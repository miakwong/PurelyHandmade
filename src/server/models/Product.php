<?php
namespace Models;

use Utils\Database;

class Product {
    private $db;
    public $table = 'Product';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        $sql = "SELECT p.*, c.name as categoryName, d.name as designerName 
                FROM $this->table p
                LEFT JOIN Category c ON p.categoryId = c.id
                LEFT JOIN Designer d ON p.designerId = d.id
                WHERE p.id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function findBySlug($slug) {
        $sql = "SELECT p.*, c.name as categoryName, d.name as designerName 
                FROM $this->table p
                LEFT JOIN Category c ON p.categoryId = c.id
                LEFT JOIN Designer d ON p.designerId = d.id
                WHERE p.slug = :slug";
        return $this->db->fetch($sql, ['slug' => $slug]);
    }
    
    public function create($data) {
        // Set default values
        $data['active'] = $data['active'] ?? 1;
        $data['featured'] = $data['featured'] ?? 0;
        $data['stock'] = $data['stock'] ?? 0;
        $data['createdAt'] = date('Y-m-d H:i:s');
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        // Handle gallery JSON data
        if (isset($data['gallery']) && is_array($data['gallery'])) {
            $data['gallery'] = json_encode($data['gallery']);
        }
        
        return $this->db->insert($this->table, $data);
    }
    
    public function update($id, $data) {
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        // Handle gallery JSON data
        if (isset($data['gallery']) && is_array($data['gallery'])) {
            $data['gallery'] = json_encode($data['gallery']);
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
        
        if (isset($filters['active']) && $filters['active'] !== '') {
            $whereConditions[] = 'p.active = :active';
            $params['active'] = $filters['active'];
        } else {
            // By default, only show active products
            $whereConditions[] = 'p.active = 1';
        }
        
        if (isset($filters['category']) && !empty($filters['category'])) {
            $whereConditions[] = 'p.categoryId = :categoryId';
            $params['categoryId'] = $filters['category'];
        }
        
        if (isset($filters['designer']) && !empty($filters['designer'])) {
            $whereConditions[] = 'p.designerId = :designerId';
            $params['designerId'] = $filters['designer'];
        }
        
        if (isset($filters['featured']) && $filters['featured'] == 1) {
            $whereConditions[] = 'p.featured = 1';
        }
        
        $whereClause = !empty($whereConditions) 
            ? 'WHERE ' . implode(' AND ', $whereConditions)
            : '';
        
        // Count total products matching the filters
        $countSql = "SELECT COUNT(*) as total FROM $this->table p $whereClause";
        $totalResult = $this->db->fetch($countSql, $params);
        $total = $totalResult['total'] ?? 0;
        
        // Get products with pagination
        $sql = "SELECT p.*, c.name as categoryName, d.name as designerName 
                FROM $this->table p
                LEFT JOIN Category c ON p.categoryId = c.id
                LEFT JOIN Designer d ON p.designerId = d.id
                $whereClause
                ORDER BY p.createdAt DESC 
                LIMIT :limit OFFSET :offset";
        
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $products = $this->db->fetchAll($sql, $params);
        
        // Decode gallery JSON for each product
        foreach ($products as &$product) {
            if (isset($product['gallery']) && !is_null($product['gallery'])) {
                $product['gallery'] = json_decode($product['gallery'], true);
            }
        }
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit)
        ];
    }
    
    public function search($keyword, $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        $searchTerm = "%$keyword%";
        
        $whereClause = "WHERE p.active = 1 AND (p.name LIKE :search_name OR p.description LIKE :search_desc)";
        $params = [
            'search_name' => $searchTerm,
            'search_desc' => $searchTerm
        ];
        
        // Count total products matching the search
        $countSql = "SELECT COUNT(*) as total FROM $this->table p $whereClause";
        $totalResult = $this->db->fetch($countSql, $params);
        $total = $totalResult['total'] ?? 0;
        
        // Get products with pagination
        $sql = "SELECT p.*, c.name as categoryName, d.name as designerName 
                FROM $this->table p
                LEFT JOIN Category c ON p.categoryId = c.id
                LEFT JOIN Designer d ON p.designerId = d.id
                $whereClause
                ORDER BY p.createdAt DESC 
                LIMIT :limit OFFSET :offset";
        
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $products = $this->db->fetchAll($sql, $params);
        
        // Decode gallery JSON for each product
        foreach ($products as &$product) {
            if (isset($product['gallery']) && !is_null($product['gallery'])) {
                $product['gallery'] = json_decode($product['gallery'], true);
            }
        }
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit)
        ];
    }
    
    public function updateStock($id, $quantity) {
        $sql = "UPDATE $this->table SET stock = stock - :quantity, updatedAt = NOW() WHERE id = :id AND stock >= :quantity";
        return $this->db->query($sql, ['id' => $id, 'quantity' => $quantity])->rowCount() > 0;
    }
} 