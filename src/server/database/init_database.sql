-- 创建数据库（如果尚不存在）
CREATE DATABASE IF NOT EXISTS purely_handmade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE purely_handmade;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthday DATE,
    gender ENUM('male', 'female', 'other'),
    avatar TEXT,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 类别表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 设计师表
CREATE TABLE IF NOT EXISTS designers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    bio TEXT,
    image VARCHAR(255),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    social JSON,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    designer_id VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    on_sale BOOLEAN NOT NULL DEFAULT FALSE,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    details TEXT,
    images JSON,
    listing_date DATE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (designer_id) REFERENCES designers(id) ON DELETE SET NULL
);

-- 评论表
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date DATETIME NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 插入默认管理员账户
INSERT INTO users (username, password_hash, email, first_name, last_name, role, created_at, updated_at)
VALUES ('admin', '$2y$10$LVJJVnhDhkzH1Pd3kroHveqd/K7/a6UH9f5WIoHcvN2Q.F9UGqmhG', 'admin@purelyhandmade.com', 'Admin', 'User', 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 插入示例类别数据
INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES
('Jewelry', 'jewelry', 'Handcrafted jewelry pieces including necklaces, bracelets, and earrings', NOW(), NOW()),
('Ceramics', 'ceramics', 'Hand-thrown pottery and ceramic pieces for home and decoration', NOW(), NOW()),
('Textiles', 'textiles', 'Handwoven textiles, blankets, and fabric art', NOW(), NOW()),
('Woodworking', 'woodworking', 'Hand-carved wooden items, furniture, and decorative pieces', NOW(), NOW()),
('Paper Crafts', 'paper-crafts', 'Handmade paper items, cards, and book binding', NOW(), NOW()),
('Glass Art', 'glass-art', 'Hand-blown glass art and functional glass pieces', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), updated_at = NOW();

-- 插入示例设计师数据
INSERT INTO designers (id, name, specialty, bio, featured, social, created_at, updated_at) VALUES
('sarah-johnson', 'Sarah Johnson', 'Jewelry Design', 'Sarah creates elegant jewelry inspired by nature, using ethically sourced materials.', TRUE, '{"instagram": "sarahjewelry", "website": "sarahjohnsonjewelry.com"}', NOW(), NOW()),
('michael-chen', 'Michael Chen', 'Ceramics', 'Michael specializes in minimalist ceramic pieces that blend function and artistry.', TRUE, '{"instagram": "chenceramics", "etsy": "ChenCeramics"}', NOW(), NOW()),
('elena-rodriguez', 'Elena Rodriguez', 'Textile Art', 'Elena weaves beautiful textiles using traditional techniques from her heritage.', FALSE, '{"instagram": "elenaweaves", "pinterest": "elenaweaves"}', NOW(), NOW()),
('david-wood', 'David Wood', 'Woodworking', 'David crafts wooden furniture and home goods with a focus on sustainability.', TRUE, '{"website": "davidwoodworks.com", "etsy": "DavidWoodWorks"}', NOW(), NOW()),
('ami-tanaka', 'Ami Tanaka', 'Paper Art', 'Ami creates intricate paper art and handbound books using traditional Japanese techniques.', FALSE, '{"instagram": "amipaperart", "twitter": "amipaperarts"}', NOW(), NOW()),
('james-glassworks', 'James Miller', 'Glass Blowing', 'James crafts vibrant glass pieces inspired by ocean landscapes and marine life.', TRUE, '{"instagram": "jamesmillerglass", "facebook": "JamesMillerGlass"}', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), specialty = VALUES(specialty), bio = VALUES(bio), 
                        featured = VALUES(featured), social = VALUES(social), updated_at = NOW();

-- 插入示例产品数据
INSERT INTO products (id, name, category_id, designer_id, price, sale_price, on_sale, stock, description, details, images, listing_date, created_at, updated_at) VALUES
('silver-leaf-necklace', 'Silver Leaf Pendant Necklace', 1, 'sarah-johnson', 89.99, 69.99, TRUE, 15, 
 'Elegant silver pendant necklace inspired by natural leaf forms.', 
 'Handcrafted from 925 sterling silver with an 18-inch chain. Each piece is unique with slight variations in the leaf texture.', 
 '["img/products/necklace1.jpg", "img/products/necklace2.jpg"]', 
 CURDATE(), NOW(), NOW()),

('blue-ceramic-mug-set', 'Blue Ceramic Mug Set (4)', 2, 'michael-chen', 120.00, NULL, FALSE, 8, 
 'Set of four hand-thrown ceramic mugs in a beautiful ocean blue glaze.', 
 'Each mug holds approximately 12oz and features a comfortable handle. Microwave and dishwasher safe. Small variations in glaze and form make each mug unique.', 
 '["img/products/blue-mugs1.jpg", "img/products/blue-mugs2.jpg"]', 
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), NOW(), NOW()),

