<?php
namespace Middleware;

use Utils\Auth;
use Utils\Logger;
use Utils\Response;

class AdminMiddleware {
    private $auth;
    private $logger;

    public function __construct() {
        $this->auth = new Auth();
        $this->logger = new Logger();
    }

    /**
     * 验证当前用户是否为管理员
     * @return bool
     */
    public function isAdmin() {
        try {
            // 获取当前用户信息
            $user = $this->auth->getCurrentUser();
            
            if (!$user) {
                $this->logger->warning('Admin check failed: No user found');
                return false;
            }

            // 检查用户是否为管理员
            if (!isset($user['isAdmin']) || !$user['isAdmin']) {
                $this->logger->warning('Admin check failed: User is not admin', [
                    'user_id' => $user['id']
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Admin check failed', Logger::formatException($e));
            return false;
        }
    }

    /**
     * 验证请求中的管理员权限
     * @return bool
     */
    public function validateAdminRequest() {
        try {
            // 检查请求头中是否包含Authorization
            $headers = getallheaders();
            if (!isset($headers['Authorization'])) {
                $this->logger->warning('Admin request validation failed: No Authorization header');
                return false;
            }

            // 验证token
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            if (!$this->auth->validateToken($token)) {
                $this->logger->warning('Admin request validation failed: Invalid token');
                return false;
            }

            // 获取用户ID
            $userId = $this->auth->getUserIdFromToken($token);
            if (!$userId) {
                $this->logger->warning('Admin request validation failed: No user ID in token');
                return false;
            }

            // 检查用户是否为管理员
            return $this->isAdmin();
        } catch (\Exception $e) {
            $this->logger->error('Admin request validation failed', Logger::formatException($e));
            return false;
        }
    }

    /**
     * 处理管理员权限验证
     * @return array|null
     */
    public function handle() {
        if (!$this->validateAdminRequest()) {
            $response = new Response();
            $response->error('Unauthorized: Admin access required', 403);
            exit;
        }

        // 获取当前用户信息
        return $this->auth->getCurrentUser();
    }
}