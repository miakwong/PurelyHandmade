<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\OrderController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept POST requests
if (getRequestMethod() !== 'POST') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // Apply Auth middleware
    $authMiddleware = new AuthMiddleware();
    $userData = $authMiddleware->handle();
    
    // Debug output
    error_log("User data from auth middleware: " . json_encode($userData));
    
    $request = new Request();
    $response = new Response();
    
    // Get order data
    $data = $request->all();
    
    // Debug output
    error_log("Request data: " . json_encode($data));
    
    // Set the user ID from authentication
    $data['userId'] = $userData['id'];
    
    // Ensure items array is present
    if (!isset($data['items']) || !is_array($data['items'])) {
        $response->error('Order items array is required');
        exit;
    }
    
    // Prepare shipping info
    if (isset($data['shippingAddress']) && is_string($data['shippingAddress'])) {
        $data['shippingInfo'] = json_encode(['address' => $data['shippingAddress']]);
        unset($data['shippingAddress']);
    }
    
    // Prepare payment info
    if (isset($data['paymentMethod']) && is_string($data['paymentMethod'])) {
        $data['paymentInfo'] = json_encode(['method' => $data['paymentMethod']]);
        unset($data['paymentMethod']);
    }
    
    // Debug output after transformations
    error_log("Transformed order data: " . json_encode($data));
    
    $orderController = new OrderController();
    
    // Create order with simplified process for testing
    $db = new Utils\Database();
    $db->connect();
    
    // Start transaction
    $db->query('START TRANSACTION');
    
    try {
        // Calculate order total
        $total = 0;
        foreach ($data['items'] as $item) {
            // Get product info
            $productSql = "SELECT price FROM Product WHERE id = :id";
            $product = $db->fetch($productSql, ['id' => $item['productId']]);
            
            if (!$product) {
                throw new Exception("Product not found: " . $item['productId']);
            }
            
            $total += $product['price'] * $item['quantity'];
        }
        
        // Create base order
        $orderSql = "INSERT INTO `Order` (userId, orderDate, status, totalAmount, updatedAt, createdAt) 
                    VALUES (:userId, NOW(), 'pending', :total, NOW(), NOW())";
        
        $db->query($orderSql, [
            'userId' => $data['userId'],
            'total' => $total
        ]);
        $orderId = $db->lastInsertId();
        
        // Create order items
        foreach ($data['items'] as $item) {
            $itemSql = "INSERT INTO OrderItem (orderId, productId, quantity, price) 
                       SELECT :orderId, :productId, :quantity, price FROM Product WHERE id = :productId2";
            
            $db->query($itemSql, [
                'orderId' => $orderId,
                'productId' => $item['productId'],
                'quantity' => $item['quantity'],
                'productId2' => $item['productId']
            ]);
            
            // Update product stock
            $stockSql = "UPDATE Product SET stock = stock - :quantity WHERE id = :id";
            $db->query($stockSql, [
                'quantity' => $item['quantity'],
                'id' => $item['productId']
            ]);
        }
        
        // Commit transaction
        $db->query('COMMIT');
        
        // Get created order
        $orderSql = "SELECT * FROM `Order` WHERE id = :id";
        $order = $db->fetch($orderSql, ['id' => $orderId]);
        
        // Get order items
        $itemsSql = "SELECT oi.*, p.name FROM OrderItem oi 
                    JOIN Product p ON oi.productId = p.id 
                    WHERE oi.orderId = :orderId";
        $items = $db->fetchAll($itemsSql, ['orderId' => $orderId]);
        
        $order['items'] = $items;
        
        $response->success($order, 'Order created successfully', 201);
    } catch (Exception $e) {
        $db->query('ROLLBACK');
        throw $e;
    }
} catch (Exception $e) {
    error_log("Order creation error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    
    $response = new Response();
    $response->error('Failed to create order: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Order creation error', Utils\Logger::formatException($e));
} 