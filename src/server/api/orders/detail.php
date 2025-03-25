<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\OrderController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept GET requests
if (getRequestMethod() !== 'GET') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // Apply Auth middleware
    $authMiddleware = new AuthMiddleware();
    $authMiddleware->handle();
    
    $request = new Request();
    $response = new Response();
    $orderController = new OrderController();
    
    // Get user ID from the request
    $userId = $_REQUEST['userId'];
    
    // Get order ID from query parameters
    $orderId = $request->getParam('id');
    
    if (!$orderId) {
        $response->error('Order ID is required');
        exit;
    }
    
    // Get order with items
    $result = $orderController->getOrderById($orderId, $userId);
    
    if ($result['success']) {
        $response->success($result['order']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Order detail error', Utils\Logger::formatException($e));
} 

### Get Order Details - `GET /api/orders/detail.php`
- **Description:** Retrieves details of a specific order by its ID for the authenticated user.
- **Request Headers:**  
  - `Authorization: Bearer <JWT Token>` (Required)

--- Request Parameters (Query)
| Parameter | Type    | Required | Description                       |
|-----------|---------|----------|----------------------------------|
| `id`      | integer  | Yes      | The ID of the order to be fetched. |
| `userId`  | integer  | Yes      | The ID of the user making the request. |

---

 Example Request
```http
GET /api/orders/detail.php?id=101&userId=1
Authorization: Bearer <JWT Token>
Example Response (Success - 200 OK)
{
  "success": true,
  "order": {
    "id": 101,
    "userId": 1,
    "orderDate": "2025-03-24T10:30:00",
    "status": "pending",
    "totalAmount": 120,
    "items": [
      { "productId": 1, "quantity": 2, "price": 40, "name": "Handmade Necklace" },
      { "productId": 2, "quantity": 1, "price": 40, "name": "Wooden Sculpture" }
    ]
  }
}