('handwoven-wool-blanket', 'Handwoven Merino Wool Blanket', 3, 'elena-rodriguez', 249.99, 199.99, TRUE, 5, 
 'Luxurious handwoven blanket made from 100% merino wool in natural earthy tones.', 
 'Measures 60x80 inches. Woven on a traditional loom using techniques passed down through generations. Incredibly soft and warm, perfect for cool evenings.', 
 '["img/products/blanket1.jpg", "img/products/blanket2.jpg"]', 
 DATE_SUB(CURDATE(), INTERVAL 12 DAY), NOW(), NOW()),

('walnut-serving-board', 'Walnut Wood Serving Board', 4, 'david-wood', 85.00, NULL, FALSE, 12, 
 'Beautiful walnut serving board, perfect for charcuterie or as a display piece.', 
 'Measures approximately 18x10 inches with a live edge. Each board is made from sustainably harvested walnut and finished with food-safe oils.', 
 '["img/products/wood-board1.jpg", "img/products/wood-board2.jpg"]', 
 DATE_SUB(CURDATE(), INTERVAL 3 DAY), NOW(), NOW()),

('handbound-leather-journal', 'Handbound Leather Journal', 5, 'ami-tanaka', 65.00, NULL, FALSE, 20, 
 'Exquisite handbound journal with genuine leather cover and handmade paper.', 
 '200 pages of acid-free handmade paper. The cover is made from full-grain leather that will develop a beautiful patina over time. Includes a leather strap closure.', 
 '["img/products/journal1.jpg", "img/products/journal2.jpg"]', 
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), NOW(), NOW()),

('blue-wave-glass-vase', 'Blue Wave Glass Vase', 6, 'james-glassworks', 159.99, 129.99, TRUE, 7, 
 'Stunning hand-blown glass vase with swirling blue and white wave patterns.', 
 'Approximately 12 inches tall with a 5-inch opening. Each vase is individually blown and shaped, making every piece unique in its exact pattern and shape.', 
 '["img/products/glass-vase1.jpg", "img/products/glass-vase2.jpg"]', 
 DATE_SUB(CURDATE(), INTERVAL 8 DAY), NOW(), NOW())

ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), sale_price = VALUES(sale_price), 
                        on_sale = VALUES(on_sale), stock = VALUES(stock), description = VALUES(description), 
                        details = VALUES(details), updated_at = NOW();

-- 插入示例评论数据
INSERT INTO reviews (product_id, user_id, rating, comment, created_at, updated_at) VALUES
('silver-leaf-necklace', 1, 5, 'This necklace is absolutely beautiful! The craftsmanship is excellent, and it looks even better in person than in the photos.', NOW(), NOW()),
('blue-ceramic-mug-set', 1, 4, 'Love these mugs! The color is gorgeous, and they feel great to hold. Taking off one star because one mug had a small imperfection in the glaze.', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('handwoven-wool-blanket', 1, 5, 'This blanket is incredible. So soft and warm, and the craftsmanship is outstanding. Worth every penny!', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)); 