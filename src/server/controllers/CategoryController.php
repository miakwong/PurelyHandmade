<?php
namespace Controllers;

use Models\Category;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class CategoryController {
    private $db;
    private $category;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->category = new Category($this->db);
        $this->logger = new Logger('category.log');
    }
    
    public function getCategories($filters = []) {
        try {
            return [
                'success' => true,
                'data' => $this->category->getAll($filters)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get categories failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get categories: ' . $e->getMessage()
            ];
        }
    }
    
    public function getCategoryById($id) {
        try {
            $category = $this->category->findById($id);
            
            if (!$category) {
                return [
                    'success' => false,
                    'message' => 'Category not found'
                ];
            }
            
            // Get product count for this category
            $productCount = $this->category->getProductCount($id);
            $category['productCount'] = $productCount;
            
            return [
                'success' => true,
                'category' => $category
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get category by ID failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ];
        }
    }
    
    public function getCategoryBySlug($slug) {
        try {
            $category = $this->category->findBySlug($slug);
            
            if (!$category) {
                return [
                    'success' => false,
                    'message' => 'Category not found'
                ];
            }
            
            // Get product count for this category
            $productCount = $this->category->getProductCount($category['id']);
            $category['productCount'] = $productCount;
            
            return [
                'success' => true,
                'category' => $category
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get category by slug failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get category: ' . $e->getMessage()
            ];
        }
    }
    
    public function createCategory($data) {
        try {
            // Validate input
            $validator = new Validator($data, [
                'name' => 'required',
                'slug' => 'required'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors()
                ];
            }
            
            // Check if slug already exists
            $existingCategory = $this->category->findBySlug($data['slug']);
            if ($existingCategory) {
                return [
                    'success' => false,
                    'message' => 'A category with this slug already exists'
                ];
            }
            
            // Create category
            $categoryId = $this->category->create($data);
            
            // Get the created category
            $category = $this->category->findById($categoryId);
            
            $this->logger->info('Category created', ['id' => $categoryId, 'name' => $data['name']]);
            
            return [
                'success' => true,
                'message' => 'Category created successfully',
                'category' => $category
            ];
        } catch (\Exception $e) {
            $this->logger->error('Create category failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to create category: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateCategory($id, $data) {
        try {
            // Check if category exists
            $existingCategory = $this->category->findById($id);
            if (!$existingCategory) {
                return [
                    'success' => false,
                    'message' => 'Category not found'
                ];
            }
            
            // If slug is being changed, check if it already exists
            if (isset($data['slug']) && $data['slug'] !== $existingCategory['slug']) {
                $categoryWithSlug = $this->category->findBySlug($data['slug']);
                if ($categoryWithSlug) {
                    return [
                        'success' => false,
                        'message' => 'A category with this slug already exists'
                    ];
                }
            }
            
            // Update category
            $this->category->update($id, $data);
            
            // Get updated category
            $updatedCategory = $this->category->findById($id);
            
            $this->logger->info('Category updated', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Category updated successfully',
                'category' => $updatedCategory
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update category failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update category: ' . $e->getMessage()
            ];
        }
    }
    
    public function deleteCategory($id) {
        try {
            // Check if category exists
            $existingCategory = $this->category->findById($id);
            if (!$existingCategory) {
                return [
                    'success' => false,
                    'message' => 'Category not found'
                ];
            }
            
            // Check if there are products in this category
            $productCount = $this->category->getProductCount($id);
            if ($productCount > 0) {
                return [
                    'success' => false,
                    'message' => 'Cannot delete category with products. Remove or reassign products first.'
                ];
            }
            
            // Delete category
            $this->category->delete($id);
            
            $this->logger->info('Category deleted', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Category deleted successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Delete category failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete category: ' . $e->getMessage()
            ];
        }
    }
    
    public function getProductCount($categoryId) {
        try {
            return $this->category->getProductCount($categoryId);
        } catch (\Exception $e) {
            $this->logger->error('Get product count failed', Logger::formatException($e));
            return 0;
        }
    }
} 