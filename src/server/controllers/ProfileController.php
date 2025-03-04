<?php
/**
 * 个人资料控制器
 * 处理用户个人资料查看和更新
 */
class ProfileController {
    /**
     * 查看用户个人资料
     */
    public function view() {
        // 检查用户是否已登录
        if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
            header('Location: /');
            exit;
        }
        
        // 获取用户数据（实际应用中应该从数据库获取）
        $user = [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => 'admin@example.com',
            'full_name' => 'Administrator',
            'role' => $_SESSION['is_admin'] ? 'Administrator' : 'User',
            'joined_date' => '2023-01-01'
        ];
        
        // 返回JSON数据或加载视图
        if (isset($_GET['format']) && $_GET['format'] === 'json') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'user' => $user]);
            exit;
        } else {
            // 在实际应用中，这里可以加载一个视图模板
            // 这里简单地包含HTML文件
            include ROOT_PATH . '/profile.html';
        }
    }
    
    /**
     * 更新用户个人资料
     */
    public function update() {
        // 检查用户是否已登录
        if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => '您必须登录才能执行此操作']);
            exit;
        }
        
        // 获取并验证POST数据
        $full_name = isset($_POST['full_name']) ? trim($_POST['full_name']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        
        // 简单验证
        if (empty($full_name) || empty($email)) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => '所有字段都是必填的']);
            exit;
        }
        
        // 这里应该更新数据库中的用户数据
        // 由于这只是一个示例，我们只返回成功消息
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => '个人资料已成功更新']);
        exit;
    }
} 