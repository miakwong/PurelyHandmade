<?php
namespace Controllers;

use Models\User;
use Models\Product;
use Models\Order;
use Models\OrderItem;
use Utils\Database;
use Utils\Logger;
use Utils\Response;

class AdminController {
    private $db;
    public $user;
    public $product;
    public $order;
    public $orderItem;
    private $logger;
    private $response;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->user = new User($this->db);
        $this->product = new Product($this->db);
        $this->order = new Order($this->db);
        $this->orderItem = new OrderItem($this->db);
        $this->logger = new Logger('admin.log');
        $this->response = new Response();
    }
    
    public function getUsers($filters = [], $page = 1, $limit = 20) {
        $limit = (int) $limit; // Ensure limit is an integer to prevent SQL injection
        $page = (int) $page; // Ensure page is an integer to prevent SQL injection
        $offset = ($page - 1) * $limit;
        $filters['limit'] = $limit;
        $filters['offset'] = $offset;
        $filters['order'] = 'createdAt DESC';   

        try {
            return [
                'success' => true,
                'data' => $this->user->getAll($filters, $page, $limit)
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin get users failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get users: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateUser($id, $data) {
        $id = (int) $id; // Ensure ID is an integer to prevent SQL injection
        $data = array_map('trim', $data); // Trim all input data
        $data = array_map('htmlspecialchars', $data); // Sanitize input data
        $data['updatedAt'] = date('Y-m-d H:i:s'); // Update timestamp
        $data['isAdmin'] = isset($data['isAdmin']) ? (int) $data['isAdmin'] : 0; // Ensure isAdmin is an integer
        $data['status'] = isset($data['status']) ? (int) $data['status'] : 0; // Ensure status is an integer
        $data['role'] = isset($data['role']) ? htmlspecialchars($data['role']) : 'user'; // Sanitize role input
        $data['username'] = isset($data['username']) ? htmlspecialchars($data['username']) : ''; // Sanitize username input
        $data['email'] = isset($data['email']) ? htmlspecialchars($data['email']) : ''; // Sanitize email input
        $data['password'] = isset($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null; // Hash password if provided
        $data['password'] = $data['password'] ? $data['password'] : null; // Set password to null if not provided
        $data['updatedAt'] = date('Y-m-d H:i:s'); // Update timestamp
        $data['isAdmin'] = isset($data['isAdmin']) ? (int) $data['isAdmin'] : 0; // Ensure isAdmin is an integer
        $data['status'] = isset($data['status']) ? (int) $data['status'] : 0; // Ensure status is an integer
        $data['role'] = isset($data['role']) ? htmlspecialchars($data['role']) : 'user'; // Sanitize role input
        try {
            // Check if user exists
            $existingUser = $this->user->findById($id);
            if (!$existingUser) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // Update user
            $this->user->update($id, $data);
            
            // Get updated user
            $updatedUser = $this->user->findById($id);
            
            // Remove sensitive data
            unset($updatedUser['password']);
            
            $this->logger->info('Admin updated user', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $updatedUser
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin update user failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 获取单个用户详情
     * 
     * @param int $id 用户ID
     * @return array 结果数组
     */
    public function getUserById($id) {
        $id = (int) $id; // Ensure ID is an integer to prevent SQL injection
        try {
            // 查找用户
            $user = $this->user->findById($id);
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // 移除敏感信息
            unset($user['password']);
            
            $this->logger->info('Admin fetched user detail', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'User detail retrieved successfully',
                'data' => $user
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin get user detail failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to retrieve user detail: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 删除用户
     * 
     * @param int $id 用户ID
     * @return array 结果数组
     */
    public function deleteUser($id) {
        $id = (int) $id; // Ensure ID is an integer to prevent SQL injection

        try {
            // 检查用户是否存在
            $existingUser = $this->user->findById($id);
            if (!$existingUser) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
            
            // 检查是否为最后一个管理员
            if ($existingUser['isAdmin'] == 1) {
                // 获取管理员数量
                $adminCountSql = "SELECT COUNT(*) as count FROM {$this->user->table} WHERE isAdmin = 1";
                $result = $this->db->fetch($adminCountSql);
                $adminCount = $result['count'] ?? 0;
                
                if ($adminCount <= 1) {
                    return [
                        'success' => false,
                        'message' => 'Cannot delete the last administrator'
                    ];
                }
            }
            
            // 删除用户
            $this->user->delete($id);
            
            $this->logger->info('Admin deleted user', ['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'User deleted successfully'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin delete user failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 获取仪表盘统计数据
     * 
     * @param string $period 时间段 (all, month, week, day)
     * @return array 统计数据
     */
    public function getDashboardStatistics($period = 'all') {
        $period = strtolower($period); // Convert to lowercase for consistency
        $validPeriods = ['all', 'month', 'week', 'day'];

        try {
            $userSql = "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM {$this->user->table}";
            $userStats = $this->db->fetch($userSql);

            $this->logger->info('Step 1: Fetching user stats');
            $userStats = $this->db->fetch($userSql);

            $productSql = "SELECT COUNT(*) as total, SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured FROM {$this->product->table}";
            $productStats = $this->db->fetch($productSql);

            $this->logger->info('Step 2: Fetching product stats');
            $productStats = $this->db->fetch($productSql);

            $orderStats = $this->order->getOrderStats();

            $this->logger->info('Step 3: Fetching order stats');
            $orderStats = $this->order->getOrderStats();

            $monthlySql = "SELECT 
                              DATE_FORMAT(orderDate, '%Y-%m') as month, 
                              SUM(totalAmount) as revenue
                          FROM {$this->order->table} 
                          WHERE status != 'cancelled'
                          GROUP BY month
                          ORDER BY month DESC
                          LIMIT 12";
            $monthlyRevenue = $this->db->fetchAll($monthlySql);

            $this->logger->info('Step 4: Fetching monthly revenue');
            $monthlyRevenue = $this->db->fetchAll($monthlySql);

            $topProducts = $this->orderItem->getTopSellingProducts(5);
            $this->logger->info('Step 5: Fetching top products');
            $topProducts = $this->orderItem->getTopSellingProducts(5);  

            $stats = [
                'total_users' => $this->getTotalUsers(),
                'total_orders' => $this->getTotalOrders(),
                'total_products' => $this->getTotalProducts(),
                'recent_orders' => $this->getRecentOrders(),
                'recent_users' => $this->getRecentUsers(),
                'users' => $userStats,
                'products' => $productStats,
                'orders' => [
                    'total' => $orderStats['total'] ?? 0,
                    'pending' => $orderStats['pending'] ?? 0,
                    'processing' => $orderStats['processing'] ?? 0,
                    'shipped' => $orderStats['shipped'] ?? 0,
                    'delivered' => $orderStats['delivered'] ?? 0,
                    'cancelled' => $orderStats['cancelled'] ?? 0
                ],
                'revenue' => [
                    'total' => $orderStats['revenue'] ?? 0,
                    'monthly' => $monthlyRevenue
                ],
                'topSellingProducts' => $topProducts
            ];

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error getting dashboard statistics', Logger::formatException($e));
            return [
                'success' => false,
                'message' => '获取统计信息失败'
            ];
        }
    }
    
    /**
     * 获取报告数据
     * 
     * @param string $type 报告类型 (sales, products, customers)
     * @param string $period 时间段 (monthly, yearly)
     * @param string|null $startDate 开始日期
     * @param string|null $endDate 结束日期
     * @return array 报告数据
     */
    public function getReportData($type, $period = 'monthly', $startDate = null, $endDate = null) {
        $type = strtolower($type); // Convert to lowercase for consistency
        $validTypes = ['sales', 'products', 'customers'];
        $validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];

        try {
            // Set default dates if not provided
            if ($startDate === null) {
                $startDate = date('Y-m-d', strtotime('-1 year'));
            }
            
            if ($endDate === null) {
                $endDate = date('Y-m-d');
            }
            
            // Determine the date format based on period
            $dateFormat = '%Y-%m-%d';
            $groupBy = 'date';
            
            if ($period === 'monthly') {
                $dateFormat = '%Y-%m';
                $groupBy = 'month';
            } elseif ($period === 'yearly') {
                $dateFormat = '%Y';
                $groupBy = 'year';
            }
            
            // Prepare the report data based on type
            $data = [];
            $summary = [];
            
            if ($type === 'sales') {
                // Sales report
                $sql = "SELECT 
                            DATE_FORMAT(o.orderDate, '$dateFormat') as $groupBy,
                            COUNT(DISTINCT o.id) as order_count,
                            SUM(o.totalAmount) as revenue,
                            SUM(oi.quantity) as items_sold
                        FROM {$this->order->table} o
                        JOIN {$this->orderItem->table} oi ON o.id = oi.orderId
                        WHERE o.status != 'cancelled'
                        AND o.orderDate BETWEEN :startDate AND :endDate
                        GROUP BY $groupBy
                        ORDER BY $groupBy";
                
                $data = $this->db->fetchAll($sql, [
                    'startDate' => $startDate,
                    'endDate' => $endDate
                ]);
                
                // Calculate summary
                $summaryTotals = [
                    'order_count' => 0,
                    'revenue' => 0,
                    'items_sold' => 0
                ];
                
                foreach ($data as $row) {
                    $summaryTotals['order_count'] += $row['order_count'];
                    $summaryTotals['revenue'] += $row['revenue'];
                    $summaryTotals['items_sold'] += $row['items_sold'];
                }
                
                $summary = $summaryTotals;
            } elseif ($type === 'products') {
                // Product performance report
                $sql = "SELECT 
                            p.id,
                            p.name,
                            p.sku,
                            SUM(oi.quantity) as quantity_sold,
                            SUM(oi.quantity * oi.price) as revenue,
                            c.name as category,
                            d.name as designer
                        FROM {$this->product->table} p
                        LEFT JOIN {$this->orderItem->table} oi ON p.id = oi.productId
                        LEFT JOIN {$this->order->table} o ON oi.orderId = o.id
                        LEFT JOIN Category c ON p.categoryId = c.id
                        LEFT JOIN Designer d ON p.designerId = d.id
                        WHERE (o.orderDate BETWEEN :startDate AND :endDate OR o.id IS NULL)
                        AND (o.status != 'cancelled' OR o.status IS NULL)
                        GROUP BY p.id
                        ORDER BY quantity_sold DESC";
                
                $data = $this->db->fetchAll($sql, [
                    'startDate' => $startDate,
                    'endDate' => $endDate
                ]);
                
                // Calculate summary
                $summaryTotals = [
                    'total_products' => count($data),
                    'total_sold' => 0,
                    'total_revenue' => 0
                ];
                
                foreach ($data as $row) {
                    $summaryTotals['total_sold'] += $row['quantity_sold'] ?? 0;
                    $summaryTotals['total_revenue'] += $row['revenue'] ?? 0;
                }
                
                $summary = $summaryTotals;
            } elseif ($type === 'customers') {
                // Customer report
                $sql = "SELECT 
                            u.id,
                            u.username,
                            u.email,
                            COUNT(DISTINCT o.id) as order_count,
                            SUM(o.totalAmount) as total_spent,
                            MAX(o.orderDate) as last_order_date
                        FROM {$this->user->table} u
                        LEFT JOIN {$this->order->table} o ON u.id = o.userId
                        WHERE (o.orderDate BETWEEN :startDate AND :endDate OR o.id IS NULL)
                        AND (o.status != 'cancelled' OR o.status IS NULL)
                        GROUP BY u.id
                        ORDER BY total_spent DESC";
                
                $data = $this->db->fetchAll($sql, [
                    'startDate' => $startDate,
                    'endDate' => $endDate
                ]);
                
                // Calculate summary
                $summaryTotals = [
                    'total_customers' => count($data),
                    'total_orders' => 0,
                    'total_revenue' => 0
                ];
                
                $customersWithOrders = 0;
                
                foreach ($data as $row) {
                    $summaryTotals['total_orders'] += $row['order_count'] ?? 0;
                    $summaryTotals['total_revenue'] += $row['total_spent'] ?? 0;
                    
                    if (($row['order_count'] ?? 0) > 0) {
                        $customersWithOrders++;
                    }
                }
                
                $summary = $summaryTotals;
                $summary['customers_with_orders'] = $customersWithOrders;
            }
            
            return [
                'success' => true,
                'report' => [
                    'type' => $type,
                    'period' => $period,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'data' => $data,
                    'summary' => $summary
                ]
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin get report data failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage()
            ];
        }
    }
    
    public function getSettings($group = null) {
        $group = $group ? htmlspecialchars($group) : null; // Sanitize group input
        $group = strtolower($group); // Convert to lowercase for consistency
        $validGroups = ['general', 'payment', 'shipping', 'email', 'social', 'seo'];
        if ($group && !in_array($group, $validGroups)) {
            return [
                'success' => false,
                'message' => 'Invalid group specified'
            ];
        }
        // Fetch settings from the database
        try {
            $sql = "SELECT * FROM Setting";
            $params = [];
            
            if ($group) {
                $sql .= " WHERE `group` = :group";
                $params['group'] = $group;
            }
            
            $settings = $this->db->fetchAll($sql, $params);
            
            // Convert settings to key-value format grouped by their group
            $settingsGrouped = [];
            
            foreach ($settings as $setting) {
                $group = $setting['group'];
                
                if (!isset($settingsGrouped[$group])) {
                    $settingsGrouped[$group] = [];
                }
                
                $settingsGrouped[$group][$setting['key']] = [
                    'id' => $setting['id'],
                    'key' => $setting['key'],
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'description' => $setting['description']
                ];
            }
            
            return [
                'success' => true,
                'settings' => $settingsGrouped
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin get settings failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get settings: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateSettings($data) {
        // Validate input data
        if (!is_array($data) || empty($data)) {
            return [
                'success' => false,
                'message' => 'Invalid input data'
            ];
        }
        // Sanitize input data
        $data = array_map('trim', $data); // Trim all input data
        $data = array_map('htmlspecialchars', $data); // Sanitize input data
        try {
            $this->db->beginTransaction();
            
            $updatedSettings = [];
            
            foreach ($data as $key => $value) {
                // Skip if the key is not valid
                if (!is_string($key)) {
                    continue;
                }
                
                // Find if the setting exists
                $sql = "SELECT id FROM Setting WHERE `key` = :key";
                $setting = $this->db->fetch($sql, ['key' => $key]);
                
                if ($setting) {
                    // Update the setting
                    $updateSql = "UPDATE Setting SET `value` = :value, `updated_at` = NOW() WHERE id = :id";
                    $this->db->execute($updateSql, [
                        'id' => $setting['id'],
                        'value' => $value
                    ]);
                } else {
                    // Skip creation of non-existent settings for security reasons
                    $this->logger->warning('Attempted to update non-existent setting', ['key' => $key]);
                    continue;
                }
                
                $updatedSettings[$key] = $value;
            }
            
            $this->db->commit();
            
            // Get all updated settings
            $result = $this->getSettings();
            
            $this->logger->info('Admin updated settings', ['count' => count($updatedSettings)]);
            
            return [
                'success' => true,
                'message' => 'Settings updated successfully',
                'settings' => $result['settings']
            ];
        } catch (\Exception $e) {
            $this->db->rollback();
            $this->logger->error('Admin update settings failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ];
        }
    }
    

    /**
     * 获取所有用户
     * @param array $filters 过滤条件
     * @return array
     */
    public function getAllUsers($filters = []) {
        try {
            $sql = "SELECT id, username, email, role, isAdmin, status, createdAt 
                    FROM {$this->user->table} 
                    WHERE 1=1";
            
            if (!empty($filters['status'])) {
                $sql .= " AND status = :status";
            }
            
            if (!empty($filters['role'])) {
                $sql .= " AND role = :role";
            }
            
            $sql .= " ORDER BY createdAt DESC";
            
            $users = $this->db->query($sql, $filters)->fetchAll();
            
            return [
                'success' => true,
                'data' => $users
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error getting all users', Logger::formatException($e));
            return [
                'success' => false,
                'message' => '获取用户列表失败'
            ];
        }
    }

    /**
     * 获取所有订单
     * @param array $filters 过滤条件
     * @return array
     */
    public function getAllOrders($filters = []) {
        try {
            $sql = "SELECT o.*, u.username as customer_name 
                    FROM {$this->order->table}  o 
                    LEFT JOIN {$this->user->table} u ON o.userId = u.id 
                    WHERE 1=1";
            
            if (!empty($filters['status'])) {
                $sql .= " AND o.status = :status";
            }
            
            $sql .= " ORDER BY o.createdAt DESC";
            
            $orders = $this->db->query($sql, $filters)->fetchAll();
            
            return [
                'success' => true,
                'data' => $orders
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error getting all orders', Logger::formatException($e));
            return [
                'success' => false,
                'message' => '获取订单列表失败'
            ];
        }
    }

    /**
     * 更新订单状态
     * @param int $orderId 订单ID
     * @param string $status 新状态
     * @return array
     */
    public function updateOrderStatus($orderId, $status) {
        try {
            $sql = "UPDATE orders SET status = :status WHERE id = :id";
            $this->db->query($sql, [
                'id' => $orderId,
                'status' => $status
            ]);
            
            return [
                'success' => true,
                'message' => '订单状态更新成功'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Error updating order status', Logger::formatException($e));
            return [
                'success' => false,
                'message' => '更新订单状态失败'
            ];
        }
    }

    // 私有辅助方法
    private function getTotalUsers() {
        return $this->db->query("SELECT COUNT(*) as total FROM {$this->user->table}")->fetch()['total'];
    }

    private function getTotalOrders() {
        return $this->db->query("SELECT COUNT(*) as total FROM {$this->order->table} ")->fetch()['total'];
    }

    private function getTotalProducts() {
        return $this->db->query("SELECT COUNT(*) as total FROM {$this->product->table}")->fetch()['total'];
    }

    private function getRecentOrders($limit = 5) {
        return $this->db->query(
            "SELECT o.*, u.username as customer_name 
             FROM {$this->order->table}  o 
             LEFT JOIN {$this->user->table}  u ON o.userId = u.id 
             ORDER BY o.createdAt DESC 
             LIMIT :limit",
            ['limit' => $limit]
        )->fetchAll();
    }

    private function getRecentUsers($limit = 5) {
        return $this->db->query(
            "SELECT * FROM {$this->user->table} ORDER BY createdAt DESC LIMIT :limit",
            ['limit' => $limit]
        )->fetchAll();
    }
}