<?php
namespace Controllers;

use Models\Review;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class ReviewController {
    private $db;
    private $review;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->review = new Review($this->db);
        $this->logger = new Logger('review.log');
    }
    
    public function getReviews($filters = [], $page = 1, $limit = 10) {
        try {
            return [
                'success' => true,
                'data' => $this->review->getAll($filters, $page, $limit)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get reviews failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get reviews: ' . $e->getMessage()
            ];
        }
    }
    
    public function getReviewById($id) {
        try {
            $review = $this->review->findById($id);
            
            if (!$review) {
                return [
                    'success' => false,
                    'message' => 'Review not found'
                ];
            }
            
            return [
                'success' => true,
                'review' => $review
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get review by ID failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get review: ' . $e->getMessage()
            ];
        }
    }
    
    public function createReview($data) {
        try {
            // Validate input
            $validator = new Validator($data, [
                'userId' => 'required|integer',
                'productId' => 'required|integer',
                'rating' => 'required|integer',
                'content' => 'required'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors()
                ];
            }
            
            // Check if user has already reviewed this product
            if ($this->review->hasUserReviewed($data['userId'], $data['productId'])) {
                return [
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ];
            }
            
            // Create review
            $reviewId = $this->review->create($data);
            
            // Get the created review
            $review = $this->review->findById($reviewId);
            
            $this->logger->info('Review created', [
                'id' => $reviewId, 
                'userId' => $data['userId'],
                'productId' => $data['productId']
            ]);
            
            return [
                'success' => true,
                'message' => 'Review submitted successfully and waiting for approval',
                'review' => $review
            ];
        } catch (\Exception $e) {
            $this->logger->error('Create review failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to create review: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateReviewStatus($id, $status) {
        try {
            // Check if review exists
            $existingReview = $this->review->findById($id);
            if (!$existingReview) {
                return [
                    'success' => false,
                    'message' => 'Review not found'
                ];
            }
            
            // Validate status
            $validStatuses = ['pending', 'approved', 'rejected'];
            if (!in_array($status, $validStatuses)) {
                return [
                    'success' => false,
                    'message' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)
                ];
            }
            
            // Update review status
            $this->review->update($id, ['status' => $status]);
            
            // Get updated review
            $updatedReview = $this->review->findById($id);
            
            $this->logger->info('Review status updated', ['id' => $id, 'status' => $status]);
            
            return [
                'success' => true,
                'message' => 'Review status updated successfully',
                'review' => $updatedReview
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update review status failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update review status: ' . $e->getMessage()
            ];
        }
    }
    
    public function deleteReview($id) {
        try {
            // Check if review exists
            $existingReview = $this->review->findById($id);
            if (!$existingReview) {
                return [
                    'success' => false,
                    'message' => 'Review not found'
                ];
            }
            
            // Delete review
            $this->review->delete($id);
            
            $this->logger->info('Review deleted', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Review deleted successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Delete review failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete review: ' . $e->getMessage()
            ];
        }
    }
    
    public function getProductAverageRating($productId) {
        try {
            $rating = $this->review->getAverageRating($productId);
            
            return [
                'success' => true,
                'rating' => $rating
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get product average rating failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get product average rating: ' . $e->getMessage()
            ];
        }
    }
} 