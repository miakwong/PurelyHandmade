<?php
/**
 * 用户控制器
 * 处理用户相关的API请求，包括注册、登录、个人资料管理等
 */
require_once __DIR__ . '/models.php';
require_once __DIR__ . '/Database.php';

class UserController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * 用户注册
     */
    public function register() {
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['username']) || !isset($data['password']) || 
            !isset($data['email']) || !isset($data['firstName']) || 
            !isset($data['lastName'])) {
            sendApiResponse("Missing required fields", false, 400);
            return;
        }
        
        // 检查用户名是否已存在
        $existingUser = $this->db->fetchOne("SELECT id FROM users WHERE username = ?", [$data['username']]);
        if ($existingUser) {
            sendApiResponse("Username already exists", false, 409);
            return;
        }
        
        // 检查邮箱是否已存在
        $existingEmail = $this->db->fetchOne("SELECT id FROM users WHERE email = ?", [$data['email']]);
        if ($existingEmail) {
            sendApiResponse("Email already exists", false, 409);
            return;
        }
        
        // 密码哈希
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // 准备用户数据
        $userData = [
            'username' => $data['username'],
            'password_hash' => $passwordHash,
            'email' => $data['email'],
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'role' => 'user',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 可选字段
        if (isset($data['birthday'])) {
            $userData['birthday'] = $data['birthday'];
        }
        
        if (isset($data['gender'])) {
            $userData['gender'] = $data['gender'];
        }
        
        if (isset($data['avatar'])) {
            $userData['avatar'] = $data['avatar'];
        }
        
        // 插入用户
        $userId = $this->db->insert("users", $userData);
        
        if ($userId) {
            // 获取新用户信息（不包含密码哈希）
            $user = $this->db->fetchOne("
                SELECT id, username, email, first_name, last_name, birthday, gender, avatar, role, created_at, updated_at
                FROM users WHERE id = ?
            ", [$userId]);
            
            // 开始会话并设置用户ID
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            
            // 格式化用户数据
            $formattedUser = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'birthday' => $user['birthday'],
                'gender' => $user['gender'],
                'avatar' => $user['avatar'],
                'role' => $user['role'],
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ];
            
            sendApiResponse($formattedUser, true, 201);
        } else {
            sendApiResponse("Failed to register user", false, 500);
        }
    }
    
    /**
     * 用户登录
     */
    public function login() {
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['username']) || !isset($data['password'])) {
            sendApiResponse("Username and password are required", false, 400);
            return;
        }
        
        // 查找用户
        $user = $this->db->fetchOne("
            SELECT id, username, password_hash, email, first_name, last_name, birthday, gender, avatar, role, created_at, updated_at
            FROM users WHERE username = ?
        ", [$data['username']]);
        
        // 检查用户是否存在并验证密码
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            sendApiResponse("Invalid username or password", false, 401);
            return;
        }
        
        // 开始会话并设置用户ID
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user['id'];
        
        // 格式化用户数据（不包含密码哈希）
        $formattedUser = [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'birthday' => $user['birthday'],
            'gender' => $user['gender'],
            'avatar' => $user['avatar'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at']
        ];
        
        sendApiResponse($formattedUser);
    }
    
    /**
     * 用户登出
     */
    public function logout() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 销毁会话
        session_unset();
        session_destroy();
        
        sendApiResponse("Logout successful");
    }
    
    /**
     * 获取当前登录用户信息
     */
    public function getCurrentUser() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            sendApiResponse("Not logged in", false, 401);
            return;
        }
        
        // 获取用户信息
        $user = $this->db->fetchOne("
            SELECT id, username, email, first_name, last_name, birthday, gender, avatar, role, created_at, updated_at
            FROM users WHERE id = ?
        ", [$_SESSION['user_id']]);
        
        if (!$user) {
            // 会话存在但用户不存在，清除会话
            session_unset();
            session_destroy();
            sendApiResponse("User not found", false, 404);
            return;
        }
        
        // 格式化用户数据
        $formattedUser = [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'birthday' => $user['birthday'],
            'gender' => $user['gender'],
            'avatar' => $user['avatar'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at']
        ];
        
        sendApiResponse($formattedUser);
    }
    
    /**
     * 更新用户个人资料
     */
    public function updateProfile() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            sendApiResponse("Not logged in", false, 401);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            sendApiResponse("Invalid request data", false, 400);
            return;
        }
        
        // 准备更新数据
        $updateData = [
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // 可更新字段
        $allowedFields = [
            'email' => 'email',
            'firstName' => 'first_name',
            'lastName' => 'last_name',
            'birthday' => 'birthday',
            'gender' => 'gender',
            'avatar' => 'avatar'
        ];
        
        foreach ($allowedFields as $clientField => $dbField) {
            if (isset($data[$clientField])) {
                $updateData[$dbField] = $data[$clientField];
            }
        }
        
        // 如果更新邮箱，检查是否已存在
        if (isset($updateData['email'])) {
            $existingEmail = $this->db->fetchOne("
                SELECT id FROM users WHERE email = ? AND id != ?
            ", [$updateData['email'], $_SESSION['user_id']]);
            
            if ($existingEmail) {
                sendApiResponse("Email already exists", false, 409);
                return;
            }
        }
        
        // 更新用户
        $success = $this->db->update("users", $updateData, "id = ?", [$_SESSION['user_id']]);
        
        if ($success) {
            // 获取更新后的用户信息
            $user = $this->db->fetchOne("
                SELECT id, username, email, first_name, last_name, birthday, gender, avatar, role, created_at, updated_at
                FROM users WHERE id = ?
            ", [$_SESSION['user_id']]);
            
            // 格式化用户数据
            $formattedUser = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'birthday' => $user['birthday'],
                'gender' => $user['gender'],
                'avatar' => $user['avatar'],
                'role' => $user['role'],
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ];
            
            sendApiResponse($formattedUser);
        } else {
            sendApiResponse("Failed to update profile", false, 500);
        }
    }
    
    /**
     * 更改密码
     */
    public function changePassword() {
        // 开始会话（如果未开始）
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // 检查用户是否已登录
        if (!isset($_SESSION['user_id'])) {
            sendApiResponse("Not logged in", false, 401);
            return;
        }
        
        // 获取POST数据
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 验证必填字段
        if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
            sendApiResponse("Current password and new password are required", false, 400);
            return;
        }
        
        // 获取用户当前密码哈希
        $user = $this->db->fetchOne("SELECT password_hash FROM users WHERE id = ?", [$_SESSION['user_id']]);
        
        // 验证当前密码
        if (!password_verify($data['currentPassword'], $user['password_hash'])) {
            sendApiResponse("Current password is incorrect", false, 401);
            return;
        }
        
        // 生成新密码哈希
        $newPasswordHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
        
        // 更新密码
        $success = $this->db->update(
            "users",
            [
                'password_hash' => $newPasswordHash,
                'updated_at' => date('Y-m-d H:i:s')
            ],
            "id = ?",
            [$_SESSION['user_id']]
        );
        
        if ($success) {
            sendApiResponse("Password changed successfully");
        } else {
            sendApiResponse("Failed to change password", false, 500);
        }
    }
} 