<?php
require_once '../controllers/Database.php';
require_once '../index.php'; // Include for sendApiResponse function

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendApiResponse("Invalid request method", false, 405);
}

// 获取 JSON 请求数据
$data = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    sendApiResponse("Invalid JSON input", false, 400);
}

if (!$data) {
    sendApiResponse("Invalid request", false, 400);
}

// 检查是否缺少字段
$requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'birthday', 'gender'];
$errors = [];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " is required.";
    }
}

// 额外检查：邮箱格式 & 密码强度
if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Invalid email format.";
}
if (!empty($data['password']) && (strlen($data['password']) < 8 || !preg_match('/[A-Z]/', $data['password']) || !preg_match('/\d/', $data['password']))) {
    $errors['password'] = "Password must be at least 8 characters, include an uppercase letter and a number.";
}

// 检查 gender 是否是合法值
$validGenders = ['male', 'female', 'other'];
if (!isset($data['gender']) || !in_array($data['gender'], $validGenders)) {
    $errors['gender'] = "Invalid gender selected.";
}

// 终止并返回错误
if (!empty($errors)) {
    sendApiResponse(["validation_errors" => $errors], false, 400);
}

$db = new Database();

// 检查用户名或邮箱是否已存在
$existingUser = $db->fetchOne("SELECT id FROM users WHERE username = ? OR email = ?", [$data['username'], $data['email']]);
if ($existingUser) {
    sendApiResponse("Username or Email already exists", false, 409);
}

// 加密密码
$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

// 处理头像存储 (Base64)
$avatarBase64 = null;
if (!empty($data['avatar'])) {
    $avatarData = explode(',', $data['avatar'])[1] ?? null;
    $decodedAvatar = $avatarData ? base64_decode($avatarData) : false;
    
    if ($decodedAvatar === false) {
        sendApiResponse("Invalid avatar format", false, 400);
    }

    // 存储 base64 数据
    $avatarBase64 = $data['avatar'];
}

// 插入新用户
$insertId = $db->insert("users", [
    "first_name" => trim($data['first_name']),
    "last_name" => trim($data['last_name']),
    "username" => trim($data['username']),
    "email" => trim($data['email']),
    "password_hash" => $passwordHash,
    "birthday" => trim($data['birthday']),
    "gender" => trim($data['gender']),
    "avatar" => $avatarBase64,  // 存储 Base64
    "created_at" => date("Y-m-d H:i:s"),
    "updated_at" => date("Y-m-d H:i:s")
]);

if ($insertId) {
    // 注册成功后保持登录
    session_start();
    $_SESSION['user_id'] = $insertId;
    $_SESSION['username'] = $data['username'];
    
    // 返回用户数据（不包含密码）
    $userData = [
        "user_id" => $insertId,
        "username" => $data['username'],
        "email" => $data['email'],
        "first_name" => $data['first_name'],
        "last_name" => $data['last_name']
    ];
    
    sendApiResponse($userData, true, 201);
} else {
    sendApiResponse("Failed to create account", false, 500);
}
?>
