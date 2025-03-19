<?php
/**
 * 产品评论测试端点
 * 用于测试产品评论功能，不涉及实际数据库操作
 */

// 错误显示设置
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 允许CORS - 设置更宽松，确保开发环境可用
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 调试模式
$debugMode = true;

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 记录请求数据，用于调试
$rawInput = file_get_contents('php://input');
$headers = function_exists('getallheaders') ? getallheaders() : [];
$contentType = $headers['Content-Type'] ?? '';
$authHeader = $headers['Authorization'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';

$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

$logMessage = "===== 产品评论请求 =====\n";
$logMessage .= "时间: " . date('Y-m-d H:i:s') . "\n";
$logMessage .= "方法: " . $requestMethod . "\n";
$logMessage .= "URI: " . ($_SERVER['REQUEST_URI'] ?? '') . "\n";
$logMessage .= "Query: " . ($_SERVER['QUERY_STRING'] ?? '') . "\n";
$logMessage .= "Content-Type: " . $contentType . "\n";
$logMessage .= "Authorization: " . str_replace('Bearer ', 'Bearer ***', $authHeader) . "\n";
$logMessage .= "Raw输入: " . $rawInput . "\n";
$logMessage .= "==================\n";

// 将日志写入文件
file_put_contents($logDir . '/product_reviews_log.txt', $logMessage, FILE_APPEND);
error_log($logMessage);

// 获取产品ID
$productId = null;
$reviewId = null;

// 分析URI来获取产品ID
$uri = $_SERVER['REQUEST_URI'] ?? '';
if (preg_match('/\/products\/(\d+)\/reviews/', $uri, $matches)) {
    $productId = intval($matches[1]);
} elseif (preg_match('/\/reviews\/(\d+)/', $uri, $matches)) {
    $reviewId = intval($matches[1]);
}

// 模拟评论数据
$reviews = [
    [
        'id' => 1,
        'productId' => 1,
        'userId' => 2,
        'userName' => 'John Doe',
        'userEmail' => 'john@example.com',
        'userAvatar' => '/src/client/img/avatars/user1.jpg',
        'rating' => 5,
        'title' => 'Excellent product',
        'content' => 'This is the best ceramic mug I\'ve ever owned. Great quality and beautiful design.',
        'status' => 'approved',
        'createdAt' => '2023-06-15T10:30:00',
        'updatedAt' => '2023-06-15T10:30:00'
    ],
    [
        'id' => 2,
        'productId' => 1,
        'userId' => 3,
        'userName' => 'Jane Smith',
        'userEmail' => 'jane@example.com',
        'userAvatar' => '/src/client/img/avatars/user2.jpg',
        'rating' => 4,
        'title' => 'Very nice mug',
        'content' => 'I love this mug, but it\'s a bit smaller than I expected. Still great quality though!',
        'status' => 'approved',
        'createdAt' => '2023-06-20T15:45:00',
        'updatedAt' => '2023-06-20T15:45:00'
    ],
    [
        'id' => 3,
        'productId' => 2,
        'userId' => 2,
        'userName' => 'John Doe',
        'userEmail' => 'john@example.com',
        'userAvatar' => '/src/client/img/avatars/user1.jpg',
        'rating' => 5,
        'title' => 'Warm and cozy',
        'content' => 'This winter hat is so warm and comfortable. The craftsmanship is amazing!',
        'status' => 'approved',
        'createdAt' => '2023-06-18T09:15:00',
        'updatedAt' => '2023-06-18T09:15:00'
    ],
    [
        'id' => 4,
        'productId' => 3,
        'userId' => 4,
        'userName' => 'Alice Brown',
        'userEmail' => 'alice@example.com',
        'userAvatar' => '/src/client/img/avatars/user3.jpg',
        'rating' => 5,
        'title' => 'Beautiful clock',
        'content' => 'This wall clock is a work of art. It looks even better in person than in the photos.',
        'status' => 'approved',
        'createdAt' => '2023-06-25T12:30:00',
        'updatedAt' => '2023-06-25T12:30:00'
    ],
    [
        'id' => 5,
        'productId' => 1,
        'userId' => 5,
        'userName' => 'Bob Wilson',
        'userEmail' => 'bob@example.com',
        'userAvatar' => '/src/client/img/avatars/user4.jpg',
        'rating' => 3,
        'title' => 'Decent mug',
        'content' => 'It\'s an okay mug, but I\'ve seen better for the price. The handle is a bit small for my liking.',
        'status' => 'pending',
        'createdAt' => '2023-07-02T14:20:00',
        'updatedAt' => '2023-07-02T14:20:00'
    ],
    [
        'id' => 6,
        'productId' => 4,
        'userId' => 3,
        'userName' => 'Jane Smith',
        'userEmail' => 'jane@example.com',
        'userAvatar' => '/src/client/img/avatars/user2.jpg',
        'rating' => 5,
        'title' => 'Beautiful wall hanging',
        'content' => 'This macrame wall hanging has transformed my living room. The texture and craftsmanship are outstanding.',
        'status' => 'approved',
        'createdAt' => '2023-07-05T11:10:00',
        'updatedAt' => '2023-07-05T11:10:00'
    ],
    [
        'id' => 7,
        'productId' => 5,
        'userId' => 2,
        'userName' => 'John Doe',
        'userEmail' => 'john@example.com',
        'userAvatar' => '/src/client/img/avatars/user1.jpg',
        'rating' => 4,
        'title' => 'Elegant vase',
        'content' => 'This glass vase is stunning - every piece truly is unique. It catches the light beautifully.',
        'status' => 'approved',
        'createdAt' => '2023-07-10T16:30:00',
        'updatedAt' => '2023-07-10T16:30:00'
    ],
    [
        'id' => 8,
        'productId' => 6,
        'userId' => 5,
        'userName' => 'Bob Wilson',
        'userEmail' => 'bob@example.com',
        'userAvatar' => '/src/client/img/avatars/user4.jpg',
        'rating' => 5,
        'title' => 'Beautiful necklace',
        'content' => 'This pendant necklace is even more beautiful in person. The craftsmanship is exceptional.',
        'status' => 'pending',
        'createdAt' => '2023-07-12T10:45:00',
        'updatedAt' => '2023-07-12T10:45:00'
    ]
];

// 根据请求处理不同的操作
switch ($requestMethod) {
    case 'GET':
        if ($productId !== null) {
            // 获取指定产品的评论
            $productReviews = array_filter($reviews, function($review) use ($productId) {
                return $review['productId'] === $productId;
            });
            
            echo json_encode([
                'success' => true,
                'data' => array_values($productReviews)
            ]);
        } elseif ($reviewId !== null) {
            // 获取单个评论
            $review = null;
            foreach ($reviews as $r) {
                if ($r['id'] === $reviewId) {
                    $review = $r;
                    break;
                }
            }
            
            if ($review) {
                echo json_encode([
                    'success' => true,
                    'data' => $review
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Review not found'
                ]);
            }
        } else {
            // 获取所有评论
            echo json_encode([
                'success' => true,
                'data' => $reviews
            ]);
        }
        break;
        
    case 'POST':
        // 添加新评论
        if ($productId === null) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Product ID is required'
            ]);
            break;
        }
        
        $data = json_decode($rawInput, true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid request data'
            ]);
            break;
        }
        
        $newReview = [
            'id' => count($reviews) + 1,
            'productId' => $productId,
            'userId' => $data['userId'] ?? 1,
            'userName' => $data['userName'] ?? 'Anonymous',
            'userEmail' => $data['userEmail'] ?? 'anonymous@example.com',
            'userAvatar' => $data['userAvatar'] ?? null,
            'rating' => $data['rating'] ?? 5,
            'title' => $data['title'] ?? '',
            'content' => $data['content'] ?? '',
            'status' => 'pending',
            'createdAt' => date('Y-m-d\TH:i:s'),
            'updatedAt' => date('Y-m-d\TH:i:s')
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Review added successfully',
            'data' => $newReview
        ]);
        break;
        
    case 'PATCH':
        // 更新评论状态
        if ($reviewId === null) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Review ID is required'
            ]);
            break;
        }
        
        $data = json_decode($rawInput, true);
        
        if (!$data || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Status is required'
            ]);
            break;
        }
        
        $reviewFound = false;
        $updatedReview = null;
        
        foreach ($reviews as &$review) {
            if ($review['id'] === $reviewId) {
                $reviewFound = true;
                $review['status'] = $data['status'];
                $review['updatedAt'] = date('Y-m-d\TH:i:s');
                $updatedReview = $review;
                break;
            }
        }
        
        if ($reviewFound) {
            echo json_encode([
                'success' => true,
                'message' => 'Review status updated successfully',
                'data' => $updatedReview
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Review not found'
            ]);
        }
        break;
        
    case 'DELETE':
        // 删除评论
        if ($reviewId === null) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Review ID is required'
            ]);
            break;
        }
        
        $reviewFound = false;
        
        foreach ($reviews as $index => $review) {
            if ($review['id'] === $reviewId) {
                $reviewFound = true;
                break;
            }
        }
        
        if ($reviewFound) {
            echo json_encode([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Review not found'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
} 