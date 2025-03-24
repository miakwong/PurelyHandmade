<?php
/**
 * API endpoint to add items to cart
 * POST /api/cart/add
 */

use Controllers\CartController;
use Utils\Response;

// Create response object
$response = new Response();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response->methodNotAllowed('Method not allowed. Only POST requests are accepted.');
    exit;
}

try {
    // Create cart controller
    $cartController = new CartController();
    
    // Add item to cart
    $result = $cartController->addToCart();
    
    // Return response
    if ($result['success']) {
        $response->success($result['data'], $result['message']);
    } else {
        $response->badRequest($result['message']);
    }
} catch (Exception $e) {
    $response->error('Failed to add item to cart: ' . $e->getMessage());
} 