<?php
namespace Middleware;

use Models\User;
use Utils\Response;
use Utils\Database;

class AdminMiddleware {
    public function handle() {
        $response = new Response();
        
        // Check if the user is authenticated
        $authMiddleware = new AuthMiddleware();
        $authMiddleware->handle();
        
        // Get the user ID
        $userId = $_REQUEST['userId'] ?? null;
        
        if (!$userId) {
            $response->unauthorized('Authentication required');
            exit;
        }
        
        // Check if the user is an admin
        $db = new Database();
        $db->connect();
        
        $user = new User($db);
        $userData = $user->findById($userId);
        
        if (!$userData || $userData['isAdmin'] != 1) {
            $response->forbidden('Admin access required');
            exit;
        }
        
        return true;
    }
} 