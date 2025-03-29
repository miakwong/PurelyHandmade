<?php
namespace Models;

use Utils\Database;

class User {
    private $db;
    public $table = 'User';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        if (!is_numeric($id)) {
            error_log("Invalid user ID provided: " . var_export($id, true));
            return false;
        }
        
        // 确保ID是整数
        $id = intval($id);
        
        $sql = "SELECT * FROM $this->table WHERE id = :id";
        return $this->db->fetch($sql, ['id' => $id]);
    }
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM $this->table WHERE email = :email";
        return $this->db->fetch($sql, ['email' => $email]);
    }
    
    public function findByUsername($username) {
        $sql = "SELECT * FROM $this->table WHERE username = :username";
        return $this->db->fetch($sql, ['username' => $username]);
    }
    
    public function create($data) {
        // Hash the password before storing
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        // Set default values
        $data['role'] = $data['role'] ?? 'user';
        $data['isAdmin'] = $data['isAdmin'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';
        $data['canOrder'] = $data['canOrder'] ?? 1;
        $data['createdAt'] = date('Y-m-d H:i:s');
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        return $this->db->insert($this->table, $data);
    }
    
    public function update($id, $data) {
        // Hash the password if it's being updated
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        $data['updatedAt'] = date('Y-m-d H:i:s');
        
        return $this->db->update(
            $this->table, 
            $data, 
            'id = :id', 
            ['id' => $id]
        );
    }
    
    public function updateLoginTime($id) {
        $data = [
            'lastLogin' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ];
        
        return $this->db->update(
            $this->table, 
            $data, 
            'id = :id', 
            ['id' => $id]
        );
    }
    
    public function getAll($filters = [], $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        $whereConditions = [];
        $params = [];
        
        if (isset($filters['status']) && !empty($filters['status'])) {
            $whereConditions[] = 'status = :status';
            $params['status'] = $filters['status'];
        }
        
        if (isset($filters['role']) && !empty($filters['role'])) {
            $whereConditions[] = 'role = :role';
            $params['role'] = $filters['role'];
        }
        
        $whereClause = !empty($whereConditions) 
            ? 'WHERE ' . implode(' AND ', $whereConditions)
            : '';
        
        // Count total users matching the filters
        $countSql = "SELECT COUNT(*) as total FROM $this->table $whereClause";
        $totalResult = $this->db->fetch($countSql, $params);
        $total = $totalResult['total'] ?? 0;
        
        // Get users with pagination
        $sql = "SELECT * FROM $this->table $whereClause ORDER BY createdAt DESC LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $users = $this->db->fetchAll($sql, $params);
        
        return [
            'users' => $users,
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit)
        ];
    }
    
    public function delete($id) {
        return $this->db->delete(
            $this->table, 
            'id = :id', 
            ['id' => $id]
        );
    }
    
    public function verifyPassword($password, $hashedPassword) {
        return password_verify($password, $hashedPassword);
    }
} 