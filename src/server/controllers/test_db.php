<?php
require_once 'src/server/controllers/Database.php';

$db = new Database();

try {
    $db->getConnection();
    echo "✅ Database connection successful!";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage();
}
?>
