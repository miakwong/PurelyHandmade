<?php
require_once '../controllers/Database.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit;
}

// 获取 JSON 请求数据
$data = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit;
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
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

$db = new Database();

// 检查用户名或邮箱是否已存在
$existingUser = $db->fetchOne("SELECT id FROM users WHERE username = ? OR email = ?", [$data['username'], $data['email']]);
if ($existingUser) {
    echo json_encode(["success" => false, "error" => "Username or Email already exists"]);
    exit;
}

// 加密密码
$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

// 处理头像存储 (Base64)
$avatarBase64 = null;
if (!empty($data['avatar'])) {
    $avatarData = explode(',', $data['avatar'])[1] ?? null;
    $decodedAvatar = $avatarData ? base64_decode($avatarData) : false;
    
    if ($decodedAvatar === false) {
        echo json_encode(["success" => false, "error" => "Invalid avatar format."]);
        exit;
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
    "created_at" => date("Y-m-d H:i:s")
]);

if ($insertId) {
    // 注册成功后保持登录
    session_start();
    $_SESSION['user_id'] = $insertId;
    $_SESSION['username'] = $data['username'];
    echo json_encode(["success" => true, "user_id" => $insertId]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to create account"]);
}
?>
