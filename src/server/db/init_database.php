<?php
/**
 * Database Initialization Script
 * 
 * This script creates the database structure and populates it with initial data
 * based on the database_content.md file.
 */

// Load environment variables
$envFile = __DIR__ . '/../../../.env';
if (!file_exists($envFile)) {
    // Try to use example config if .env doesn't exist
    $envFile = __DIR__ . '/.env.example';
    if (file_exists($envFile)) {
        echo "Warning: .env file not found, using .env.example instead.\n";
        echo "Please create your own .env file for production use.\n\n";
    } else {
        die("Error: Neither .env nor .env.example file found. Please create one of these files.\n");
    }
}

$env = parse_ini_file($envFile);

if (!$env) {
    die("Error: Unable to parse $envFile file. Check its format.\n");
}

// Check for required variables
$requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
$missing = [];
foreach ($requiredVars as $var) {
    if (!isset($env[$var]) || trim($env[$var]) === '') {
        $missing[] = $var;
    }
}

if (!empty($missing)) {
    die("Error: The following required variables are missing in $envFile: " . implode(', ', $missing) . "\n");
}

// Database connection settings
$host = $env['DB_HOST'];
$user = $env['DB_USER'];
$password = $env['DB_PASSWORD'];
$dbname = $env['DB_NAME'];
$socket = $env['DB_SOCKET'] ?? null;
$port = $env['DB_PORT'] ?? 3306;

// Connect to database
// Try different connection methods
try {
    // First try with socket if provided
    if ($socket && file_exists($socket)) {
        $dsn = "mysql:unix_socket=$socket;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        echo "Connected using socket: $socket\n";
    } else {
        // Fall back to TCP/IP
        $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        echo "Connected using TCP/IP: $host:$port\n";
    }
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created or already exists: $dbname\n";
    
    // Select the database
    $pdo->exec("USE `$dbname`");
    
    // Create tables
    createTables($pdo);
    
    // Insert data
    insertData($pdo);
    
    echo "Database initialization completed successfully!\n";
    
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage() . "\n");
}

/**
 * Create database tables
 */
