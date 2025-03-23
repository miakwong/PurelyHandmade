-- Create database tables for PurelyHandmade

-- User Table
CREATE TABLE IF NOT EXISTS `User` (
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
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
);

-- Category Table
CREATE TABLE IF NOT EXISTS `Category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text,
  `image` varchar(191) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
);

-- Designer Table
CREATE TABLE IF NOT EXISTS `Designer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `bio` text,
  `image` varchar(191) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
);

-- Product Table
CREATE TABLE IF NOT EXISTS `Product` (
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
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` int DEFAULT NULL,
  `designerId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoryId` (`categoryId`),
  KEY `designerId` (`designerId`),
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Product_designerId_fkey` FOREIGN KEY (`designerId`) REFERENCES `Designer` (`id`) ON DELETE SET NULL
);

-- Review Table
CREATE TABLE IF NOT EXISTS `Review` (
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
  KEY `userId` (`userId`),
  KEY `productId` (`productId`),
  CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
);

-- Order Table
CREATE TABLE IF NOT EXISTS `Order` (
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
  KEY `userId` (`userId`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
);

-- OrderItem Table
CREATE TABLE IF NOT EXISTS `OrderItem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT
);

-- Settings Table
CREATE TABLE IF NOT EXISTS `Settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(191) NOT NULL,
  `value` text,
  `group` varchar(191) NOT NULL DEFAULT 'general',
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_key` (`group`, `key`)
);

-- Insert sample data for testing
INSERT INTO `Category` (`name`, `slug`, `description`, `featured`, `updatedAt`) VALUES 
('Home Decor', 'home-decor', 'Beautiful handmade items for your home', 1, NOW()),
('Jewelry', 'jewelry', 'Handcrafted jewelry pieces', 1, NOW()),
('Clothing', 'clothing', 'Handmade clothing and accessories', 0, NOW());

INSERT INTO `Designer` (`name`, `slug`, `bio`, `featured`, `updatedAt`) VALUES 
('Emma Johnson', 'emma-johnson', 'Specializes in handcrafted jewelry', 1, NOW()),
('Michael Chen', 'michael-chen', 'Creates unique home decor items', 1, NOW()),
('Sophia Rodriguez', 'sophia-rodriguez', 'Designs eco-friendly clothing', 0, NOW());

-- Create admin user with password: Admin123!
INSERT INTO `User` (`email`, `username`, `password`, `firstName`, `lastName`, `role`, `isAdmin`, `updatedAt`) VALUES 
('admin@example.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 1, NOW()); 