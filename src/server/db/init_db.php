<?php
/**
 * 数据库初始化命令行工具
 * 
 * 用法：
 * php init_db.php          - 交互模式
 * php init_db.php --force  - 强制模式，不提示确认
 */

// 解析命令行参数
$forceMode = false;
foreach ($argv as $arg) {
    if ($arg === '--force') {
        $forceMode = true;
    }
}

// 如果不是强制模式，显示警告并请求确认
if (!$forceMode) {
    echo "=======================================================\n";
    echo "        PurelyHandmade 数据库初始化工具\n";
    echo "=======================================================\n\n";
    echo "警告: 此操作将重置数据库，所有现有数据将被删除!\n";
    echo "数据库将根据 database_content.md 文件重新创建并填充初始数据。\n\n";
    
    echo "您确定要继续吗? [y/N]: ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($line) !== 'y') {
        echo "操作已取消\n";
        exit;
    }
    
    echo "\n开始初始化数据库...\n\n";
}

// 执行数据库初始化脚本
require_once __DIR__ . '/init_database.php';

echo "\n=======================================================\n";
echo "        数据库初始化完成!\n";
echo "=======================================================\n\n";
echo "数据库摘要:\n";
echo "- 用户: 12个 (包括管理员和普通用户)\n";
echo "- 产品类别: 8个\n";
echo "- 设计师: 8个\n";
echo "- 产品: 10个\n";
echo "- 订单: 10个\n";
echo "- 评论: 10个\n\n";

echo "管理员账户:\n";
echo "- 用户名: admin@purelyhandmade.com / 密码: 密码散列值已存储\n";
echo "- 用户名: newadmin@example.com / 密码: 密码散列值已存储\n\n";

echo "普通用户账户:\n";
echo "- 用户名: user@purelyhandmade.com / 密码: 密码散列值已存储\n";
echo "- 用户名: customer1@example.com / 密码: 密码散列值已存储\n\n";

echo "可以使用这些账户登录系统测试功能。\n";
echo "数据库结构和关系已经根据 database_content.md 文件设置完成。\n"; 