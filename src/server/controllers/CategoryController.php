<?php
/**
 * 类别控制器
 * 处理类别相关的API请求
 */
require_once __DIR__ . '/models.php';
require_once __DIR__ . '/Database.php';

class CategoryController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * 获取所有类别
     */
    public function getAllCategories() {
        try {
            $categories = $this->db->fetchAll("
                SELECT * FROM categories ORDER BY name ASC
            ");
            
            $formattedCategories = [];
            foreach ($categories as $category) {
                $formattedCategories[] = [
                    'id' => $category['id'],
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'createdAt' => $category['created_at'],
                    'updatedAt' => $category['updated_at']
                ];
            }
            
            sendApiResponse($formattedCategories);
        } catch (Exception $e) {
            sendApiResponse("Error fetching categories: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 获取单个类别详情
     * @param int $id 类别ID
     */
    public function getCategory($id) {
        try {
            $category = $this->db->fetchOne("
                SELECT * FROM categories WHERE id = ?
            ", [$id]);
            
            if (!$category) {
                sendApiResponse("Category not found", false, 404);
                return;
            }
            
            $formattedCategory = [
                'id' => $category['id'],
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
                'createdAt' => $category['created_at'],
                'updatedAt' => $category['updated_at']
            ];
            
            sendApiResponse($formattedCategory);
        } catch (Exception $e) {
            sendApiResponse("Error fetching category: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 按slug获取类别
     * @param string $slug 类别slug
     */
    public function getCategoryBySlug($slug) {
        try {
            $category = $this->db->fetchOne("
                SELECT * FROM categories WHERE slug = ?
            ", [$slug]);
            
            if (!$category) {
                sendApiResponse("Category not found", false, 404);
                return;
            }
            
            $formattedCategory = [
                'id' => $category['id'],
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
                'createdAt' => $category['created_at'],
                'updatedAt' => $category['updated_at']
            ];
            
            sendApiResponse($formattedCategory);
        } catch (Exception $e) {
            sendApiResponse("Error fetching category: " . $e->getMessage(), false, 500);
        }
    }
    
    /**
     * 添加新类别（管理员功能）
     */
    public function addCategory() {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['name']) || !isset($data['slug'])) {
            sendApiResponse("Name and slug are required", false, 400);
            return;
        }
        
        // 检查slug是否已存在
        $existingCategory = $this->db->fetchOne("SELECT id FROM categories WHERE slug = ?", [$data['slug']]);
        if ($existingCategory) {
            sendApiResponse("Slug already exists", false, 409);
            return;
        }
        
        // 准备类别数据
        $categoryData = [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 插入类别
        $categoryId = $this->db->insert("categories", $categoryData);
        
        if ($categoryId) {
            $category = $this->db->fetchOne("SELECT * FROM categories WHERE id = ?", [$categoryId]);
            
            $formattedCategory = [
                'id' => $category['id'],
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
                'createdAt' => $category['created_at'],
                'updatedAt' => $category['updated_at']
            ];
            
            sendApiResponse($formattedCategory, true, 201);
        } else {
            sendApiResponse("Failed to add category", false, 500);
        }
    }
    
    /**
     * 更新类别（管理员功能）
     * @param int $id 类别ID
     */
    public function updateCategory($id) {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 检查类别是否存在
        $category = $this->db->fetchOne("SELECT id FROM categories WHERE id = ?", [$id]);
        if (!$category) {
            sendApiResponse("Category not found", false, 404);
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
        
        if (isset($data['slug'])) {
            // 检查slug是否已存在（排除当前类别）
            $existingCategory = $this->db->fetchOne(
                "SELECT id FROM categories WHERE slug = ? AND id != ?", 
                [$data['slug'], $id]
            );
            
            if ($existingCategory) {
                sendApiResponse("Slug already exists", false, 409);
                return;
            }
            
            $updateData['slug'] = $data['slug'];
        }
        
        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }
        
        // 更新类别
        $success = $this->db->update("categories", $updateData, "id = ?", [$id]);
        
        if ($success) {
            $updatedCategory = $this->db->fetchOne("SELECT * FROM categories WHERE id = ?", [$id]);
            
            $formattedCategory = [
                'id' => $updatedCategory['id'],
                'name' => $updatedCategory['name'],
                'slug' => $updatedCategory['slug'],
                'description' => $updatedCategory['description'],
                'createdAt' => $updatedCategory['created_at'],
                'updatedAt' => $updatedCategory['updated_at']
            ];
            
            sendApiResponse($formattedCategory);
        } else {
            sendApiResponse("Failed to update category", false, 500);
        }
    }
    
    /**
     * 删除类别（管理员功能）
     * @param int $id 类别ID
     */
    public function deleteCategory($id) {
        // 检查是否为管理员
        if (!$this->isAdmin()) {
            sendApiResponse("Unauthorized", false, 403);
            return;
        }
        
        // 检查类别是否存在
        $category = $this->db->fetchOne("SELECT id FROM categories WHERE id = ?", [$id]);
        if (!$category) {
            sendApiResponse("Category not found", false, 404);
            return;
        }
        
        // 检查是否有关联产品
        $products = $this->db->fetchOne("SELECT COUNT(*) as count FROM products WHERE category_id = ?", [$id]);
        if ($products['count'] > 0) {
            sendApiResponse("Cannot delete category with associated products", false, 409);
            return;
        }
        
        // 删除类别
        $success = $this->db->delete("categories", "id = ?", [$id]);
        
        if ($success) {
            sendApiResponse("Category deleted successfully");
        } else {
            sendApiResponse("Failed to delete category", false, 500);
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