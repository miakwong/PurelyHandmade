<?php
require_once '../../config.php';
require_once '../../controllers/Database.php';

header("Content-Type: application/json");

//Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// 获取 JSON 请求数据
$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');

// 邮箱必填检查
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

// 邮箱格式验证
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

// 连接数据库
try {
    $db = new Database();
    $query = "SELECT id FROM users WHERE email = ?";
    $existingUser = $db->fetchOne($query, [$email]);

    // 返回 JSON 结果
    echo json_encode(["success" => true, "exists" => $existingUser ? true : false]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
