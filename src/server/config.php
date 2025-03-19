<?php
/**
 * 配置文件
 * 包含不同环境的数据库配置和其他设置
 */

return [
    // 当前环境模式：development, testing 或 production
    'ENV_MODE' => 'development',
    
    // 开发环境配置
    'development' => [
        'host' => 'localhost',
        'username' => 'root',
        'password' => '15879512',
        'dbname' => 'purely_handmade',
        'charset' => 'utf8mb4',
        'debug' => true
    ],
    
    // 测试环境配置
    'testing' => [
        'host' => 'localhost',
        'username' => 'testing_user',
        'password' => 'testing_password',
        'dbname' => 'purely_handmade_test',
        'charset' => 'utf8mb4',
        'debug' => true
    ],
    
    // 生产环境配置
    'production' => [
        'host' => 'production_host',
        'username' => 'production_user',
        'password' => 'production_password',
        'dbname' => 'purely_handmade_prod',
        'charset' => 'utf8mb4',
        'debug' => false
    ],
    
    // 全局配置
    'app_name' => 'PurelyHandmade',
    'app_url' => 'https://purelyhandmade.com',
    'session_lifetime' => 1440, // 24小时，单位分钟
    'max_upload_size' => 10 * 1024 * 1024, // 10MB
    'image_upload_dir' => __DIR__ . '/../client/uploads/',
    'allowed_image_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'timezone' => 'Asia/Shanghai'
];
