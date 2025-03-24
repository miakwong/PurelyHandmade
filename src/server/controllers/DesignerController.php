<?php
namespace Controllers;

use Models\Designer;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class DesignerController {
    private $db;
    private $designer;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->designer = new Designer($this->db);
        $this->logger = new Logger('designer.log');
    }
    
    public function getDesigners($filters = []) {
        try {
            return [
                'success' => true,
                'data' => $this->designer->getAll($filters)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get designers failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get designers: ' . $e->getMessage()
            ];
        }
    }
    
    public function getDesignerById($id) {
        try {
            $designer = $this->designer->findById($id);
            
            if (!$designer) {
                return [
                    'success' => false,
                    'message' => 'Designer not found'
                ];
            }
            
            // Get product count for this designer
            $productCount = $this->designer->getProductCount($id);
            $designer['productCount'] = $productCount;
            
            return [
                'success' => true,
                'designer' => $designer
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get designer by ID failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get designer: ' . $e->getMessage()
            ];
        }
    }
    
    public function getDesignerBySlug($slug) {
        try {
            $designer = $this->designer->findBySlug($slug);
            
            if (!$designer) {
                return [
                    'success' => false,
                    'message' => 'Designer not found'
                ];
            }
            
            // Get product count for this designer
            $productCount = $this->designer->getProductCount($designer['id']);
            $designer['productCount'] = $productCount;
            
            return [
                'success' => true,
                'designer' => $designer
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get designer by slug failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get designer: ' . $e->getMessage()
            ];
        }
    }
    
    public function createDesigner($data) {
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
            $existingDesigner = $this->designer->findBySlug($data['slug']);
            if ($existingDesigner) {
                return [
                    'success' => false,
                    'message' => 'A designer with this slug already exists'
                ];
            }
            
            // Create designer
            $designerId = $this->designer->create($data);
            
            // Get the created designer
            $designer = $this->designer->findById($designerId);
            
            $this->logger->info('Designer created', ['id' => $designerId, 'name' => $data['name']]);
            
            return [
                'success' => true,
                'message' => 'Designer created successfully',
                'designer' => $designer
            ];
        } catch (\Exception $e) {
            $this->logger->error('Create designer failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to create designer: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateDesigner($id, $data) {
        try {
            // Check if designer exists
            $existingDesigner = $this->designer->findById($id);
            if (!$existingDesigner) {
                return [
                    'success' => false,
                    'message' => 'Designer not found'
                ];
            }
            
            // If slug is being changed, check if it already exists
            if (isset($data['slug']) && $data['slug'] !== $existingDesigner['slug']) {
                $designerWithSlug = $this->designer->findBySlug($data['slug']);
                if ($designerWithSlug) {
                    return [
                        'success' => false,
                        'message' => 'A designer with this slug already exists'
                    ];
                }
            }
            
            // Update designer
            $this->designer->update($id, $data);
            
            // Get updated designer
            $updatedDesigner = $this->designer->findById($id);
            
            $this->logger->info('Designer updated', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Designer updated successfully',
                'designer' => $updatedDesigner
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update designer failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update designer: ' . $e->getMessage()
            ];
        }
    }
    
    public function deleteDesigner($id) {
        try {
            // Check if designer exists
            $existingDesigner = $this->designer->findById($id);
            if (!$existingDesigner) {
                return [
                    'success' => false,
                    'message' => 'Designer not found'
                ];
            }
            
            // Check if there are products from this designer
            $productCount = $this->designer->getProductCount($id);
            if ($productCount > 0) {
                return [
                    'success' => false,
                    'message' => 'Cannot delete designer with products. Remove or reassign products first.'
                ];
            }
            
            // Delete designer
            $this->designer->delete($id);
            
            $this->logger->info('Designer deleted', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Designer deleted successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Delete designer failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete designer: ' . $e->getMessage()
            ];
        }
    }
} 