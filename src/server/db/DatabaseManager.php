<?php
/**
 * 数据库管理器类
 * 
 * 提供数据库连接和初始化功能
 */

namespace PurelyHandmade\Server\DB;

use PDO;
use PDOException;

class DatabaseManager
{
    private static ?PDO $connection = null;
    private static array $config = [];
    
    /**
     * 初始化数据库配置
     */
    public static function init(array $config = []): void
    {
        // 如果没有提供配置，尝试从环境变量加载
        if (empty($config)) {
            $envFile = dirname(__DIR__, 3) . '/.env';
            
            if (file_exists($envFile)) {
                $env = parse_ini_file($envFile);
                if ($env) {
                    self::$config = [
                        'host' => $env['DB_HOST'] ?? 'localhost',
                        'port' => $env['DB_PORT'] ?? 3306,
                        'dbname' => $env['DB_NAME'] ?? 'purely_handmade',
                        'username' => $env['DB_USER'] ?? 'root',
                        'password' => $env['DB_PASSWORD'] ?? '',
                        'socket' => $env['DB_SOCKET'] ?? null
                    ];
                }
            }
        } else {
            self::$config = $config;
        }
    }
    
    /**
     * 获取数据库连接
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            // 确保已初始化配置
            if (empty(self::$config)) {
                self::init();
            }
            
            try {
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                // 尝试使用 socket 连接
                if (!empty(self::$config['socket']) && file_exists(self::$config['socket'])) {
                    $dsn = "mysql:unix_socket=" . self::$config['socket'] . ";dbname=" . self::$config['dbname'] . ";charset=utf8mb4";
                    self::$connection = new PDO($dsn, self::$config['username'], self::$config['password'], $options);
                } else {
                    // 使用 TCP/IP 连接
                    $dsn = "mysql:host=" . self::$config['host'] . ";port=" . self::$config['port'] . ";dbname=" . self::$config['dbname'] . ";charset=utf8mb4";
                    self::$connection = new PDO($dsn, self::$config['username'], self::$config['password'], $options);
                }
            } catch (PDOException $e) {
                throw new PDOException("数据库连接失败: " . $e->getMessage());
            }
        }
        
        return self::$connection;
    }
    
    /**
     * 运行初始化脚本
     */
    public static function runInitScript(bool $force = false): bool
    {
        $scriptPath = __DIR__ . '/init_db.php';
        
        if (!file_exists($scriptPath)) {
            throw new \Exception("初始化脚本不存在: " . $scriptPath);
        }
        
        // 在子进程中执行初始化脚本
        $command = 'php ' . escapeshellarg($scriptPath);
        if ($force) {
            $command .= ' --force';
        }
        
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        return $returnCode === 0;
    }
    
    /**
     * 执行 SQL 查询
     */
    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    /**
     * 执行单条插入/更新/删除
     */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
    
    /**
     * 获取最后插入的 ID
     */
    public static function lastInsertId(): string
    {
        return self::getConnection()->lastInsertId();
    }
    
    /**
     * 开始事务
     */
    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }
    
    /**
     * 提交事务
     */
    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }
    
    /**
     * 回滚事务
     */
    public static function rollback(): bool
    {
        return self::getConnection()->rollBack();
    }
} 