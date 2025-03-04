<?php
/**
 * 认证控制器
 * 处理用户登录、注册和认证相关的功能
 */
class AuthController {
    /**
     * 处理用户登录请求
     */
    public function login() {
        // 获取和验证POST数据
        $identifier = isset($_POST['loginIdentifier']) ? trim($_POST['loginIdentifier']) : '';
        $password = isset($_POST['loginPassword']) ? $_POST['loginPassword'] : '';
        
        // 简单的验证（实际应用中应连接数据库进行验证）
        if (empty($identifier) || empty($password)) {
            $this->respondWithError("用户名和密码不能为空");
            return;
        }
        
        // 这里仅作示例，应当改为查询数据库
        // 假设admin/admin123是有效的用户名和密码
        if ($identifier === 'admin' && $password === 'admin123') {
            // 设置会话数据
            $_SESSION['user_id'] = 1;
            $_SESSION['username'] = 'admin';
            $_SESSION['is_admin'] = true;
            $_SESSION['logged_in'] = true;
            
            // 重定向到适当的页面
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'redirect' => '/admin-tools.html']);
            exit;
        } else {
            $this->respondWithError("用户名或密码不正确");
        }
    }
    
    /**
     * 处理用户登出请求
     */
    public function logout() {
        // 清除会话
        session_unset();
        session_destroy();
        
        // 重定向到登录页面
        header('Location: /');
        exit;
    }
    
    /**
     * 返回错误信息
     */
    private function respondWithError($message) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }
} 