function createTables($pdo) {
    echo "Creating tables...\n";
    
    // Drop existing tables if they exist (in reverse order of dependencies)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    $tables = [
        'OrderItem', 'Review', 'Order', 'Product', 'Designer', 
        'Category', 'User', 'Settings', '_prisma_migrations'
    ];
    
    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS `$table`");
        echo "Dropped table $table if it existed\n";
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // User Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `User` (
        `id` int NOT NULL AUTO_INCREMENT,
        `email` varchar(191) NOT NULL,
        `username` varchar(191) DEFAULT NULL,
        `password` varchar(191) NOT NULL,
        `firstName` varchar(191) DEFAULT NULL,
        `lastName` varchar(191) DEFAULT NULL,
        `phone` varchar(191) DEFAULT NULL,
        `address` varchar(191) DEFAULT NULL,
        `birthday` datetime(3) DEFAULT NULL,
        `gender` varchar(191) DEFAULT NULL,
        `avatar` varchar(191) DEFAULT NULL,
        `role` varchar(191) NOT NULL DEFAULT 'user',
        `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
        `status` varchar(191) NOT NULL DEFAULT 'active',
        `bio` text,
        `canOrder` tinyint(1) NOT NULL DEFAULT '1',
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        `lastLogin` datetime(3) DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `User_email_key` (`email`),
        UNIQUE KEY `User_username_key` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: User\n";
    
    // Category Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Category` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(191) NOT NULL,
        `slug` varchar(191) NOT NULL,
        `description` text,
        `image` varchar(191) DEFAULT NULL,
        `featured` tinyint(1) NOT NULL DEFAULT '0',
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `Category_slug_key` (`slug`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Category\n";
    
    // Designer Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Designer` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(191) NOT NULL,
        `slug` varchar(191) NOT NULL,
        `bio` text,
        `image` varchar(191) DEFAULT NULL,
        `featured` tinyint(1) NOT NULL DEFAULT '0',
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `Designer_slug_key` (`slug`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Designer\n";
    
    // Product Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Product` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(191) NOT NULL,
        `slug` varchar(191) NOT NULL,
        `sku` varchar(191) NOT NULL,
        `price` double NOT NULL,
        `stock` int NOT NULL DEFAULT '0',
        `description` text,
        `image` varchar(191) DEFAULT NULL,
        `gallery` json DEFAULT NULL,
        `featured` tinyint(1) NOT NULL DEFAULT '0',
        `active` tinyint(1) NOT NULL DEFAULT '1',
        `categoryId` int DEFAULT NULL,
        `designerId` int DEFAULT NULL,
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `Product_slug_key` (`slug`),
        UNIQUE KEY `Product_sku_key` (`sku`),
        KEY `Product_categoryId_fkey` (`categoryId`),
        KEY `Product_designerId_fkey` (`designerId`),
        CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL,
        CONSTRAINT `Product_designerId_fkey` FOREIGN KEY (`designerId`) REFERENCES `Designer` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Product\n";
    
    // Order Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Order` (
        `id` int NOT NULL AUTO_INCREMENT,
        `userId` int NOT NULL,
        `orderDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `status` varchar(191) NOT NULL DEFAULT 'pending',
        `totalAmount` double NOT NULL,
        `shippingInfo` json DEFAULT NULL,
        `paymentInfo` json DEFAULT NULL,
        `notes` text,
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `Order_userId_fkey` (`userId`),
        CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Order\n";
    
    // OrderItem Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `OrderItem` (
        `id` int NOT NULL AUTO_INCREMENT,
        `orderId` int NOT NULL,
        `productId` int NOT NULL,
        `quantity` int NOT NULL,
        `price` double NOT NULL,
        PRIMARY KEY (`id`),
        KEY `OrderItem_orderId_fkey` (`orderId`),
        KEY `OrderItem_productId_fkey` (`productId`),
        CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE,
        CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: OrderItem\n";
    
    // Review Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Review` (
        `id` int NOT NULL AUTO_INCREMENT,
        `userId` int NOT NULL,
        `productId` int NOT NULL,
        `rating` int NOT NULL,
        `title` varchar(191) DEFAULT NULL,
        `content` text NOT NULL,
        `status` varchar(191) NOT NULL DEFAULT 'pending',
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `Review_userId_fkey` (`userId`),
        KEY `Review_productId_fkey` (`productId`),
        CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
        CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Review\n";
    
    // Settings Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `Settings` (
        `id` int NOT NULL AUTO_INCREMENT,
        `key` varchar(191) NOT NULL,
        `value` text,
        `group` varchar(191) NOT NULL DEFAULT 'general',
        `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` datetime(3) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `Settings_group_key` (`group`, `key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: Settings\n";
    
    // _prisma_migrations Table (just for reference)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
        `id` varchar(36) NOT NULL,
        `checksum` varchar(64) NOT NULL,
        `finished_at` datetime(3) DEFAULT NULL,
        `migration_name` varchar(255) NOT NULL,
        `logs` text,
        `rolled_back_at` datetime(3) DEFAULT NULL,
        `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created table: _prisma_migrations\n";
}

/**
 * Insert initial data
 */
function insertData($pdo) {
    echo "Inserting data...\n";
    
    // Insert User data
    $stmt = $pdo->prepare("INSERT INTO `User` 
        (`id`, `email`, `username`, `password`, `firstName`, `lastName`, `phone`, `address`, 
        `birthday`, `gender`, `avatar`, `role`, `isAdmin`, `status`, `bio`, `canOrder`, 
        `createdAt`, `updatedAt`, `lastLogin`) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $users = [
        [5, 'admin@purelyhandmade.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', null, null, null, null, null, 'admin', 1, 'active', null, 1, '2025-03-22 11:40:56.132', '2025-03-23 09:02:03.147', null],
        [6, 'user@purelyhandmade.com', 'user', '$2b$10$shnIgQWuHXbUcEnqJyJU0ei3Py80SSbVfBn0qkVcF8Ksc7NlmuIwq', 'Normal', 'User', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-22 11:40:56.190', '2025-03-22 11:40:56.190', null],
        [7, 'customer1@example.com', 'customer1', '$2b$10$nvqHmLQXfyHNLM8WFlV.9.Q8oeWKScJNUiQFzMZHag6f6XehlJmZO', '张', '三', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-22 11:40:56.359', '2025-03-22 11:40:56.359', null],
        [8, 'customer2@example.com', 'customer2', '$2b$10$yHzd97VA5i5tdkRkISPETe.ZPTnPTWbDVdqQ7/Axttie1KxhI80xe', '李', '四', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-22 11:40:56.362', '2025-03-22 11:40:56.362', null],
        [9, 'customer3@example.com', 'customer3', '$2b$10$gjuoQ4TlQ9Q0Fph7bsQRHugKIpNafFmxMm6FZQPnAtA2OsIWnOxWK', '王', '五', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-22 11:40:56.363', '2025-03-22 11:40:56.363', null],
        [10, 'test123@example.com', 'testuser123', '$2y$12$w53oIi1kbWdceRwIEkvNfOLTLXVCRHGJRFuYX5eCph4GNdHIGH6B2', 'Test', 'User', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-23 13:28:35.000', '2025-03-23 13:28:40.000', '2025-03-23 13:28:40.000'],
        [11, 'newadmin@example.com', 'newadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', null, null, null, null, null, 'admin', 1, 'active', null, 1, '2025-03-23 06:29:43.271', '2025-03-23 06:29:43.000', null],
        [12, 'admin2@example.com', 'admin2', '$2y$12$jR1DW1WPK6qKacHSQ8LFeua3uFMm/COG/dZjZAcXuQCd/ZPU1Tqaq', 'Admin', 'User', null, null, null, null, null, 'admin', 1, 'active', null, 1, '2025-03-23 13:29:53.000', '2025-03-23 13:30:09.000', '2025-03-23 13:30:09.000'],
        [13, 'test@example.com', 'testuser', '$2y$12$L6VUI7U7kALspAawUQmVX.bS7M2ieFCa1PCPg9nPyDmM3h3Tvv/iK', null, null, null, null, null, null, null, 'admin', 1, 'active', null, 1, '2025-03-23 13:38:24.000', '2025-03-23 17:39:23.000', '2025-03-23 17:39:23.000'],
        [14, 'admin3@example.com', 'adminuser', '$2y$12$K2SmFzcH4d/QIfxqsSiKnuGtHnM1G/01EL6kTepCrGStAhtHWD9ja', null, null, null, null, null, null, null, 'admin', 1, 'active', null, 1, '2025-03-23 13:40:44.000', '2025-03-23 14:06:00.000', '2025-03-23 14:06:00.000'],
        [15, 'new@example.com', 'newuser', '$2y$12$Q4hsNjfYVN5dBKPCNEOf.OwVFsLW0Ht59f4JvxeuEDAZZi54Ezkzu', 'New', 'User', null, null, null, null, null, 'user', 0, 'active', null, 1, '2025-03-23 14:15:31.000', '2025-03-23 14:15:31.000', null],
        [16, 'testadmin@example.com', 'testadmin', '$2y$12$LLqNoGPDU6wFSKberGox2Ow.M7lKAbRP6IDTnmw7m76wdtX.j1S.O', null, null, null, null, null, null, null, 'user', 1, 'active', null, 1, '2025-03-23 14:51:37.000', '2025-03-23 14:52:42.000', '2025-03-23 14:52:42.000']
    ];
    
    foreach ($users as $user) {
        $stmt->execute($user);
    }
    echo "Inserted data: User (" . count($users) . " records)\n";
    
    // Insert Category data
    $stmt = $pdo->prepare("INSERT INTO `Category` 
        (`id`, `name`, `slug`, `description`, `image`, `featured`, `createdAt`, `updatedAt`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $categories = [
        [1,'Ceramics','ceramics','Handcrafted ceramic items','/src/client/img/category/ceramics.jpg','0','2025-03-23 18:23:13.000','2025-03-23 18:23:13.000'],
        [2,'Wood Crafts','wood-crafts','Handmade wooden items and carvings','/src/client/img/category/wood.jpg','0','2025-03-23 18:23:13.000','2025-03-23 18:23:13.000'],
        [3,'Textiles','textiles','Handwoven and textile-based products','/src/client/img/category/textiles.jpg','0','2025-03-23 18:23:13.000','2025-03-23 18:23:13.000'],
        [7, 'Pottery', 'pottery', 'Handmade ceramics and pottery artworks', null, 0, '2025-03-22 11:40:56.365', '2025-03-22 11:40:56.365'],
        [8, 'Woven', 'woven', 'Handwoven products and accessories', null, 0, '2025-03-22 11:40:56.366', '2025-03-22 11:40:56.366'],
        [9, 'Woodwork', 'woodwork', 'Handmade wooden products and furniture', null, 0, '2025-03-22 11:40:56.368', '2025-03-22 11:40:56.368'],
        [10, 'Jewelry', 'jewelry', 'Handcrafted jewelry', null, 0, '2025-03-22 11:40:56.369', '2025-03-22 11:40:56.369'],
        [11, 'Leather', 'leather', 'Handmade leather goods', null, 1, '2025-03-22 11:40:56.370', '2025-03-22 11:40:56.370'],
        [12, 'Textile', 'textile', 'Handcrafted textiles and fabric arts', null, 0, '2025-03-22 11:40:56.370', '2025-03-22 11:40:56.370'],
        [13, 'Glass', 'glass', 'Handcrafted glassware and artworks', null, 1, '2025-03-22 11:40:56.372', '2025-03-22 11:40:56.372'],
        [17, 'Test Category', 'test-category', 'This is a test category', null, 0, '2025-03-23 13:41:28.000', '2025-03-23 13:41:28.000']
    ];    
    
    foreach ($categories as $category) {
        $stmt->execute($category);
    }
    echo "Inserted data: Category (" . count($categories) . " records)\n";
    
    // Insert Designer data
    $stmt = $pdo->prepare("INSERT INTO `Designer` 
        (`id`, `name`, `slug`, `bio`, `image`, `featured`, `createdAt`, `updatedAt`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $designers = [
        [4, 'James Carter', 'james-carter', 'A designer specializing in traditional ceramic art', null, 0, '2025-03-22 11:40:56.373', '2025-03-22 11:40:56.373'],
        [5, 'Michael Smith', 'michael-smith', 'An emerging woodworking artist', null, 0, '2025-03-22 11:40:56.374', '2025-03-22 11:40:56.374'],
        [6, 'David Brown', 'david-brown', 'A craftsman with years of experience in weaving', null, 0, '2025-03-22 11:40:56.375', '2025-03-22 11:40:56.375'],
        [7, 'Emily Johnson', 'emily-johnson', 'An artist focused on modern ceramic design', null, 1, '2025-03-22 11:40:56.376', '2025-03-22 11:40:56.376'],
        [8, 'Sophia Miller', 'sophia-miller', 'A professional jewelry designer specializing in metal craftsmanship', null, 0, '2025-03-22 11:40:56.377', '2025-03-22 11:40:56.377'],
        [9, 'Robert Williams', 'robert-williams', 'A veteran carpenter specializing in functional furniture design', null, 1, '2025-03-22 11:40:56.378', '2025-03-22 11:40:56.378'],
        [10, 'Olivia Davis', 'olivia-davis', 'A young textile designer blending traditional and modern elements', null, 1, '2025-03-22 11:40:56.379', '2025-03-22 11:40:56.379'],
        [11, 'Test Designer', 'test-designer', 'This is a test designer', null, 0, '2025-03-23 13:45:09.000', '2025-03-23 13:45:09.000']
    ];    
    
    foreach ($designers as $designer) {
        $stmt->execute($designer);
    }
    echo "Inserted data: Designer (" . count($designers) . " records)\n";
    
    // Insert Product data
    $stmt = $pdo->prepare("INSERT INTO `Product` 
        (`id`, `name`, `slug`, `sku`, `price`, `stock`, `description`, `image`, `gallery`, 
        `featured`, `active`, `createdAt`, `updatedAt`, `categoryId`, `designerId`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $products = [
        [8, 'Handmade Ceramic Vase', 'handmade-ceramic-vase', 'P001', 299, 14, 'A beautifully handcrafted ceramic vase, fired using traditional techniques. Each piece is unique.', null, null, 1, 1, '2025-03-22 11:40:56.380', '2025-03-22 11:40:56.380', 7, 4],
        [9, 'Handwoven Basket', 'handwoven-basket', 'P002', 199, 20, 'A practical basket handcrafted from natural materials, perfect for storage or decoration.', null, null, 1, 1, '2025-03-22 11:40:56.382', '2025-03-22 11:40:56.382', 8, 6],
        [10, 'Handmade Wooden Serving Plate', 'wooden-serving-plate', 'P003', 249, 10, 'A finely polished wooden serving plate made from high-quality hardwood, featuring natural grain patterns.', null, null, 0, 1, '2025-03-22 11:40:56.383', '2025-03-22 11:40:56.383', 9, 5],
        [11, 'Handcrafted Silver Necklace', 'handcrafted-silver-necklace', 'P004', 399, 8, 'A delicately handcrafted sterling silver necklace with a simple yet elegant design.', null, null, 1, 1, '2025-03-22 11:40:56.384', '2025-03-22 11:40:56.384', 10, 4],
        [12, 'Ceramic Tea Cup Set', 'ceramic-tea-cup-set', 'P005', 349, 12, 'A set of four handcrafted ceramic tea cups, each with unique glaze colors and patterns.', null, null, 0, 1, '2025-03-22 11:40:56.385', '2025-03-22 11:40:56.385', 7, 4],
        [13, 'Handmade Wooden Jewelry Box', 'wooden-jewelry-box', 'P006', 279, 15, 'A beautifully crafted wooden jewelry box with a well-designed interior and exquisite details.', null, null, 1, 1, '2025-03-22 11:40:56.387', '2025-03-22 11:40:56.387', 9, 5],
        [14, 'Handmade Leather Notebook', 'leather-notebook', 'P007', 189, 25, 'A handcrafted genuine leather notebook with a luxurious feel, perfect for capturing inspiration.', null, null, 1, 1, '2025-03-22 11:40:56.388', '2025-03-22 11:40:56.388', 11, 9],
        [15, 'Handcrafted Glass Pendant Lamp', 'glass-pendant-lamp', 'P008', 459, 8, 'A hand-blown glass pendant lamp with exceptional light diffusion, adding an artistic touch to any home.', null, null, 1, 1, '2025-03-22 11:40:56.389', '2025-03-22 11:40:56.389', 13, 7],
        [16, 'Handwoven Wall Hanging', 'woven-wall-hanging', 'P009', 279, 12, 'A fully handwoven wall hanging made from natural materials, featuring a unique design.', null, null, 0, 1, '2025-03-22 11:40:56.390', '2025-03-22 11:40:56.390', 12, 10],
        [17, 'Handcrafted Metal Pendant Necklace', 'metal-pendant-necklace', 'P010', 329, 15, 'A handcrafted metal pendant necklace, designed with simplicity yet full of personality.', null, null, 1, 1, '2025-03-22 11:40:56.391', '2025-03-22 11:40:56.391', 10, 8]
    ];    
    
    foreach ($products as $product) {
        $stmt->execute($product);
    }
    echo "Inserted data: Product (" . count($products) . " records)\n";
    
    // Insert Order data
    $stmt = $pdo->prepare("INSERT INTO `Order` 
        (`id`, `userId`, `orderDate`, `status`, `totalAmount`, `shippingInfo`, `paymentInfo`, 
        `notes`, `createdAt`, `updatedAt`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $orders = [
        [3, 6, '2025-03-04 11:40:56.413', 'delivered', 249, '{"city": "Toronto", "phone": "4161234567", "state": "Ontario", "country": "Canada", "zipCode": "M5V 2T6", "fullName": "John Doe", "streetAddress": "123 Queen St W"}', '{"method": "creditCard", "status": "completed"}', null, '2025-03-22 11:40:56.415', '2025-03-22 11:40:56.415'],
        [4, 7, '2025-03-11 11:40:56.415', 'pending', 1513, '{"city": "Vancouver", "phone": "6049876543", "state": "British Columbia", "country": "Canada", "zipCode": "V6B 1H4", "fullName": "Michael Smith", "streetAddress": "456 Granville St"}', '{"method": "PayPal", "status": "completed"}', null, '2025-03-22 11:40:56.416', '2025-03-22 11:40:56.416'],
        [5, 7, '2025-02-22 11:40:56.417', 'cancelled', 498, '{"city": "Calgary", "phone": "4037654321", "state": "Alberta", "country": "Canada", "zipCode": "T2P 1J9", "fullName": "Sarah Johnson", "streetAddress": "789 5th Ave SW"}', '{"method": "creditCard", "status": "completed"}', null, '2025-03-22 11:40:56.418', '2025-03-22 11:40:56.418'],
        [6, 8, '2025-02-27 11:40:56.418', 'pending', 918, '{"city": "Montreal", "phone": "5146547890", "state": "Quebec", "country": "Canada", "zipCode": "H3B 3Y7", "fullName": "Emily White", "streetAddress": "101 Rue Sainte-Catherine"}', '{"method": "Interac e-Transfer", "status": "completed"}', null, '2025-03-22 11:40:56.419', '2025-03-22 11:40:56.419'],
        [7, 9, '2025-03-17 11:40:56.420', 'delivered', 1286, '{"city": "Ottawa", "phone": "6139876543", "state": "Ontario", "country": "Canada", "zipCode": "K1P 1A4", "fullName": "David Brown", "streetAddress": "250 Bank St"}', '{"method": "creditCard", "status": "completed"}', null, '2025-03-22 11:40:56.420', '2025-03-22 11:40:56.420'],
        [8, 9, '2025-02-24 11:40:56.421', 'processing', 907, '{"city": "Edmonton", "phone": "7804567890", "state": "Alberta", "country": "Canada", "zipCode": "T5J 1Z7", "fullName": "Olivia Davis", "streetAddress": "500 Jasper Ave"}', '{"method": "PayPal", "status": "completed"}', null, '2025-03-22 11:40:56.422', '2025-03-22 11:40:56.422'],
        [12, 14, '2025-03-23 06:47:22.000', 'pending', 299, null, null, null, '2025-03-23 06:47:22.000', '2025-03-23 06:47:22.000'],
        [13, 6, '2025-02-16 09:55:20.000', 'delivered', 459, '{"city": "Toronto", "phone": "4373210987", "state": "Ontario", "country": "Canada", "zipCode": "M4B 1B3", "fullName": "Ethan Wilson", "streetAddress": "678 Bloor St W"}', '{"method": "Interac e-Transfer", "status": "completed"}', 'Test order from 35 days ago', '2025-02-16 09:55:20.000', '2025-02-16 09:55:20.000'],
        [14, 7, '2025-02-16 09:55:20.000', 'cancelled', 568, '{"city": "Halifax", "phone": "9023216547", "state": "Nova Scotia", "country": "Canada", "zipCode": "B3J 2K9", "fullName": "Sophia Martinez", "streetAddress": "234 Barrington St"}', '{"method": "creditCard", "status": "completed"}', 'Test order from 35 days ago', '2025-02-16 09:55:20.000', '2025-02-16 09:55:20.000'],
        [15, 8, '2024-12-23 09:55:20.000', 'delivered', 789, '{"city": "Winnipeg", "phone": "2048765432", "state": "Manitoba", "country": "Canada", "zipCode": "R3C 3H2", "fullName": "William Harris", "streetAddress": "321 Portage Ave"}', '{"method": "creditCard", "status": "completed"}', 'Test order from 90 days ago', '2024-12-23 09:55:20.000', '2024-12-23 09:55:20.000']
    ];
    
    
    foreach ($orders as $order) {
        $stmt->execute($order);
    }
    echo "Inserted data: Order (" . count($orders) . " records)\n";
    
    // Insert OrderItem data
    $stmt = $pdo->prepare("INSERT INTO `OrderItem` 
        (`id`, `orderId`, `productId`, `quantity`, `price`) VALUES (?, ?, ?, ?, ?)");
    
    $orderItems = [
        [5, 3, 10, 1, 249],
        [6, 4, 10, 3, 249],
        [7, 4, 9, 1, 199],
        [8, 4, 14, 3, 189],
        [9, 5, 10, 2, 249],
        [10, 6, 15, 2, 459],
        [11, 7, 17, 3, 329],
        [12, 7, 8, 1, 299],
        [13, 8, 16, 2, 279],
        [14, 8, 12, 1, 349]
    ];
    
    foreach ($orderItems as $item) {
        $stmt->execute($item);
    }
    echo "Inserted data: OrderItem (" . count($orderItems) . " records)\n";
    
    // Insert Review data
    $stmt = $pdo->prepare("INSERT INTO `Review` 
        (`id`, `userId`, `productId`, `rating`, `title`, `content`, `status`, `createdAt`, `updatedAt`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $reviews = [
        [4, 6, 8, 5, 'Great Product', 'Worth every penny, excellent quality and design, very satisfied with this purchase.', 'approved', '2025-03-22 11:40:56.394', '2025-03-22 11:40:56.394'],
        [5, 7, 8, 3, 'Exceeded Expectations', 'Worth every penny, excellent quality and design, very satisfied with this purchase.', 'approved', '2025-03-22 11:40:56.396', '2025-03-22 11:40:56.396'],
        [6, 6, 9, 4, 'Worth Buying', 'The product is even better than expected, very surprising, will continue to support.', 'approved', '2025-03-22 11:40:56.397', '2025-03-22 11:40:56.397'],
        [7, 7, 9, 4, 'Worth Buying', 'Really like this product, exquisite craftsmanship, unique design, highly recommended!', 'pending', '2025-03-22 11:40:56.398', '2025-03-22 11:40:56.398'],
        [8, 6, 10, 4, 'Very Satisfied', 'Excellent quality, fine craftsmanship, completely meets my expectations.', 'pending', '2025-03-22 11:40:56.399', '2025-03-22 11:40:56.399'],
        [9, 7, 10, 4, 'Worth Buying', 'Good material, decent craftsmanship, but has a minor flaw.', 'pending', '2025-03-22 11:40:56.400', '2025-03-22 11:40:56.400'],
        [10, 6, 11, 4, 'Very Satisfied', 'The product is even better than expected, very surprising, will continue to support.', 'pending', '2025-03-22 11:40:56.401', '2025-03-22 11:40:56.401'],
        [11, 7, 11, 4, 'Very Satisfied', 'Really like this product, exquisite craftsmanship, unique design, highly recommended!', 'pending', '2025-03-22 11:40:56.401', '2025-03-22 11:40:56.401'],
        [12, 6, 12, 4, 'Exceeded Expectations', 'Excellent quality, fine craftsmanship, completely meets my expectations.', 'pending', '2025-03-22 11:40:56.402', '2025-03-22 11:40:56.402'],
        [13, 7, 12, 3, 'Exceeded Expectations', 'Really like this product, exquisite craftsmanship, unique design, highly recommended!', 'pending', '2025-03-22 11:40:56.403', '2025-03-22 11:40:56.403']
    ];    
    
    foreach ($reviews as $review) {
        $stmt->execute($review);
    }
    echo "Inserted data: Review (" . count($reviews) . " records)\n";
    
    // Insert Settings data
    $stmt = $pdo->prepare("INSERT INTO `Settings` 
        (`id`, `key`, `value`, `group`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?)");
    
    $settings = [
        [1, 'site_name', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [2, 'contact_email', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [3, 'phone_number', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [4, 'address', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [5, 'facebook_link', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [6, 'twitter_link', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000'],
        [7, 'instagram_link', null, 'general', '2025-03-23 10:13:05.676', '2025-03-23 17:39:23.000']
    ];
    
    foreach ($settings as $setting) {
        $stmt->execute($setting);
    }
    echo "Inserted data: Settings (" . count($settings) . " records)\n";
} 