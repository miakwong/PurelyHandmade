<?php

require_once '../controllers/Database.php';
header("Content-Type: application/json");

// 确保是 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

// 从 POST 数据中提取 JSON 数据
$data = json_decode(file_get_contents("php://input"), true);

// 检查是否提供了用户名
if (!$data || empty($data['username'])) {
    echo json_encode(["error" => "Username is required"]);
    exit;
}

// 检查用户名长度
$username = trim($data['username']);
if (strlen($username) < 3) {
    echo json_encode(["error" => "Username must be at least 3 characters"]);
    exit;
}


$db = new Database();

$existingUser = $db->fetchOne("SELECT id FROM users WHERE username = ?", [$username]);

echo json_encode(["exists" => $existingUser ? true : false]);
?>
