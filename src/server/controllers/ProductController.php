<?php
namespace Controllers;

use Models\Product;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class ProductController {
    private $db;
    private $product;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->product = new Product($this->db);
        $this->logger = new Logger('product.log');
    }
    
    public function getProducts($filters = [], $page = 1, $limit = 10) {
        try {
            return [
                'success' => true,
                'data' => $this->product->getAll($filters, $page, $limit)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get products failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get products: ' . $e->getMessage()
            ];
        }
    }
    
    public function searchProducts($keyword, $page = 1, $limit = 10) {
        try {
            return [
                'success' => true,
                'data' => $this->product->search($keyword, $page, $limit)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Search products failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to search products: ' . $e->getMessage()
            ];
        }
    }
    
    public function getProductById($id) {
        try {
            $product = $this->product->findById($id);
            
            if (!$product) {
                return [
                    'success' => false,
                    'message' => 'Product not found'
                ];
            }
            
            // Decode gallery JSON if needed
            if (isset($product['gallery']) && !is_null($product['gallery'])) {
                $product['gallery'] = json_decode($product['gallery'], true);
            }
            
            return [
                'success' => true,
                'product' => $product
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get product by ID failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get product: ' . $e->getMessage()
            ];
        }
    }
    
    public function getProductBySlug($slug) {
        try {
            $product = $this->product->findBySlug($slug);
            
            if (!$product) {
                return [
                    'success' => false,
                    'message' => 'Product not found'
                ];
            }
            
            // Decode gallery JSON if needed
            if (isset($product['gallery']) && !is_null($product['gallery'])) {
                $product['gallery'] = json_decode($product['gallery'], true);
            }
            
            return [
                'success' => true,
                'product' => $product
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get product by slug failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get product: ' . $e->getMessage()
            ];
        }
    }
    
    public function createProduct($data) {
        try {
            // Validate input
            $validator = new Validator($data, [
                'name' => 'required',
                'slug' => 'required',
                'sku' => 'required',
                'price' => 'required|numeric'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors()
                ];
            }
            
            // Create product
            $productId = $this->product->create($data);
            
            // Get the created product
            $product = $this->product->findById($productId);
            
            $this->logger->info('Product created', ['id' => $productId, 'name' => $data['name']]);
            
            return [
                'success' => true,
                'message' => 'Product created successfully',
                'product' => $product
            ];
        } catch (\Exception $e) {
            $this->logger->error('Create product failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateProduct($id, $data) {
        try {
            // Check if product exists
            $existingProduct = $this->product->findById($id);
            if (!$existingProduct) {
                return [
                    'success' => false,
                    'message' => 'Product not found'
                ];
            }
            
            // Update product
            $this->product->update($id, $data);
            
            // Get updated product
            $updatedProduct = $this->product->findById($id);
            
            $this->logger->info('Product updated', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => $updatedProduct
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update product failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ];
        }
    }
    
    public function deleteProduct($id) {
        try {
            // Check if product exists
            $existingProduct = $this->product->findById($id);
            if (!$existingProduct) {
                return [
                    'success' => false,
                    'message' => 'Product not found'
                ];
            }
            
            // Instead of actually deleting, set active to false
            $this->product->update($id, ['active' => 0]);
            
            $this->logger->info('Product deleted (deactivated)', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Product deleted successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Delete product failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ];
        }
    }
} 