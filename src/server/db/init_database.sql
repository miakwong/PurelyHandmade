-- 初始化数据库脚本
-- 创建表和示例数据

-- 删除已存在的表以避免冲突
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS designers;
DROP TABLE IF EXISTS users;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthday DATE,
    gender ENUM('male', 'female', 'other'),
    avatar LONGTEXT,  -- Base64格式存储
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 类别表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 设计师表
CREATE TABLE designers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    bio TEXT,
    image VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    social JSON,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 产品表
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    designer_id VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    details TEXT,
    on_sale BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(10,2),
    images JSON,  -- 存储图片路径数组
    listing_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (designer_id) REFERENCES designers(id) ON DELETE SET NULL
);

-- 评论表
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    date DATE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 订单表
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_date DATETIME NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 订单商品表
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(100) NOT NULL, -- 存储购买时的产品名称，防止产品被删除后丢失信息
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- 购买时的价格，而非当前产品价格
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 插入管理员用户
INSERT INTO users (username, password_hash, email, first_name, last_name, role, created_at, updated_at)
VALUES ('admin', '$2y$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W', 'admin@purelyhandmade.com', 'Admin', 'User', 'admin', NOW(), NOW());

-- 插入类别数据
INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES 
('Ceramics', 'ceramics', 'Handcrafted ceramic items', NOW(), NOW()),
('Wood Crafts', 'wood-crafts', 'Handmade wooden items and carvings', NOW(), NOW()),
('Textiles', 'textiles', 'Handwoven and textile-based products', NOW(), NOW());

-- 插入设计师数据
INSERT INTO designers (id, name, specialty, bio, image, featured, social, created_at, updated_at) VALUES 
('d1', 'Emma Thompson', 'Ceramic Artist', 'Emma brings 15 years of ceramic artistry to our collection. Her handcrafted mugs and bowls are known for their delicate glazes and functional design.', '/src/client/img/designer1-bg.JPG', TRUE, '{"instagram": "https://instagram.com/emmathompsonceramics", "pinterest": "https://pinterest.com/emmathompsonceramics", "etsy": "https://etsy.com/shop/emmathompsonceramics"}', NOW(), NOW()),
('d2', 'Michael Chen', 'Wood Craftsman', 'Michael\'s hand-carved wooden pieces showcase the natural beauty of sustainable hardwoods. Each piece tells a story through its grain patterns and careful detailing.', '/src/client/img/designer2-bg.JPG', TRUE, '{"instagram": "https://instagram.com/michaelchenwoodcraft", "pinterest": "https://pinterest.com/michaelchenwoodcraft", "youtube": "https://youtube.com/@michaelchenwoodcraft"}', NOW(), NOW()),
('d3', 'Sophia Williams', 'Textile Artist', 'Sophia weaves natural fibers into stunning textiles using traditional techniques. Her passion for sustainable materials shines through in every handwoven piece.', '/src/client/img/designer3-bg.JPG', TRUE, '{"instagram": "https://instagram.com/sophiawilliamstextiles", "pinterest": "https://pinterest.com/sophiawilliamstextiles", "tiktok": "https://tiktok.com/@sophiawilliamstextiles"}', NOW(), NOW());

