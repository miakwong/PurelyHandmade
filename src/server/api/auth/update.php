<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AuthController;
use Utils\Request;
use Utils\Response;
use Middleware\CorsMiddleware;
use Utils\Logger;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept POST requests
if (getRequestMethod() !== 'POST') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    $request = new Request();
    $response = new Response();
    $authController = new AuthController();
    $logger = new Logger('auth.log');
    
    // Get update data
    $data = $request->getJson();
    $userId = $data['userId'] ?? null;
    
    if (!$userId) {
        $response->error('User ID is required');
        exit;
    }
    
    // Remove userId from data before updating
    unset($data['userId']);
    
    // Check if this is a password update request
    if (isset($data['currentPassword']) && isset($data['newPassword'])) {
        $result = $authController->changePassword(
            $userId,
            $data['currentPassword'],
            $data['newPassword']
        );
    } else {
        // Regular profile update
        $result = $authController->updateProfile($userId, $data);
    }
    
    if ($result['success']) {
        $logger->info('Profile updated successfully', [
            'userId' => $userId,
            'updateType' => isset($data['currentPassword']) ? 'password' : 'profile'
        ]);
        $response->success($result['user'] ?? null, $result['message']);
    } else {
        if (isset($result['errors'])) {
            $response->validationError($result['errors']);
        } else {
            $response->error($result['message']);
        }
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Logger('auth.log');
    $logger->error('Profile update error', Logger::formatException($e));
} 