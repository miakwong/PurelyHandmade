<?php
/**
 * 数据库操作类
 * 提供数据库连接和基本操作方法
 */

class Database {
    private $pdo;
    private $inTransaction = false;
    
    /**
     * 构造函数，创建数据库连接
     */
    public function __construct() {
        // 载入配置
        $configData = require __DIR__ . "/../config.php";
        $config = $configData[$configData['ENV_MODE']];
        
        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            // 记录错误并抛出异常
            logMessage("Database connection error: " . $e->getMessage(), "ERROR");
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * 执行查询并返回单行结果
     * @param string $sql SQL查询语句
     * @param array $params 参数数组
     * @return array|null 结果数组或null
     */
    public function fetchOne($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logMessage("Database query error: " . $e->getMessage() . " SQL: $sql", "ERROR");
            throw new Exception("Database query error: " . $e->getMessage());
        }
    }
    
    /**
     * 执行查询并返回所有结果
     * @param string $sql SQL查询语句
     * @param array $params 参数数组
     * @return array 结果数组
     */
    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logMessage("Database query error: " . $e->getMessage() . " SQL: $sql", "ERROR");
            throw new Exception("Database query error: " . $e->getMessage());
        }
    }
    
    /**
     * 执行更新操作
     * @param string $table 表名
     * @param array $data 更新数据
     * @param string $where WHERE条件
     * @param array $params 参数数组
     * @return bool 是否成功
     */
    public function update($table, $data, $where, $params = []) {
        try {
            $setClauses = [];
            $updateParams = [];
            
            foreach ($data as $column => $value) {
                $setClauses[] = "`$column` = ?";
                $updateParams[] = $value;
            }
            
            $updateParams = array_merge($updateParams, $params);
            
            $sql = "UPDATE `$table` SET " . implode(', ', $setClauses) . " WHERE $where";
            
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($updateParams);
        } catch (PDOException $e) {
            logMessage("Database update error: " . $e->getMessage(), "ERROR");
            throw new Exception("Database update error: " . $e->getMessage());
        }
    }
    
    /**
     * 执行插入操作
     * @param string $table 表名
     * @param array $data 插入数据
     * @param bool $returnBool 是否返回布尔值而非ID
     * @return int|bool 新记录ID或成功标志
     */
    public function insert($table, $data, $returnBool = false) {
        try {
            $columns = array_keys($data);
            $placeholders = array_fill(0, count($columns), '?');
            
            $sql = "INSERT INTO `$table` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $placeholders) . ")";
            
            $stmt = $this->pdo->prepare($sql);
            $success = $stmt->execute(array_values($data));
            
            if ($returnBool) {
                return $success;
            } else {
                return $success ? $this->pdo->lastInsertId() : false;
            }
        } catch (PDOException $e) {
            logMessage("Database insert error: " . $e->getMessage(), "ERROR");
            throw new Exception("Database insert error: " . $e->getMessage());
        }
    }
    
    /**
     * 执行删除操作
     * @param string $table 表名
     * @param string $where WHERE条件
     * @param array $params 参数数组
     * @return bool 是否成功
     */
    public function delete($table, $where, $params = []) {
        try {
            $sql = "DELETE FROM `$table` WHERE $where";
            
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            logMessage("Database delete error: " . $e->getMessage(), "ERROR");
            throw new Exception("Database delete error: " . $e->getMessage());
        }
    }
    
    /**
     * 执行任意SQL语句
     * @param string $sql SQL语句
     * @param array $params 参数数组
     * @return bool 是否成功
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            logMessage("Database execute error: " . $e->getMessage() . " SQL: $sql", "ERROR");
            throw new Exception("Database execute error: " . $e->getMessage());
        }
    }
    
    /**
     * 开始事务
     * @return bool 是否成功
     */
    public function beginTransaction() {
        if (!$this->inTransaction) {
            $this->inTransaction = $this->pdo->beginTransaction();
            return $this->inTransaction;
        }
        return false;
    }
    
    /**
     * 提交事务
     * @return bool 是否成功
     */
    public function commit() {
        if ($this->inTransaction) {
            $this->inTransaction = false;
            return $this->pdo->commit();
        }
        return false;
    }
    
    /**
     * 回滚事务
     * @return bool 是否成功
     */
    public function rollback() {
        if ($this->inTransaction) {
            $this->inTransaction = false;
            return $this->pdo->rollBack();
        }
        return false;
    }
    
    /**
     * 获取PDO实例
     * @return PDO PDO实例
     */
    public function getPdo() {
        return $this->pdo;
    }
    
    /**
     * 转义标识符（表名或列名）
     * @param string $identifier 标识符
     * @return string 转义后的标识符
     */
    public function escapeIdentifier($identifier) {
        return "`" . str_replace("`", "``", $identifier) . "`";
    }
} 