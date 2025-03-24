<?php
namespace Models;

use Utils\Database;

class Designer {
    private $db;
    private $table = 'Designer';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM $this->table WHERE id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function findBySlug($slug) {
        $sql = "SELECT * FROM $this->table WHERE slug = :slug";
        return $this->db->fetch($sql, ['slug' => $slug]);
    }
    
    public function create($data) {
        // Set default values
        $data['featured'] = $data['featured'] ?? 0;
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
    
    public function getAll($filters = []) {
        $whereConditions = [];
        $params = [];
        
        if (isset($filters['featured']) && $filters['featured'] == 1) {
            $whereConditions[] = 'featured = 1';
        }
        
        $whereClause = !empty($whereConditions) 
            ? 'WHERE ' . implode(' AND ', $whereConditions)
            : '';
        
        $sql = "SELECT * FROM $this->table $whereClause ORDER BY name ASC";
        
        $designers = $this->db->fetchAll($sql, $params);
        
        return [
            'designers' => $designers,
            'total' => count($designers)
        ];
    }
    
    public function getProductCount($designerId) {
        $sql = "SELECT COUNT(*) as count FROM Product WHERE designerId = :designerId AND active = 1";
        $result = $this->db->fetch($sql, ['designerId' => $designerId]);
        return $result['count'] ?? 0;
    }
} 