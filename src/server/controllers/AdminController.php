<?php
/**
 * 管理控制器
 * 处理管理工具和管理员功能
 */
class AdminController {
    /**
     * 构造函数 - 验证管理员权限
     */
    public function __construct() {
        // 检查用户是否已登录并具有管理员权限
        if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || 
            !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
            header('Location: /');
            exit;
        }
    }
    
    /**
     * 查看管理工具页面
     */
    public function viewTools() {
        // 在实际应用中，这里可能需要获取一些数据供管理页面使用
        // 例如用户列表、产品列表等
        
        // 简单地包含管理工具HTML页面
        include ROOT_PATH . '/admin-tools.html';
    }
    
    /**
     * 获取用户列表（示例API方法）
     */
    public function getUsers() {
        // 在实际应用中，应该从数据库获取用户列表
        // 这里返回一些示例数据
        $users = [
            ['id' => 1, 'username' => 'admin', 'email' => 'admin@example.com', 'role' => 'Administrator'],
            ['id' => 2, 'username' => 'user1', 'email' => 'user1@example.com', 'role' => 'User'],
            ['id' => 3, 'username' => 'user2', 'email' => 'user2@example.com', 'role' => 'User']
        ];
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'users' => $users]);
        exit;
    }
    
    /**
     * 获取系统统计数据（示例API方法）
     */
    public function getStats() {
        // 在实际应用中，应该从数据库获取真实统计数据
        // 这里返回一些示例数据
        $stats = [
            'total_users' => 3,
            'active_users' => 2,
            'products' => 150,
            'orders' => 27,
            'revenue' => 4250.75
        ];
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'stats' => $stats]);
        exit;
    }
} 