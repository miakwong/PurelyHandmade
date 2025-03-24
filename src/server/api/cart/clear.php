<?php
/**
 * API endpoint to clear cart
 * POST /api/cart/clear
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
    
    // Clear cart
    $result = $cartController->clearCart();
    
    // Return response
    if ($result['success']) {
        $response->success($result['data'], $result['message']);
    } else {
        $response->badRequest($result['message']);
    }
} catch (Exception $e) {
    $response->error('Failed to clear cart: ' . $e->getMessage());
} 