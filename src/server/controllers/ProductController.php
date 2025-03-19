<?php
/**
 * 产品控制器
 * 处理产品相关的API请求
 */
require_once __DIR__ . '/models.php';
require_once __DIR__ . '/Database.php';

class ProductController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * 获取所有产品
     */
    public function getAllProducts() {
        try {
            $products = $this->db->fetchAll("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                ORDER BY p.listing_date DESC
            ");
            
            // 处理JSON字段
            $formattedProducts = [];
            foreach ($products as $product) {
                $productData = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'categoryId' => $product['category_id'],
                    'categoryName' => $product['category_name'],
                    'categorySlug' => $product['category_slug'],
                    'designerId' => $product['designer_id'],
                    'designerName' => $product['designer_name'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'description' => $product['description'],
                    'details' => $product['details'],
                    'onSale' => (bool)$product['on_sale'],
                    'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                    'images' => json_decode($product['images'], true) ?: [],
                    'listingDate' => $product['listing_date'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
                
                // 获取产品评论
                $reviews = $this->getProductReviews($product['id']);
                $productData['reviews'] = $reviews;
                
                $formattedProducts[] = $productData;
            }
            
            sendApiResponse($formattedProducts);
        } catch (Exception $e) {
            sendApiResponse("Error fetching products: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取单个产品详情
     * @param int $id 产品ID
     */
    public function getProduct($id) {
        try {
            $product = $this->db->fetchOne("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                WHERE p.id = ?
            ", [$id]);
            
            if (!$product) {
                sendApiResponse("Product not found", false, 404);
                return;
            }
            
            // 处理JSON字段
            $productData = [
                'id' => $product['id'],
                'name' => $product['name'],
                'categoryId' => $product['category_id'],
                'categoryName' => $product['category_name'],
                'categorySlug' => $product['category_slug'],
                'designerId' => $product['designer_id'],
                'designerName' => $product['designer_name'],
                'price' => (float)$product['price'],
                'stock' => (int)$product['stock'],
                'description' => $product['description'],
                'details' => $product['details'],
                'onSale' => (bool)$product['on_sale'],
                'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                'images' => json_decode($product['images'], true) ?: [],
                'listingDate' => $product['listing_date'],
                'created_at' => $product['created_at'],
                'updated_at' => $product['updated_at']
            ];
            
            // 获取产品评论
            $reviews = $this->getProductReviews($product['id']);
            $productData['reviews'] = $reviews;
            
            sendApiResponse($productData);
        } catch (Exception $e) {
            sendApiResponse("Error fetching product: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取新品
     * @param int $days 天数
     */
    public function getNewArrivals($days = 7) {
        try {
            $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));
            
            $products = $this->db->fetchAll("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                WHERE p.listing_date >= ?
                ORDER BY p.listing_date DESC
            ", [$cutoffDate]);
            
            // 处理JSON字段
            $formattedProducts = [];
            foreach ($products as $product) {
                $productData = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'categoryId' => $product['category_id'],
                    'categoryName' => $product['category_name'],
                    'categorySlug' => $product['category_slug'],
                    'designerId' => $product['designer_id'],
                    'designerName' => $product['designer_name'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'description' => $product['description'],
                    'details' => $product['details'],
                    'onSale' => (bool)$product['on_sale'],
                    'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                    'images' => json_decode($product['images'], true) ?: [],
                    'listingDate' => $product['listing_date'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
                
                $formattedProducts[] = $productData;
            }
            
            sendApiResponse($formattedProducts);
        } catch (Exception $e) {
            sendApiResponse("Error fetching new arrivals: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取特价商品
     */
    public function getOnSaleProducts() {
        try {
            $products = $this->db->fetchAll("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                WHERE p.on_sale = TRUE
                ORDER BY p.listing_date DESC
            ");
            
            // 处理JSON字段
            $formattedProducts = [];
            foreach ($products as $product) {
                $productData = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'categoryId' => $product['category_id'],
                    'categoryName' => $product['category_name'],
                    'categorySlug' => $product['category_slug'],
                    'designerId' => $product['designer_id'],
                    'designerName' => $product['designer_name'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'description' => $product['description'],
                    'details' => $product['details'],
                    'onSale' => (bool)$product['on_sale'],
                    'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                    'images' => json_decode($product['images'], true) ?: [],
                    'listingDate' => $product['listing_date'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
                
                $formattedProducts[] = $productData;
            }
            
            sendApiResponse($formattedProducts);
        } catch (Exception $e) {
            sendApiResponse("Error fetching on sale products: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 按类别获取产品
     * @param int $categoryId 类别ID
     */
    public function getProductsByCategory($categoryId) {
        try {
            $products = $this->db->fetchAll("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                WHERE p.category_id = ?
                ORDER BY p.listing_date DESC
            ", [$categoryId]);
            
            // 处理JSON字段
            $formattedProducts = [];
            foreach ($products as $product) {
                $productData = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'categoryId' => $product['category_id'],
                    'categoryName' => $product['category_name'],
                    'categorySlug' => $product['category_slug'],
                    'designerId' => $product['designer_id'],
                    'designerName' => $product['designer_name'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'description' => $product['description'],
                    'details' => $product['details'],
                    'onSale' => (bool)$product['on_sale'],
                    'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                    'images' => json_decode($product['images'], true) ?: [],
                    'listingDate' => $product['listing_date'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
                
                $formattedProducts[] = $productData;
            }
            
            sendApiResponse($formattedProducts);
        } catch (Exception $e) {
            sendApiResponse("Error fetching products by category: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取产品评论
     * @param int $productId 产品ID
     * @return array 评论列表
     */
    private function getProductReviews($productId) {
        $reviews = $this->db->fetchAll("
            SELECT r.*, u.username
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.date DESC
        ", [$productId]);
        
        $formattedReviews = [];
        foreach ($reviews as $review) {
            $formattedReviews[] = [
                'id' => $review['id'],
                'userId' => $review['user_id'],
                'username' => $review['username'] ?: null,
                'name' => $review['name'],
                'rating' => (int)$review['rating'],
                'comment' => $review['comment'],
                'date' => $review['date'],
                'created_at' => $review['created_at'],
                'updated_at' => $review['updated_at']
            ];
        }
        
        return $formattedReviews;
    }
    
    /**
     * 添加产品评论
     */
    public function addReview() {
        // 确保用户已登录或提供了姓名
        $isLoggedIn = isset($_SESSION['user_id']);
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            sendApiResponse("Invalid request data", false, 400);
            return;
        }
        
        if (!isset($data['productId']) || !isset($data['rating']) || !isset($data['comment'])) {
            sendApiResponse("Missing required fields", false, 400);
            return;
        }
        
        // 验证评分范围
        if ($data['rating'] < 1 || $data['rating'] > 5) {
            sendApiResponse("Rating must be between 1 and 5", false, 400);
            return;
        }
        
        // 检查产品是否存在
        $product = $this->db->fetchOne("SELECT id FROM products WHERE id = ?", [$data['productId']]);
        if (!$product) {
            sendApiResponse("Product not found", false, 404);
            return;
        }
        
        // 准备评论数据
        $reviewData = [
            'product_id' => $data['productId'],
            'rating' => $data['rating'],
            'comment' => $data['comment'],
            'date' => date('Y-m-d'),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 根据是否登录设置用户ID和名称
        if ($isLoggedIn) {
            $reviewData['user_id'] = $_SESSION['user_id'];
            
            // 获取用户名
            $user = $this->db->fetchOne("SELECT first_name, last_name FROM users WHERE id = ?", [$_SESSION['user_id']]);
            $reviewData['name'] = $user['first_name'] . ' ' . substr($user['last_name'], 0, 1) . '.';
        } else {
            if (!isset($data['name']) || trim($data['name']) === '') {
                sendApiResponse("Name is required for non-logged in users", false, 400);
                return;
            }
            $reviewData['name'] = $data['name'];
            $reviewData['user_id'] = null;
        }
        
        // 插入评论
        $reviewId = $this->db->insert("reviews", $reviewData);
        
        if ($reviewId) {
            $review = $this->db->fetchOne("SELECT * FROM reviews WHERE id = ?", [$reviewId]);
            
            $formattedReview = [
                'id' => $review['id'],
                'userId' => $review['user_id'],
                'productId' => $review['product_id'],
                'name' => $review['name'],
                'rating' => (int)$review['rating'],
                'comment' => $review['comment'],
                'date' => $review['date'],
                'created_at' => $review['created_at'],
                'updated_at' => $review['updated_at']
            ];
            
            sendApiResponse($formattedReview, true, 201);
        } else {
            sendApiResponse("Failed to add review", false, 500);
        }
    }
    
    /**
     * 搜索产品
     */
    public function searchProducts() {
        $query = isset($_GET['q']) ? trim($_GET['q']) : '';
        
        if (empty($query)) {
            sendApiResponse("Search query is required", false, 400);
            return;
        }
        
        try {
            $searchQuery = "%{$query}%";
            
            $products = $this->db->fetchAll("
                SELECT p.*, c.name as category_name, c.slug as category_slug, d.name as designer_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN designers d ON p.designer_id = d.id
                WHERE p.name LIKE ? OR p.description LIKE ?
                ORDER BY p.listing_date DESC
            ", [$searchQuery, $searchQuery]);
            
            // 处理JSON字段
            $formattedProducts = [];
            foreach ($products as $product) {
                $productData = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    'categoryId' => $product['category_id'],
                    'categoryName' => $product['category_name'],
                    'categorySlug' => $product['category_slug'],
                    'designerId' => $product['designer_id'],
                    'designerName' => $product['designer_name'],
                    'price' => (float)$product['price'],
                    'stock' => (int)$product['stock'],
                    'description' => $product['description'],
                    'details' => $product['details'],
                    'onSale' => (bool)$product['on_sale'],
                    'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                    'images' => json_decode($product['images'], true) ?: [],
                    'listingDate' => $product['listing_date'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
                
                $formattedProducts[] = $productData;
            }
            
            sendApiResponse($formattedProducts);
        } catch (Exception $e) {
            sendApiResponse("Error searching products: " . $e->getMessage(), false, 500);
        }
    }
} 