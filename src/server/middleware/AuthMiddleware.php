<?php
namespace Middleware;

use Utils\Auth;
use Utils\Response;
use Utils\Request;
use Models\User;
use Utils\Database;

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
        
        // Get user data from database
        $db = new Database();
        $db->connect();
        $user = new User($db);
        $userData = $user->findById($userId);
        
        if (!$userData) {
            $response->unauthorized('User not found');
            exit;
        }
        
        // 添加用户角色和管理员信息到请求
        $_REQUEST['isAdmin'] = (bool)$userData['isAdmin'];
        $_REQUEST['userRole'] = $userData['role'] ?? 'user';
        
        // Update last login time
        $user->updateLoginTime($userId);
        
        return $userData;
    }
} 