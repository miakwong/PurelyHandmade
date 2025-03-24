<?php
namespace Middleware;

use Models\User;
use Utils\Response;
use Utils\Database;

class AdminMiddleware {
    public function handle() {
        $response = new Response();
        
        // Check if the user is authenticated and get user data
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->handle();
        
        // Check if the user is an admin
        if (!$userData || $userData['isAdmin'] != 1) {
            $response->forbidden('Admin access required');
            exit;
        }
        
        return $userData;
    }
} 