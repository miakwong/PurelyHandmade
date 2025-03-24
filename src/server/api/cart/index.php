<?php
/**
 * API endpoint to get cart items
 * GET /api/cart
 */

use Controllers\CartController;
use Utils\Response;
use Utils\Logger;

// Create response object
$response = new Response();
$logger = new Logger('cart-api.log');

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $response->methodNotAllowed('Method not allowed. Only GET requests are accepted.');
    exit;
}

try {
    // Create cart controller
    $cartController = new CartController();
    
    // Get cart items
    $result = $cartController->getCart();
    
    // Log the result for debugging
    $logger->info('Cart API response', [
        'success' => $result['success'],
        'message' => $result['message'],
        'dataType' => gettype($result['data']),
        'dataIsArray' => is_array($result['data']),
        'dataCount' => is_array($result['data']) ? count($result['data']) : 0
    ]);
    
    // Return response
    if ($result['success']) {
        // Fixed parameter order to match Response::success($data, $message, $statusCode)
        $response->success($result['data'], $result['message']);
    } else {
        $response->badRequest($result['message']);
    }
} catch (Exception $e) {
    $logger->error('Cart API error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    $response->error('Failed to get cart items: ' . $e->getMessage());
} 