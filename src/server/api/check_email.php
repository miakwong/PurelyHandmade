<?php
require_once '../controllers/Database.php';

header("Content-Type: application/json");

// 确保是 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

// 获取 JSON 请求数据
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email'])) {
    echo json_encode(["error" => "Email is required"]);
    exit;
}

$email = trim($data['email']);

// 邮箱格式验证（推荐使用 `filter_var`）
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// 额外的正则检查（如果 `filter_var` 还不够）
$emailPattern = "/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/";
if (!preg_match($emailPattern, $email)) {
    echo json_encode(["error" => "Please enter a valid email address with a correct domain."]);
    exit;
}

// 连接数据库，查询邮箱是否存在
$db = new Database();
$existingUser = $db->fetchOne("SELECT id FROM users WHERE email = ?", [$email]);

// 返回 JSON 结果
echo json_encode(["exists" => $existingUser ? true : false]);
?>
