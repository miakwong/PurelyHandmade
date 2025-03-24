<?php
namespace Models;

use Utils\Database;
use Utils\Logger;

class CartItem {
    private $db;
    private $logger;
    private $table = 'CartItem';
    
    public function __construct(Database $db) {
        $this->db = $db;
        $this->logger = new Logger('cart-item-model.log');
    }
    
    /**
     * Find cart item by ID
     * @param int $id Cart item ID
     * @return array|null Cart item or null
     */
    public function findById($id) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = :id";
            $params = ['id' => $id];
            
            $this->logger->info('Finding cart item by ID', [
                'id' => $id,
                'sql' => $sql
            ]);
            
            $result = $this->db->query($sql, $params);
            return $result->fetch(\PDO::FETCH_ASSOC) ?: null;
        } catch (\Exception $e) {
            $this->logger->error('Error finding cart item by ID', Logger::formatException($e));
            return null;
        }
    }
    
    /**
     * Create a new cart item
     * @param array $data Cart item data
     * @return int|false ID of the new cart item or false on failure
     */
    public function create($data) {
        try {
            $keys = array_keys($data);
            $columns = implode(', ', $keys);
            $placeholders = implode(', ', array_map(function($key) {
                return ":{$key}";
            }, $keys));
            
            $sql = "INSERT INTO {$this->table} ({$columns}, createdAt, updatedAt)
                    VALUES ({$placeholders}, NOW(), NOW())";
            
            $this->logger->info('Creating cart item', [
                'data' => $data,
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $data);
            return $this->db->lastInsertId();
        } catch (\Exception $e) {
            $this->logger->error('Error creating cart item', Logger::formatException($e));
            return false;
        }
    }
    
    /**
     * Update a cart item
     * @param int $id Cart item ID
     * @param array $data Data to update
     * @return bool Success
     */
    public function update($id, $data) {
        try {
            $setClause = [];
            $params = ['id' => $id];
            
            foreach ($data as $key => $value) {
                $setClause[] = "{$key} = :{$key}";
                $params[$key] = $value;
            }
            
            $setClause[] = "updatedAt = NOW()";
            
            $sql = "UPDATE {$this->table} SET " . implode(', ', $setClause) . " WHERE id = :id";
            
            $this->logger->info('Updating cart item', [
                'id' => $id,
                'data' => $data,
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $params);
            return true;
        } catch (\Exception $e) {
            $this->logger->error('Error updating cart item', Logger::formatException($e));
            return false;
        }
    }
    
    /**
     * Delete a cart item
     * @param int $id Cart item ID
     * @return bool Success
     */
    public function delete($id) {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $params = ['id' => $id];
            
            $this->logger->info('Deleting cart item', [
                'id' => $id,
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $params);
            return true;
        } catch (\Exception $e) {
            $this->logger->error('Error deleting cart item', Logger::formatException($e));
            return false;
        }
    }
} 