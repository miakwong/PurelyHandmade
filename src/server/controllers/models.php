<?php
/**
 * Data Models
 * 
 * This file contains standardized data structures for the application.
 * It helps ensure consistency between server and client representations.
 */

/**
 * Standard User model
 * 
 * @param array $userData Raw user data
 * @param bool $includePrivate Whether to include private fields
 * @return array Standardized user data
 */
function createUserModel($userData, $includePrivate = false) {
    $user = [
        'id' => $userData['id'] ?? null,
        'username' => $userData['username'] ?? '',
        'first_name' => $userData['first_name'] ?? '',
        'last_name' => $userData['last_name'] ?? '',
        'email' => $userData['email'] ?? '',
        'avatarEncoded' => $userData['avatar'] ?? null,
        'gender' => $userData['gender'] ?? '',
        'created_at' => $userData['created_at'] ?? null,
        'updated_at' => $userData['updated_at'] ?? null
    ];
    
    // Remove private fields if not needed
    if (!$includePrivate) {
        unset($user['email']);
    }
    
    return $user;
}

/**
 * Standard Product model
 * 
 * @param array $productData Raw product data
 * @return array Standardized product data
 */
function createProductModel($productData) {
    return [
        'id' => $productData['id'] ?? null,
        'name' => $productData['name'] ?? '',
        'categoryId' => $productData['categoryId'] ?? null,
        'designerId' => $productData['designerId'] ?? null,
        'price' => (float)($productData['price'] ?? 0),
        'stock' => (int)($productData['stock'] ?? 0),
        'description' => $productData['description'] ?? '',
        'details' => $productData['details'] ?? '',
        'onSale' => (bool)($productData['onSale'] ?? false),
        'salePrice' => isset($productData['salePrice']) ? (float)$productData['salePrice'] : null,
        'images' => is_array($productData['images'] ?? null) ? $productData['images'] : [],
        'listingDate' => $productData['listingDate'] ?? null,
        'reviews' => is_array($productData['reviews'] ?? null) ? $productData['reviews'] : [],
        'created_at' => $productData['created_at'] ?? ($productData['listingDate'] ?? null),
        'updated_at' => $productData['updated_at'] ?? ($productData['listingDate'] ?? null)
    ];
}

/**
 * Standard Category model
 * 
 * @param array $categoryData Raw category data
 * @return array Standardized category data
 */
function createCategoryModel($categoryData) {
    return [
        'id' => $categoryData['id'] ?? null,
        'name' => $categoryData['name'] ?? '',
        'slug' => $categoryData['slug'] ?? '',
        'description' => $categoryData['description'] ?? '',
        'created_at' => $categoryData['created_at'] ?? null,
        'updated_at' => $categoryData['updated_at'] ?? null
    ];
}

/**
 * Standard Designer model
 * 
 * @param array $designerData Raw designer data
 * @return array Standardized designer data
 */
function createDesignerModel($designerData) {
    return [
        'id' => $designerData['id'] ?? null,
        'name' => $designerData['name'] ?? '',
        'specialty' => $designerData['specialty'] ?? '',
        'bio' => $designerData['bio'] ?? '',
        'image' => $designerData['image'] ?? null,
        'featured' => (bool)($designerData['featured'] ?? false),
        'social' => is_array($designerData['social'] ?? null) ? $designerData['social'] : [],
        'created_at' => $designerData['created_at'] ?? null,
        'updated_at' => $designerData['updated_at'] ?? null
    ];
}

/**
 * Standard Review model
 * 
 * @param array $reviewData Raw review data
 * @return array Standardized review data
 */
function createReviewModel($reviewData) {
    return [
        'id' => $reviewData['id'] ?? null,
        'userId' => $reviewData['userId'] ?? null,
        'productId' => $reviewData['productId'] ?? null,
        'name' => $reviewData['name'] ?? '',
        'rating' => (int)($reviewData['rating'] ?? 0),
        'comment' => $reviewData['comment'] ?? '',
        'date' => $reviewData['date'] ?? null,
        'created_at' => $reviewData['created_at'] ?? null,
        'updated_at' => $reviewData['updated_at'] ?? null
    ];
}

