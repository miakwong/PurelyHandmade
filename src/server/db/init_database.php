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
        [7, '陶瓷', 'pottery', '手工陶瓷和陶艺作品', null, 0, '2025-03-22 11:40:56.365', '2025-03-22 11:40:56.365'],
        [8, '编织', 'woven', '手工编织的产品和饰品', null, 0, '2025-03-22 11:40:56.366', '2025-03-22 11:40:56.366'],
        [9, '木工', 'woodwork', '手工木制品和家具', null, 0, '2025-03-22 11:40:56.368', '2025-03-22 11:40:56.368'],
        [10, '首饰', 'jewelry', '手工制作的首饰', null, 0, '2025-03-22 11:40:56.369', '2025-03-22 11:40:56.369'],
        [11, '皮革', 'leather', '手工皮革制品', null, 1, '2025-03-22 11:40:56.370', '2025-03-22 11:40:56.370'],
        [12, '纺织', 'textile', '手工纺织品和布艺作品', null, 0, '2025-03-22 11:40:56.370', '2025-03-22 11:40:56.370'],
        [13, '玻璃', 'glass', '手工玻璃制品和工艺品', null, 1, '2025-03-22 11:40:56.372', '2025-03-22 11:40:56.372'],
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
        [4, '张艺', 'zhang-yi', '专注于传统陶瓷艺术的设计师', null, 0, '2025-03-22 11:40:56.373', '2025-03-22 11:40:56.373'],
        [5, '李明', 'li-ming', '新锐木工艺术家', null, 0, '2025-03-22 11:40:56.374', '2025-03-22 11:40:56.374'],
        [6, '王华', 'wang-hua', '多年编织工艺经验的工匠', null, 0, '2025-03-22 11:40:56.375', '2025-03-22 11:40:56.375'],
        [7, '赵静', 'zhao-jing', '专注于现代陶瓷设计的艺术家', null, 1, '2025-03-22 11:40:56.376', '2025-03-22 11:40:56.376'],
        [8, '刘芳', 'liu-fang', '专业珠宝设计师，擅长金属工艺', null, 0, '2025-03-22 11:40:56.377', '2025-03-22 11:40:56.377'],
        [9, '陈勇', 'chen-yong', '资深木匠，专注实用家具设计', null, 1, '2025-03-22 11:40:56.378', '2025-03-22 11:40:56.378'],
        [10, '林小雨', 'lin-xiaoyu', '年轻的织物设计师，结合传统与现代元素', null, 1, '2025-03-22 11:40:56.379', '2025-03-22 11:40:56.379'],
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
        [8, '手工陶瓷花瓶', 'handmade-ceramic-vase', 'P001', 299, 14, '精美手工陶瓷花瓶，采用传统工艺烧制而成，每件都独一无二。', null, null, 1, 1, '2025-03-22 11:40:56.380', '2025-03-22 11:40:56.380', 7, 4],
        [9, '手工编织篮子', 'handwoven-basket', 'P002', 199, 20, '由天然材料手工编织而成的实用篮子，可用于储物或装饰。', null, null, 1, 1, '2025-03-22 11:40:56.382', '2025-03-22 11:40:56.382', 8, 6],
        [10, '手工木制餐盘', 'wooden-serving-plate', 'P003', 249, 10, '精心打磨的木制餐盘，采用优质硬木制作，自然纹理美观。', null, null, 0, 1, '2025-03-22 11:40:56.383', '2025-03-22 11:40:56.383', 9, 5],
        [11, '手工银饰项链', 'handcrafted-silver-necklace', 'P004', 399, 8, '精致手工制作的纯银项链，设计简约而优雅。', null, null, 1, 1, '2025-03-22 11:40:56.384', '2025-03-22 11:40:56.384', 10, 4],
        [12, '手工陶瓷茶杯套装', 'ceramic-tea-cup-set', 'P005', 349, 12, '四件套手工陶瓷茶杯，每个都有独特的釉色和纹理。', null, null, 0, 1, '2025-03-22 11:40:56.385', '2025-03-22 11:40:56.385', 7, 4],
        [13, '手工木制首饰盒', 'wooden-jewelry-box', 'P006', 279, 15, '精美木制首饰盒，内部设计合理，细节处理精致。', null, null, 1, 1, '2025-03-22 11:40:56.387', '2025-03-22 11:40:56.387', 9, 5],
        [14, '手工皮革笔记本', 'leather-notebook', 'P007', 189, 25, '手工制作的真皮笔记本，质感极佳，随时记录灵感。', null, null, 1, 1, '2025-03-22 11:40:56.388', '2025-03-22 11:40:56.388', 11, 9],
        [15, '手工玻璃吊灯', 'glass-pendant-lamp', 'P008', 459, 8, '手工吹制玻璃吊灯，透光效果绝佳，为家居增添艺术氛围。', null, null, 1, 1, '2025-03-22 11:40:56.389', '2025-03-22 11:40:56.389', 13, 7],
        [16, '手工编织挂毯', 'woven-wall-hanging', 'P009', 279, 12, '纯手工编织的墙面装饰挂毯，采用天然材料，设计独特。', null, null, 0, 1, '2025-03-22 11:40:56.390', '2025-03-22 11:40:56.390', 12, 10],
        [17, '手工金属项链', 'metal-pendant-necklace', 'P010', 329, 15, '手工锻造的金属吊坠项链，设计简约而不失个性。', null, null, 1, 1, '2025-03-22 11:40:56.391', '2025-03-22 11:40:56.391', 10, 8]
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
        [3, 6, '2025-03-04 11:40:56.413', 'delivered', 249, '{"city": "北京", "phone": "1901454608", "state": "北京", "country": "中国", "zipCode": "518000", "fullName": "Normal User", "streetAddress": "测试地址街道"}', '{"method": "wechat", "status": "completed"}', null, '2025-03-22 11:40:56.415', '2025-03-22 11:40:56.415'],
        [4, 7, '2025-03-11 11:40:56.415', 'pending', 1513, '{"city": "深圳", "phone": "1904349752", "state": "广东", "country": "中国", "zipCode": "510000", "fullName": "张 三", "streetAddress": "测试地址街道"}', '{"method": "wechat", "status": "completed"}', null, '2025-03-22 11:40:56.416', '2025-03-22 11:40:56.416'],
        [5, 7, '2025-02-22 11:40:56.417', 'cancelled', 498, '{"city": "深圳", "phone": "1509382410", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "张 三", "streetAddress": "测试地址街道"}', '{"method": "creditCard", "status": "completed"}', null, '2025-03-22 11:40:56.418', '2025-03-22 11:40:56.418'],
        [6, 8, '2025-02-27 11:40:56.418', 'pending', 918, '{"city": "深圳", "phone": "1203795809", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "李 四", "streetAddress": "测试地址街道"}', '{"method": "alipay", "status": "completed"}', null, '2025-03-22 11:40:56.419', '2025-03-22 11:40:56.419'],
        [7, 9, '2025-03-17 11:40:56.420', 'delivered', 1286, '{"city": "深圳", "phone": "1500773508", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "王 五", "streetAddress": "测试地址街道"}', '{"method": "creditCard", "status": "completed"}', null, '2025-03-22 11:40:56.420', '2025-03-22 11:40:56.420'],
        [8, 9, '2025-02-24 11:40:56.421', 'processing', 907, '{"city": "广州", "phone": "1205532741", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "王 五", "streetAddress": "测试地址街道"}', '{"method": "wechat", "status": "completed"}', null, '2025-03-22 11:40:56.422', '2025-03-22 11:40:56.422'],
        [12, 14, '2025-03-23 06:47:22.000', 'pending', 299, null, null, null, '2025-03-23 06:47:22.000', '2025-03-23 06:47:22.000'],
        [13, 6, '2025-02-16 09:55:20.000', 'delivered', 459, '{"city": "北京", "phone": "13912345678", "state": "北京", "country": "中国", "zipCode": "100000", "fullName": "测试用户", "streetAddress": "测试地址35-1"}', '{"method": "alipay", "status": "completed"}', '35天前的测试订单1', '2025-02-16 09:55:20.000', '2025-02-16 09:55:20.000'],
        [14, 7, '2025-02-16 09:55:20.000', 'cancelled', 568, '{"city": "上海", "phone": "13887654321", "state": "上海", "country": "中国", "zipCode": "200000", "fullName": "测试用户2", "streetAddress": "测试地址35-2"}', '{"method": "wechat", "status": "completed"}', '35天前的测试订单2', '2025-02-16 09:55:20.000', '2025-02-16 09:55:20.000'],
        [15, 8, '2024-12-23 09:55:20.000', 'delivered', 789, '{"city": "广州", "phone": "13765432109", "state": "广东", "country": "中国", "zipCode": "510000", "fullName": "测试用户3", "streetAddress": "测试地址90-1"}', '{"method": "creditCard", "status": "completed"}', '90天前的测试订单1', '2024-12-23 09:55:20.000', '2024-12-23 09:55:20.000']
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
        [4, 6, 8, 5, '很好的产品', '物超所值，质量和设计都很棒，很满意这次购买。', 'approved', '2025-03-22 11:40:56.394', '2025-03-22 11:40:56.394'],
        [5, 7, 8, 3, '超出预期', '物超所值，质量和设计都很棒，很满意这次购买。', 'approved', '2025-03-22 11:40:56.396', '2025-03-22 11:40:56.396'],
        [6, 6, 9, 4, '值得购买', '收到货比想象中的还要好，很惊喜，会继续支持。', 'approved', '2025-03-22 11:40:56.397', '2025-03-22 11:40:56.397'],
        [7, 7, 9, 4, '值得购买', '非常喜欢这个产品，做工精美，设计独特，值得推荐！', 'pending', '2025-03-22 11:40:56.398', '2025-03-22 11:40:56.398'],
        [8, 6, 10, 4, '非常满意', '质量非常好，做工精细，完全符合我的期望。', 'pending', '2025-03-22 11:40:56.399', '2025-03-22 11:40:56.399'],
        [9, 7, 10, 4, '值得购买', '材质很好，做工也不错，但是有一点小瑕疵。', 'pending', '2025-03-22 11:40:56.400', '2025-03-22 11:40:56.400'],
        [10, 6, 11, 4, '非常满意', '收到货比想象中的还要好，很惊喜，会继续支持。', 'pending', '2025-03-22 11:40:56.401', '2025-03-22 11:40:56.401'],
        [11, 7, 11, 4, '非常满意', '非常喜欢这个产品，做工精美，设计独特，值得推荐！', 'pending', '2025-03-22 11:40:56.401', '2025-03-22 11:40:56.401'],
        [12, 6, 12, 4, '超出预期', '质量非常好，做工精细，完全符合我的期望。', 'pending', '2025-03-22 11:40:56.402', '2025-03-22 11:40:56.402'],
        [13, 7, 12, 3, '超出预期', '非常喜欢这个产品，做工精美，设计独特，值得推荐！', 'pending', '2025-03-22 11:40:56.403', '2025-03-22 11:40:56.403']
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