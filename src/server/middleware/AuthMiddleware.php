<?php
namespace Middleware;

use Utils\Auth;
use Utils\Response;
use Utils\Request;

class AuthMiddleware {
    public function handle() {
        $request = new Request();
        $response = new Response();
        $auth = new Auth();
        
        // Get the token from the Authorization header
        $token = $request->getBearerToken();
        
        if (!$token) {
            $response->unauthorized('Authentication token is missing');
            exit;
        }
        
        // Validate the token
        if (!$auth->validateToken($token)) {
            $response->unauthorized('Invalid or expired authentication token');
            exit;
        }
        
        // Get the user ID from the token
        $userId = $auth->getUserIdFromToken($token);
        
        if (!$userId) {
            $response->unauthorized('Invalid authentication token');
            exit;
        }
        
        // Store the user ID in the request for later use
        $_REQUEST['userId'] = $userId;
        
        return true;
    }
} 