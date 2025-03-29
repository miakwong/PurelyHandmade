<?php
class AdminApiHttpTest {
    private $baseUrl;
    private $adminToken;
    private $testResults = [];

    public function __construct() {
        // 设置API基础URL
        $this->baseUrl = 'https://cosc360.ok.ubc.ca/~xzy2020c/PurelyHandmade/api/admin';
        // 使用实际的管理员token
        $this->adminToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjE3LCJpYXQiOjE3NDMyNDA2OTAsImV4cCI6MTc0MzMyNzA5MH0.rxQK_7JzxsDgaWjGrUftS5FT-jkPufWTR3ccb_zd3iw';
    }

    /**
     * 发送HTTP请求
     * @param string $method 请求方法
     * @param string $endpoint 端点
     * @param array $data 请求数据
     * @return array 响应数据
     */
    private function sendRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->adminToken,
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        
        if ($method === 'POST' || $method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'code' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    /**
     * 测试获取仪表板统计信息
     */
    public function testGetDashboardStatistics() {
        echo "Testing getDashboardStatistics...\n";
        
        $result = $this->sendRequest('GET', '/dashboard/statistics');
        
        if ($result['code'] === 200 && $result['data']['success']) {
            echo "✓ Dashboard statistics retrieved successfully\n";
            echo "Total users: " . $result['data']['data']['total_users'] . "\n";
            echo "Total orders: " . $result['data']['data']['total_orders'] . "\n";
            echo "Total products: " . $result['data']['data']['total_products'] . "\n";
            $this->testResults['dashboard'] = 'success';
        } else {
            echo "✗ Failed to get dashboard statistics\n";
            echo "HTTP Code: " . $result['code'] . "\n";
            echo "Error: " . ($result['data']['message'] ?? 'Unknown error') . "\n";
            $this->testResults['dashboard'] = 'failed';
        }
    }

    /**
     * 测试获取所有用户
     */
    public function testGetAllUsers() {
        echo "\nTesting getAllUsers...\n";
        
        $result = $this->sendRequest('GET', '/users');
        
        if ($result['code'] === 200 && $result['data']['success']) {
            echo "✓ Users retrieved successfully\n";
            echo "Total users: " . count($result['data']['data']) . "\n";
            $this->testResults['users'] = 'success';
        } else {
            echo "✗ Failed to get users\n";
            echo "HTTP Code: " . $result['code'] . "\n";
            echo "Error: " . ($result['data']['message'] ?? 'Unknown error') . "\n";
            $this->testResults['users'] = 'failed';
        }
    }

    /**
     * 测试获取所有订单
     */
    public function testGetAllOrders() {
        echo "\nTesting getAllOrders...\n";
        
        $result = $this->sendRequest('GET', '/orders');
        
        if ($result['code'] === 200 && $result['data']['success']) {
            echo "✓ Orders retrieved successfully\n";
            echo "Total orders: " . count($result['data']['data']) . "\n";
            $this->testResults['orders'] = 'success';
        } else {
            echo "✗ Failed to get orders\n";
            echo "HTTP Code: " . $result['code'] . "\n";
            echo "Error: " . ($result['data']['message'] ?? 'Unknown error') . "\n";
            $this->testResults['orders'] = 'failed';
        }
    }

    /**
     * 测试更新订单状态
     */
    public function testUpdateOrderStatus() {
        echo "\nTesting updateOrderStatus...\n";
        
        $data = [
            'orderId' => 1,
            'status' => 'completed'
        ];
        
        $result = $this->sendRequest('PUT', '/orders/status', $data);
        
        if ($result['code'] === 200 && $result['data']['success']) {
            echo "✓ Order status updated successfully\n";
            $this->testResults['update_order'] = 'success';
        } else {
            echo "✗ Failed to update order status\n";
            echo "HTTP Code: " . $result['code'] . "\n";
            echo "Error: " . ($result['data']['message'] ?? 'Unknown error') . "\n";
            $this->testResults['update_order'] = 'failed';
        }
    }

    /**
     * 运行所有测试
     */
    public function runAllTests() {
        echo "Starting Admin API HTTP Tests...\n\n";
        
        $this->testGetDashboardStatistics();
        $this->testGetAllUsers();
        $this->testGetAllOrders();
        $this->testUpdateOrderStatus();
        
        echo "\nTest Results Summary:\n";
        foreach ($this->testResults as $test => $result) {
            echo "$test: " . ($result === 'success' ? '✓' : '✗') . "\n";
        }
        
        echo "\nAll tests completed.\n";
    }
}

// 运行测试
$test = new AdminApiHttpTest();
$test->runAllTests(); 