<?php
namespace Controllers;

use Models\User;
use Utils\Auth;
use Utils\Database;
use Utils\Validator;
use Utils\Logger;

class AuthController {
    private $db;
    private $user;
    private $auth;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->user = new User($this->db);
        $this->auth = new Auth();
        $this->logger = new Logger('auth.log');
    }
    
    public function register($data) {
        // Validate input
        $validator = new Validator($data, [
            'email' => 'required|email',
            'password' => 'required|min:8',
            'username' => 'required|min:3'
        ]);
        
        if (!$validator->validate()) {
            return [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->getErrors()
            ];
        }
        
        // Check if email already exists
        $existingUser = $this->user->findByEmail($data['email']);
        if ($existingUser) {
            return [
                'success' => false,
                'message' => 'Email already registered'
            ];
        }
        
        // Check if username already exists
        if (isset($data['username'])) {
            $existingUsername = $this->user->findByUsername($data['username']);
            if ($existingUsername) {
                return [
                    'success' => false,
                    'message' => 'Username already taken'
                ];
            }
        }
        
        try {
            // Create user
            $userId = $this->user->create($data);
            
            // 确保userId是有效的
            if (!$userId || !is_numeric($userId)) {
                $this->logger->error('Registration failed', ['error' => 'Invalid user ID returned', 'userId' => $userId]);
                return [
                    'success' => false,
                    'message' => 'Registration failed: Could not create user'
                ];
            }
            
            // 确保转换为整数
            $userId = intval($userId);
            
            // Get the created user
            $user = $this->user->findById($userId);
            
            if (!$user) {
                $this->logger->error('Registration failed', ['error' => 'User not found after creation', 'userId' => $userId]);
                return [
                    'success' => false,
                    'message' => 'Registration failed: User created but could not be retrieved'
                ];
            }
            
            // Remove sensitive data
            unset($user['password']);
            
            $this->logger->info('User registered', ['id' => $userId, 'email' => $data['email']]);
            
            return [
                'success' => true,
                'message' => 'Registration successful',
                'user' => $user
            ];
        } catch (\Exception $e) {
            $this->logger->error('Registration failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ];
        }
    }
    
    public function login($identifier, $password) {
        try {
             // 先检查是否是邮箱
            if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
                $user = $this->user->findByEmail($identifier);
            } else {
                $user = $this->user->findByUsername($identifier);
            }
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid username/email or password'
                ];
            }
            
            // Check if user is active
            if ($user['status'] !== 'active') {
                return [
                    'success' => false,
                    'message' => 'Account is inactive'
                ];
            }
            
            // Verify password
            if (!$this->user->verifyPassword($password, $user['password_hash'])) {
                error_log("❌ login() 密码错误");
                return [
                    'success' => false,
                    'message' => 'Invalid email or password'
                ];
            }
            
            // Generate JWT token
            $token = $this->auth->generateToken($user['id']);
            error_log("✅ login() 生成 JWT: " . $token);
            
            // Update last login time
            $this->user->updateLoginTime($user['id']);
            error_log("✅ login() 更新最后登录时间: " . $user['id']);
            
            // Remove sensitive data
            unset($user['password_hash']);
            
            $this->logger->info('User logged in', ['id' => $user['id'], 'email' => $identifier]);
            
            return [
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ];
        } catch (\Exception $e) {
            $this->logger->error('Login failed', Logger::formatException($e));
            error_log("❌ login() 发生异常: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ];
        }
    }
    
    public function getProfile($userId) {
        try {
            $user = $this->user->findById($userId);
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // Remove sensitive data
            unset($user['password']);
            
            return [
                'success' => true,
                'user' => $user
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get profile failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get profile: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateProfile($userId, $data) {
        try {
            // Validate input
            $validator = new Validator($data, [
                'email' => 'email',
                'username' => 'min:3'
            ]);
            
            if (!$validator->validate()) {
                return [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->getErrors()
                ];
            }
            
            // Check if user exists
            $user = $this->user->findById($userId);
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // Check if email is being changed and already exists
            if (isset($data['email']) && $data['email'] !== $user['email']) {
                $existingUser = $this->user->findByEmail($data['email']);
                if ($existingUser) {
                    return [
                        'success' => false,
                        'message' => 'Email already registered'
                    ];
                }
            }
            
            // Check if username is being changed and already exists
            if (isset($data['username']) && $data['username'] !== $user['username']) {
                $existingUsername = $this->user->findByUsername($data['username']);
                if ($existingUsername) {
                    return [
                        'success' => false,
                        'message' => 'Username already taken'
                    ];
                }
            }
            
            // Update user
            $this->user->update($userId, $data);
            
            // Get updated user
            $updatedUser = $this->user->findById($userId);
            
            // Remove sensitive data
            unset($updatedUser['password']);
            
            $this->logger->info('Profile updated', ['id' => $userId]);
            
            return [
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $updatedUser
            ];
        } catch (\Exception $e) {
            $this->logger->error('Update profile failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ];
        }
    }
    
    public function changePassword($userId, $currentPassword, $newPassword) {
        try {
            // Check if user exists
            $user = $this->user->findById($userId);
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // Verify current password
            if (!$this->user->verifyPassword($currentPassword, $user['password'])) {
                return [
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ];
            }
            
            // Validate new password
            if (strlen($newPassword) < 8) {
                return [
                    'success' => false,
                    'message' => 'New password must be at least 8 characters'
                ];
            }
            
            // Update password
            $this->user->update($userId, [
                'password' => $newPassword
            ]);
            
            $this->logger->info('Password changed', ['id' => $userId]);
            
            return [
                'success' => true,
                'message' => 'Password changed successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Change password failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to change password: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Find a user by email
     * 
     * @param string $email
     * @return array|null User data or null if not found
     */
    public function findUserByEmail($email) {
        try {
            return $this->user->findByEmail($email);
        } catch (\Exception $e) {
            $this->logger->error('Find user by email failed', Logger::formatException($e));
            return null;
        }
    }
    
    /**
     * Find a user by username
     * 
     * @param string $username
     * @return array|null User data or null if not found
     */
    public function findUserByUsername($username) {
        try {
            return $this->user->findByUsername($username);
        } catch (\Exception $e) {
            $this->logger->error('Find user by username failed', Logger::formatException($e));
            return null;
        }
    }
} 