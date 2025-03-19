<?php
/**
 * 设计师控制器
 * 处理设计师相关的API请求
 */
require_once __DIR__ . '/models.php';
require_once __DIR__ . '/Database.php';

class DesignerController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * 获取所有设计师
     */
    public function getAllDesigners() {
        try {
            $designers = $this->db->fetchAll("
                SELECT * FROM designers ORDER BY name ASC
            ");
            
            $formattedDesigners = [];
            foreach ($designers as $designer) {
                $formattedDesigners[] = [
                    'id' => $designer['id'],
                    'name' => $designer['name'],
                    'specialty' => $designer['specialty'],
                    'bio' => $designer['bio'],
                    'image' => $designer['image'],
                    'featured' => (bool)$designer['featured'],
                    'social' => json_decode($designer['social'], true) ?: [],
                    'createdAt' => $designer['created_at'],
                    'updatedAt' => $designer['updated_at']
                ];
            }
            
            sendApiResponse($formattedDesigners);
        } catch (Exception $e) {
            sendApiResponse("Error fetching designers: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取单个设计师详情
     * @param string $id 设计师ID
     */
    public function getDesigner($id) {
        try {
            $designer = $this->db->fetchOne("
                SELECT * FROM designers WHERE id = ?
            ", [$id]);
            
            if (!$designer) {
                sendApiResponse("Designer not found", false, 404);
                return;
            }
            
            $formattedDesigner = [
                'id' => $designer['id'],
                'name' => $designer['name'],
                'specialty' => $designer['specialty'],
                'bio' => $designer['bio'],
                'image' => $designer['image'],
                'featured' => (bool)$designer['featured'],
                'social' => json_decode($designer['social'], true) ?: [],
                'createdAt' => $designer['created_at'],
                'updatedAt' => $designer['updated_at']
            ];
            
            // 获取设计师的产品
            $products = $this->getDesignerProducts($id);
            $formattedDesigner['products'] = $products;
            
            sendApiResponse($formattedDesigner);
        } catch (Exception $e) {
            sendApiResponse("Error fetching designer: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取精选设计师
     */
    public function getFeaturedDesigners() {
        try {
            $designers = $this->db->fetchAll("
                SELECT * FROM designers WHERE featured = TRUE ORDER BY name ASC
            ");
            
            $formattedDesigners = [];
            foreach ($designers as $designer) {
                $formattedDesigners[] = [
                    'id' => $designer['id'],
                    'name' => $designer['name'],
                    'specialty' => $designer['specialty'],
                    'bio' => $designer['bio'],
                    'image' => $designer['image'],
                    'featured' => (bool)$designer['featured'],
                    'social' => json_decode($designer['social'], true) ?: [],
                    'createdAt' => $designer['created_at'],
                    'updatedAt' => $designer['updated_at']
                ];
            }
            
            sendApiResponse($formattedDesigners);
        } catch (Exception $e) {
            sendApiResponse("Error fetching featured designers: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取设计师的产品
     * @param string $designerId 设计师ID
     * @return array 产品列表
     */
    private function getDesignerProducts($designerId) {
        $products = $this->db->fetchAll("
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.designer_id = ?
            ORDER BY p.listing_date DESC
        ", [$designerId]);
        
        $formattedProducts = [];
        foreach ($products as $product) {
            $formattedProducts[] = [
                'id' => $product['id'],
                'name' => $product['name'],
                'categoryId' => $product['category_id'],
                'categoryName' => $product['category_name'],
                'categorySlug' => $product['category_slug'],
                'price' => (float)$product['price'],
                'stock' => (int)$product['stock'],
                'description' => $product['description'],
                'details' => $product['details'],
                'onSale' => (bool)$product['on_sale'],
                'salePrice' => $product['sale_price'] ? (float)$product['sale_price'] : null,
                'images' => json_decode($product['images'], true) ?: [],
                'listingDate' => $product['listing_date'],
                'createdAt' => $product['created_at'],
                'updatedAt' => $product['updated_at']
            ];
        }
        
        return $formattedProducts;
    }
    
    /**
     * 添加新设计师（管理员功能）
     */
    public function addDesigner() {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['id']) || !isset($data['name'])) {
            sendApiResponse("ID and name are required", false, 400);
            return;
        }
        
        // 检查ID是否已存在
        $existingDesigner = $this->db->fetchOne("SELECT id FROM designers WHERE id = ?", [$data['id']]);
        if ($existingDesigner) {
            sendApiResponse("Designer ID already exists", false, 409);
            return;
        }
        
        // 准备设计师数据
        $designerData = [
            'id' => $data['id'],
            'name' => $data['name'],
            'specialty' => $data['specialty'] ?? null,
            'bio' => $data['bio'] ?? null,
            'image' => $data['image'] ?? null,
            'featured' => $data['featured'] ?? false,
            'social' => isset($data['social']) ? json_encode($data['social']) : null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 插入设计师
        $success = $this->db->insert("designers", $designerData, true); // 返回布尔值，因为ID已经提供
        
        if ($success) {
            $designer = $this->db->fetchOne("SELECT * FROM designers WHERE id = ?", [$data['id']]);
            
            $formattedDesigner = [
                'id' => $designer['id'],
                'name' => $designer['name'],
                'specialty' => $designer['specialty'],
                'bio' => $designer['bio'],
                'image' => $designer['image'],
                'featured' => (bool)$designer['featured'],
                'social' => json_decode($designer['social'], true) ?: [],
                'createdAt' => $designer['created_at'],
                'updatedAt' => $designer['updated_at']
            ];
            
            sendApiResponse($formattedDesigner, true, 201);
        } else {
            sendApiResponse("Failed to add designer", false, 500);
        }
    }
    
    /**
     * 更新设计师（管理员功能）
     * @param string $id 设计师ID
     */
    public function updateDesigner($id) {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 检查设计师是否存在
        $designer = $this->db->fetchOne("SELECT id FROM designers WHERE id = ?", [$id]);
        if (!$designer) {
            sendApiResponse("Designer not found", false, 404);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            sendApiResponse("Invalid request data", false, 400);
            return;
        }
        
        // 准备更新数据
        $updateData = [
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 可更新字段
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        
        if (isset($data['specialty'])) {
            $updateData['specialty'] = $data['specialty'];
        }
        
        if (isset($data['bio'])) {
            $updateData['bio'] = $data['bio'];
        }
        
        if (isset($data['image'])) {
            $updateData['image'] = $data['image'];
        }
        
        if (isset($data['featured'])) {
            $updateData['featured'] = $data['featured'] ? 1 : 0;
        }
        
        if (isset($data['social'])) {
            $updateData['social'] = json_encode($data['social']);
        }
        
        // 更新设计师
        $success = $this->db->update("designers", $updateData, "id = ?", [$id]);
        
        if ($success) {
            $updatedDesigner = $this->db->fetchOne("SELECT * FROM designers WHERE id = ?", [$id]);
            
            $formattedDesigner = [
                'id' => $updatedDesigner['id'],
                'name' => $updatedDesigner['name'],
                'specialty' => $updatedDesigner['specialty'],
                'bio' => $updatedDesigner['bio'],
                'image' => $updatedDesigner['image'],
                'featured' => (bool)$updatedDesigner['featured'],
                'social' => json_decode($updatedDesigner['social'], true) ?: [],
                'createdAt' => $updatedDesigner['created_at'],
                'updatedAt' => $updatedDesigner['updated_at']
            ];
            
            sendApiResponse($formattedDesigner);
        } else {
            sendApiResponse("Failed to update designer", false, 500);
        }
    }
    
    /**
     * 删除设计师（管理员功能）
     * @param string $id 设计师ID
     */
    public function deleteDesigner($id) {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 检查设计师是否存在
        $designer = $this->db->fetchOne("SELECT id FROM designers WHERE id = ?", [$id]);
        if (!$designer) {
            sendApiResponse("Designer not found", false, 404);
            return;
        }
        
        // 检查是否有关联产品
        $products = $this->db->fetchOne("SELECT COUNT(*) as count FROM products WHERE designer_id = ?", [$id]);
        if ($products['count'] > 0) {
            sendApiResponse("Cannot delete designer with associated products", false, 409);
            return;
        }
        
        // 删除设计师
        $success = $this->db->delete("designers", "id = ?", [$id]);
        
        if ($success) {
            sendApiResponse("Designer deleted successfully");
        } else {
            sendApiResponse("Failed to delete designer", false, 500);
        }
    }
    
    /**
     * 检查当前用户是否为管理员
     * @return bool
     */
    private function isAdmin() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
        
        // 获取用户角色
        $user = $this->db->fetchOne("SELECT role FROM users WHERE id = ?", [$_SESSION['user_id']]);
        
        return $user && $user['role'] === 'admin';
    }
} 