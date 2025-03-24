<?php
namespace Controllers;

use Models\Cart;
use Models\CartItem;
use Models\Product;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class CartController {
    private $db;
    private $cart;
    private $cartItem;
    private $product;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->cart = new Cart($this->db);
        $this->cartItem = new CartItem($this->db);
        $this->product = new Product($this->db);
        $this->logger = new Logger('cart.log');
    }
    
    /**
     * Get cart items for a user
     * @param int|null $userId User ID
     * @return array Response with cart items
     */
    public function getCart($userId = null) {
        try {
            // Get user ID from request or parameter
            if (!$userId) {
                $userId = $_REQUEST['userId'] ?? null;
            }
            
            if (!$userId) {
                return [
                    'success' => false,
                    'message' => 'User ID is required',
                    'data' => []
                ];
            }
            
            $this->logger->info('Getting cart for user', ['userId' => $userId]);
            
            // Get cart items
            $cartItems = $this->cart->getCartItems($userId);
            
            // Ensure cartItems is an array
            if (!is_array($cartItems)) {
                $this->logger->error('Cart items is not an array', ['cartItems' => $cartItems]);
                $cartItems = [];
            }
            
            // Enhance cart items with product details
            $enhancedCartItems = [];
            foreach ($cartItems as $item) {
                $product = $this->product->findById($item['productId']);
                if ($product) {
                    $enhancedCartItems[] = [
                        'id' => $item['productId'],
                        'name' => $product['name'],
                        'price' => (float)$product['price'],
                        'image' => $product['image'],
                        'quantity' => (int)$item['quantity'],
                        'description' => $product['description'],
                        'categoryId' => $product['categoryId'],
                        'cartItemId' => $item['id'] // Original cart item ID
                    ];
                }
            }
            
            // Debug log to check data structure
            $this->logger->info('Returning cart items', [
                'userId' => $userId,
                'itemCount' => count($enhancedCartItems),
                'dataType' => gettype($enhancedCartItems),
                'isArray' => is_array($enhancedCartItems)
            ]);
            
            // 确保返回的数据具有一致的格式
            return [
                'success' => true,
                'message' => 'Cart items retrieved successfully',
                'data' => $enhancedCartItems  // 确保这是一个数组，即使是空数组
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error getting cart', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get cart: ' . $e->getMessage(),
                'data' => [] // 确保即使在错误情况下也返回一个空数组
            ];
        }
    }
    
    /**
     * Add item to cart
     * @return array Response
     */
    public function addToCart() {
        try {
            // Get request body
            $body = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($body, [
                'userId' => 'required|integer',
                'productId' => 'required|integer',
                'quantity' => 'required|integer|min:1'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors(),
                    'data' => []
                ];
            }
            
            // Check if product exists and is active
            $product = $this->product->findById($body['productId']);
            
            if (!$product) {
                return [
                    'success' => false,
                    'message' => 'Product not found',
                    'data' => []
                ];
            }
            
            if (!$product['active']) {
                return [
                    'success' => false,
                    'message' => 'Product is not available',
                    'data' => []
                ];
            }
            
            // Check if item is already in cart
            $existingItem = $this->cart->getCartItem($body['userId'], $body['productId']);
            
            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem['quantity'] + $body['quantity'];
                $this->cart->updateCartItem($existingItem['id'], ['quantity' => $newQuantity]);
            } else {
                // Add new item
                $this->cart->addToCart([
                    'userId' => $body['userId'],
                    'productId' => $body['productId'],
                    'quantity' => $body['quantity']
                ]);
            }
            
            // Return updated cart
            return $this->getCart($body['userId']);
        } catch (\Exception $e) {
            $this->logger->error('Error adding to cart', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to add to cart: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
    
    /**
     * Remove item from cart
     * @return array Response
     */
    public function removeFromCart() {
        try {
            // Get request body
            $body = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($body, [
                'userId' => 'required|integer',
                'productId' => 'required|integer'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors(),
                    'data' => []
                ];
            }
            
            // Check if item exists in cart
            $cartItem = $this->cart->getCartItem($body['userId'], $body['productId']);
            
            if (!$cartItem) {
                return [
                    'success' => false,
                    'message' => 'Item not found in cart',
                    'data' => []
                ];
            }
            
            // Remove item
            $this->cart->removeFromCart($cartItem['id']);
            
            // Return updated cart
            return $this->getCart($body['userId']);
        } catch (\Exception $e) {
            $this->logger->error('Error removing from cart', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to remove from cart: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
    
    /**
     * Update cart item quantity
     * @return array Response
     */
    public function updateCartItem() {
        try {
            // Get request body
            $body = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($body, [
                'userId' => 'required|integer',
                'productId' => 'required|integer',
                'quantity' => 'required|integer|min:1'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors(),
                    'data' => []
                ];
            }
            
            // Check if item exists in cart
            $cartItem = $this->cart->getCartItem($body['userId'], $body['productId']);
            
            if (!$cartItem) {
                return [
                    'success' => false,
                    'message' => 'Item not found in cart',
                    'data' => []
                ];
            }
            
            // Update quantity
            $this->cart->updateCartItem($cartItem['id'], ['quantity' => $body['quantity']]);
            
            // Return updated cart
            return $this->getCart($body['userId']);
        } catch (\Exception $e) {
            $this->logger->error('Error updating cart item', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update cart item: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
    
    /**
     * Clear cart
     * @return array Response
     */
    public function clearCart() {
        try {
            // Get request body
            $body = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $validator = new Validator($body, [
                'userId' => 'required|integer'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors(),
                    'data' => []
                ];
            }
            
            // Clear cart
            $this->cart->clearCart($body['userId']);
            
            return [
                'success' => true,
                'message' => 'Cart cleared successfully',
                'data' => []
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error clearing cart', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to clear cart: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
} 