/**
 * Standard Order model
 * 
 * @param array $orderData Raw order data
 * @return array Standardized order data
 */
function createOrderModel($orderData) {
    return [
        'id' => $orderData['id'] ?? null,
        'userId' => $orderData['userId'] ?? null,
        'orderDate' => $orderData['orderDate'] ?? null,
        'status' => $orderData['status'] ?? 'pending',
        'totalAmount' => (float)($orderData['totalAmount'] ?? 0),
        'shippingAddress' => $orderData['shippingAddress'] ?? '',
        'billingAddress' => $orderData['billingAddress'] ?? '',
        'paymentMethod' => $orderData['paymentMethod'] ?? '',
        'items' => is_array($orderData['items'] ?? null) ? $orderData['items'] : [],
        'created_at' => $orderData['created_at'] ?? null,
        'updated_at' => $orderData['updated_at'] ?? null
    ];
}

/**
 * Standard OrderItem model
 * 
 * @param array $orderItemData Raw order item data
 * @return array Standardized order item data
 */
function createOrderItemModel($orderItemData) {
    return [
        'id' => $orderItemData['id'] ?? null,
        'orderId' => $orderItemData['orderId'] ?? null,
        'productId' => $orderItemData['productId'] ?? null,
        'quantity' => (int)($orderItemData['quantity'] ?? 0),
        'price' => (float)($orderItemData['price'] ?? 0),
        'subtotal' => (float)($orderItemData['subtotal'] ?? 0),
        'created_at' => $orderItemData['created_at'] ?? null,
        'updated_at' => $orderItemData['updated_at'] ?? null
    ];
}

/**
 * 通用工具函数
 * 提供所有控制器共用的工具方法
 */

/**
 * 发送API响应
 * @param mixed $data 响应数据
 * @param bool $success 请求是否成功
 * @param int $statusCode HTTP状态码
 */
function sendApiResponse($data, $success = true, $statusCode = 200) {
    http_response_code($statusCode);
    
    // 构建响应结构
    $response = [
        'success' => $success,
        'data' => $data
    ];
    
    // 发送JSON响应
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * 生成唯一ID
 * @param string $prefix ID前缀
 * @return string 唯一ID
 */
function generateUniqueId($prefix = '') {
    $timestamp = time();
    $randomPart = bin2hex(random_bytes(8));
    return $prefix . $timestamp . '_' . $randomPart;
}

/**
 * 验证电子邮件格式
 * @param string $email 电子邮件地址
 * @return bool 是否有效
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * 安全过滤输入字符串
 * @param string $input 输入字符串
 * @return string 过滤后的字符串
 */
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * 获取当前时间格式化字符串
 * @return string 格式化的时间字符串
 */
function getCurrentFormattedTime() {
    return date('Y-m-d H:i:s');
}

/**
 * 验证密码强度
 * @param string $password 密码
 * @return bool 是否满足强度要求
 */
function isStrongPassword($password) {
    // 至少8个字符，包含至少一个大写字母、一个小写字母和一个数字
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
}

/**
 * 检查请求是否为AJAX请求
 * @return bool 是否为AJAX请求
 */
function isAjaxRequest() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * 获取客户端IP地址
 * @return string IP地址
 */
function getClientIp() {
    $ipAddress = '';
    
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ipAddress = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED'])) {
        $ipAddress = $_SERVER['HTTP_X_FORWARDED'];
    } elseif (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ipAddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } elseif (isset($_SERVER['HTTP_FORWARDED'])) {
        $ipAddress = $_SERVER['HTTP_FORWARDED'];
    } elseif (isset($_SERVER['REMOTE_ADDR'])) {
        $ipAddress = $_SERVER['REMOTE_ADDR'];
    }
    
    return $ipAddress;
}

/**
 * 记录系统日志
 * @param string $message 日志消息
 * @param string $level 日志级别
 */
function logMessage($message, $level = 'INFO') {
    $logFile = __DIR__ . '/../logs/system.log';
    $logDir = dirname($logFile);
    
    // 确保日志目录存在
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}
?> 