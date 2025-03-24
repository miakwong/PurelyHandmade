<?php
/**
 * Create Cart tables
 * 
 * This script creates the Cart and CartItem tables for the database
 */

require_once __DIR__ . '/../bootstrap.php';

use Utils\Database;
use Utils\Logger;

$logger = new Logger('create-cart-tables.log');
$db = new Database();

try {
    $db->connect();
    $logger->info('Connected to database');
    
    // Create Cart table
    $sql = "CREATE TABLE IF NOT EXISTS Cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )";
    
    $db->query($sql);
    $logger->info('Cart table created');
    
    // Create CartItem table
    $sql = "CREATE TABLE IF NOT EXISTS CartItem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cartId INT NOT NULL,
        userId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )";
    
    $db->query($sql);
    $logger->info('CartItem table created');
    
    echo "Cart tables created successfully\n";
} catch (Exception $e) {
    $logger->error('Error creating cart tables', Logger::formatException($e));
    echo "Error: " . $e->getMessage() . "\n";
} 