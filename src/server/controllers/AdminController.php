<?php
namespace Controllers;

use Models\User;
use Models\Product;
use Models\Order;
use Models\OrderItem;
use Utils\Database;
use Utils\Logger;

class AdminController {
    private $db;
    private $user;
    private $product;
    private $order;
    private $orderItem;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->user = new User($this->db);
        $this->product = new Product($this->db);
        $this->order = new Order($this->db);
        $this->orderItem = new OrderItem($this->db);
        $this->logger = new Logger('admin.log');
    }
    
    public function getUsers($filters = [], $page = 1, $limit = 20) {
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
    
    public function getDashboardData() {
        try {
            // Get user stats
            $userSql = "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM User";
            $userStats = $this->db->fetch($userSql);
            
            // Get product stats
            $productSql = "SELECT COUNT(*) as total, SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured FROM Product";
            $productStats = $this->db->fetch($productSql);
            
            // Get order stats
            $orderStats = $this->order->getOrderStats();
            
            // Get monthly revenue
            $monthlySql = "SELECT 
                              DATE_FORMAT(orderDate, '%Y-%m') as month, 
                              SUM(totalAmount) as revenue
                          FROM `Order` 
                          WHERE status != 'cancelled'
                          GROUP BY month
                          ORDER BY month DESC
                          LIMIT 12";
            $monthlyRevenue = $this->db->fetchAll($monthlySql);
            
            // Get top selling products
            $topProducts = $this->orderItem->getTopSellingProducts(5);
            
            return [
                'success' => true,
                'data' => [
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
                ]
            ];
        } catch (\Exception $e) {
            $this->logger->error('Admin get dashboard data failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get dashboard data: ' . $e->getMessage()
            ];
        }
    }
    
    public function getReportData($type, $period = 'monthly', $startDate = null, $endDate = null) {
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
                        FROM `Order` o
                        JOIN OrderItem oi ON o.id = oi.orderId
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
                        FROM Product p
                        LEFT JOIN OrderItem oi ON p.id = oi.productId
                        LEFT JOIN `Order` o ON oi.orderId = o.id
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
                        FROM User u
                        LEFT JOIN `Order` o ON u.id = o.userId
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
} 