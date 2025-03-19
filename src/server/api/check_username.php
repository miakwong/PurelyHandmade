<?php

require_once '../controllers/Database.php';
require_once '../index.php'; // Include for sendApiResponse function

header("Content-Type: application/json");

// 确保是 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendApiResponse("Invalid request method", false, 405);
}

// 获取 JSON 请求数据
$data = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    sendApiResponse("Invalid JSON input", false, 400);
}

if (!isset($data['username']) || trim($data['username']) === '') {
    sendApiResponse("Username is required", false, 400);
}

$username = trim($data['username']);

// 验证用户名格式: 3-20个字符，只允许字母、数字和下划线
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    sendApiResponse("Username must be 3-20 characters and contain only letters, numbers, and underscores", false, 400);
}

$db = new Database();

// 检查用户名是否已存在
$existingUser = $db->fetchOne("SELECT id FROM users WHERE username = ?", [$username]);
if ($existingUser) {
    sendApiResponse(["available" => false, "message" => "Username already taken"], false, 200);
} else {
    sendApiResponse(["available" => true, "message" => "Username is available"], true, 200);
}
?>
