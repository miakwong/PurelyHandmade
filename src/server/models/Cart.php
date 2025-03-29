<?php
namespace Models;

use Utils\Database;
use Utils\Logger;

class Cart {
    private $db;
    private $logger;
    public $table = 'Cart';
    private $itemsTable = 'CartItem';
    
    public function __construct(Database $db) {
        $this->db = $db;
        $this->logger = new Logger('cart-model.log');
    }
    
    /**
     * Get cart items for a user
     * @param int $userId User ID
     * @return array Cart items
     */
    public function getCartItems($userId) {
        try {
            $sql = "SELECT * FROM {$this->itemsTable} WHERE userId = :userId";
            $params = ['userId' => $userId];
            
            $this->logger->info('Getting cart items for user', [
                'userId' => $userId,
                'sql' => $sql
            ]);
            
            $result = $this->db->query($sql, $params);
            $items = $result->fetchAll(\PDO::FETCH_ASSOC);
            
            // Make sure we're returning a proper PHP array
            if ($items === false) {
                return [];
            }
            
            $this->logger->info('Cart items retrieved', [
                'count' => count($items),
                'type' => gettype($items),
                'isArray' => is_array($items)
            ]);
            
            return $items; // This should be an array or empty array
        } catch (\Exception $e) {
            $this->logger->error('Error getting cart items', Logger::formatException($e));
            return [];
        }
    }
    
    /**
     * Get specific cart item
     * @param int $userId User ID
     * @param int $productId Product ID
     * @return array|null Cart item or null
     */
    public function getCartItem($userId, $productId) {
        try {
            $sql = "SELECT * FROM {$this->itemsTable} WHERE userId = :userId AND productId = :productId";
            $params = [
                'userId' => $userId,
                'productId' => $productId
            ];
            
            $this->logger->info('Getting cart item', [
                'userId' => $userId,
                'productId' => $productId,
                'sql' => $sql
            ]);
            
            $result = $this->db->query($sql, $params);
            return $result->fetch(\PDO::FETCH_ASSOC) ?: null;
        } catch (\Exception $e) {
            $this->logger->error('Error getting cart item', Logger::formatException($e));
            return null;
        }
    }
    
    /**
     * Add item to cart
     * @param array $data Cart item data
     * @return int|false ID of the new cart item or false on failure
     */
    public function addToCart($data) {
        try {
            // Check if cart exists for user
            $cart = $this->getOrCreateCart($data['userId']);
            
            if (!$cart) {
                return false;
            }
            
            // Add to cart items
            $sql = "INSERT INTO {$this->itemsTable} (cartId, userId, productId, quantity, createdAt, updatedAt)
                    VALUES (:cartId, :userId, :productId, :quantity, NOW(), NOW())";
            
            $params = [
                'cartId' => $cart['id'],
                'userId' => $data['userId'],
                'productId' => $data['productId'],
                'quantity' => $data['quantity']
            ];
            
            $this->logger->info('Adding item to cart', [
                'userId' => $data['userId'],
                'productId' => $data['productId'],
                'quantity' => $data['quantity'],
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $params);
            return $this->db->lastInsertId();
        } catch (\Exception $e) {
            $this->logger->error('Error adding item to cart', Logger::formatException($e));
            return false;
        }
    }
    
    /**
     * Update cart item
     * @param int $itemId Cart item ID
     * @param array $data Data to update
     * @return bool Success
     */
    public function updateCartItem($itemId, $data) {
        try {
            $setClause = [];
            $params = ['id' => $itemId];
            
            foreach ($data as $key => $value) {
                $setClause[] = "{$key} = :{$key}";
                $params[$key] = $value;
            }
            
            $setClause[] = "updatedAt = NOW()";
            
            $sql = "UPDATE {$this->itemsTable} SET " . implode(', ', $setClause) . " WHERE id = :id";
            
            $this->logger->info('Updating cart item', [
                'itemId' => $itemId,
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
     * Remove item from cart
     * @param int $itemId Cart item ID
     * @return bool Success
     */
    public function removeFromCart($itemId) {
        try {
            $sql = "DELETE FROM {$this->itemsTable} WHERE id = :id";
            $params = ['id' => $itemId];
            
            $this->logger->info('Removing item from cart', [
                'itemId' => $itemId,
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $params);
            return true;
        } catch (\Exception $e) {
            $this->logger->error('Error removing item from cart', Logger::formatException($e));
            return false;
        }
    }
    
    /**
     * Clear cart for a user
     * @param int $userId User ID
     * @return bool Success
     */
    public function clearCart($userId) {
        try {
            $sql = "DELETE FROM {$this->itemsTable} WHERE userId = :userId";
            $params = ['userId' => $userId];
            
            $this->logger->info('Clearing cart', [
                'userId' => $userId,
                'sql' => $sql
            ]);
            
            $this->db->query($sql, $params);
            return true;
        } catch (\Exception $e) {
            $this->logger->error('Error clearing cart', Logger::formatException($e));
            return false;
        }
    }
    
    /**
     * Get or create a cart for user
     * @param int $userId User ID
     * @return array|false Cart data or false
     */
    private function getOrCreateCart($userId) {
        try {
            // Check if cart exists
            $sql = "SELECT * FROM {$this->table} WHERE userId = :userId";
            $params = ['userId' => $userId];
            
            $result = $this->db->query($sql, $params);
            $cart = $result->fetch(\PDO::FETCH_ASSOC);
            
            if ($cart) {
                return $cart;
            }
            
            // Create new cart
            $sql = "INSERT INTO {$this->table} (userId, createdAt, updatedAt)
                    VALUES (:userId, NOW(), NOW())";
            
            $this->db->query($sql, $params);
            $cartId = $this->db->lastInsertId();
            
            return [
                'id' => $cartId,
                'userId' => $userId
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error getting or creating cart', Logger::formatException($e));
            return false;
        }
    }
} 