-- 插入产品数据
INSERT INTO products (name, category_id, designer_id, price, stock, description, details, on_sale, sale_price, images, listing_date, created_at, updated_at) VALUES 
('Handmade Ceramic Mug', 1, 'd1', 25.99, 15, 'A beautifully crafted handmade ceramic mug. Perfect for your morning coffee or tea. Each piece is unique and individually crafted by our artisans.', 'Material: Ceramic<br>Size: 4" height x 3" diameter<br>Capacity: 300ml<br>Care: Dishwasher safe', FALSE, NULL, '["\/src\/client\/img\/mug_1.JPG", "\/src\/client\/img\/mug_2.JPG", "\/src\/client\/img\/mug_3.JPG"]', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

('Handcrafted Modern Mug Set', 1, 'd1', 89.99, 8, 'A set of four modern handcrafted ceramic mugs. Each mug features a unique glaze pattern.', 'Material: Ceramic<br>Size: 4" height x 3" diameter<br>Capacity: 300ml<br>Care: Dishwasher safe<br>Set includes: 4 mugs', TRUE, 79.99, '["\/src\/client\/img\/mug_item2_1.JPG", "\/src\/client\/img\/mug_item2_2.JPG", "\/src\/client\/img\/mug_item2_3.JPG"]', NOW(), NOW(), NOW()),

('Artisan Ceramic Teacup Set', 1, 'd1', 99.99, 5, 'An elegant set of handcrafted ceramic teacups with matching saucers. Perfect for your afternoon tea ritual.', 'Material: Ceramic<br>Cup Size: 3" height x 2.5" diameter<br>Capacity: 200ml<br>Care: Hand wash recommended<br>Set includes: 4 cups, 4 saucers', FALSE, NULL, '["\/src\/client\/img\/mug_3.JPG", "\/src\/client\/img\/mug_2.JPG", "\/src\/client\/img\/mug_1.JPG"]', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

('Handcrafted Wooden Sculpture', 2, 'd2', 149.99, 3, 'A stunning handcrafted wooden sculpture that brings natural beauty to your space. Each piece is unique and carefully carved by our master woodworker.', 'Material: Solid oak<br>Size: 12" height x 6" width x 6" depth<br>Finish: Natural oil<br>Care: Dust regularly, avoid direct sunlight', FALSE, NULL, '["\/src\/client\/img\/Wood_1.JPG", "\/src\/client\/img\/Wood_2.JPG", "\/src\/client\/img\/Wood_3.JPG"]', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

('Decorative Wooden Bowl', 2, 'd2', 79.99, 7, 'A beautiful hand-turned wooden bowl perfect for displaying fruits or as a centerpiece. Made from sustainably sourced wood.', 'Material: Maple wood<br>Size: 4" height x 10" diameter<br>Finish: Food-safe mineral oil<br>Care: Hand wash only, dry thoroughly', TRUE, 69.99, '["\/src\/client\/img\/wood_item2_1.JPG", "\/src\/client\/img\/wood_item2_2.JPG", "\/src\/client\/img\/wood_item2_3.JPG"]', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

('Handwoven Textile Wall Hanging', 3, 'd3', 89.99, 2, 'A beautiful handwoven wall hanging made with natural fibers and dyes. Perfect for adding texture and warmth to any room.', 'Material: Cotton and wool blend<br>Size: 24" x 36"<br>Colors: Natural dyes<br>Hanging: Wooden dowel included<br>Care: Spot clean only', FALSE, NULL, '["\/src\/client\/img\/Handwoven_1.JPG", "\/src\/client\/img\/Handwoven_2.JPG", "\/src\/client\/img\/Handwoven_3.JPG"]', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

('Handwoven Basket Set', 3, 'd3', 69.99, 4, 'Set of three handwoven baskets in varying sizes. Perfect for storage or as decorative pieces. Each basket is made from sustainable materials.', 'Material: Natural seagrass<br>Sizes: Small (6" diameter), Medium (8" diameter), Large (10" diameter)<br>Finish: Natural<br>Care: Dust regularly, avoid moisture', TRUE, 59.99, '["\/src\/client\/img\/handwoven_item2_1.JPG", "\/src\/client\/img\/handwoven_item2_2.JPG", "\/src\/client\/img\/handwoven_item2_3.JPG"]', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 插入评论数据
INSERT INTO reviews (product_id, user_id, name, rating, comment, date, created_at, updated_at) VALUES 
(1, 1, 'Jane D.', 5, 'Beautiful mug, love the craftsmanship!', '2023-10-15', NOW(), NOW()),
(1, NULL, 'Michael R.', 4, 'Great quality and unique design.', '2023-09-20', NOW(), NOW()),
(2, 1, 'Sarah T.', 5, 'These mugs are stunning! Perfect size and feel great in the hand.', '2023-11-05', NOW(), NOW()),
(4, NULL, 'Robert J.', 5, 'Stunning piece of art. The craftsmanship is exceptional.', '2023-10-10', NOW(), NOW()),
(4, NULL, 'Lisa M.', 4, 'Beautiful grain patterns and excellent finish.', '2023-09-05', NOW(), NOW()),
(5, 1, 'David K.', 5, 'This bowl is simply beautiful! The craftsmanship is outstanding.', '2023-11-15', NOW(), NOW()),
(6, NULL, 'Emily R.', 5, 'This wall hanging is even more beautiful in person! The craftsmanship is incredible.', '2023-10-25', NOW(), NOW()),
(6, NULL, 'Thomas N.', 4, 'Love the natural colors and texture. It\'s the perfect addition to my living room.', '2023-09-18', NOW(), NOW()),
(7, 1, 'Jennifer L.', 5, 'These baskets are beautiful and well-made. Perfect for organizing my space!', '2023-11-08', NOW(), NOW()); 