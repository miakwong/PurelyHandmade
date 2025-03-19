<?php
/**
 * Database connection and query helper class
 */

class Database {
    private $conn = null;
    private $config;

    public function __construct() {
        $configData = require __DIR__ . "/../config.php";

        //根据 ENV_MODE 选择数据库配置 Select database configuration according to ENV_MODE
        $this->config = $configData[$configData['ENV_MODE']];
    }
    
    /**
     * Get database connection
     */
    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->config['host'] . ";dbname=" . $this->config['dbname'],
                    $this->config['username'],
                    $this->config['password']
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->exec("set names utf8");
            } catch (PDOException $e) {
                throw new Exception("Database connection error: " . $e->getMessage());
            }
        }
        return $this->conn;
    }

    
    /**
     * 执行查询并返回结果集 Execute an SQL query and return the result set
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            echo "Query failed: " . $e->getMessage();
            return null;
        }
    }
    
    /**
     * 执行查询并返回单个结果Execute an SQL query and return a single result
     */
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;

        if ($result && isset($result['avatar'])) {
            // 解码 Base64 数据以便使用
            $result['avatar'] = base64_decode($result['avatar']);
        }
    
        return $result;
    }
    
    /**
     * 执行查询并返回所有结果Execute an SQL query and return all results
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        foreach ($results as &$result) {
            if (isset($result['avatar'])) {
                // 解码 Base64 数据
                $result['avatar'] = base64_decode($result['avatar']);
            }
        }
    
        return $results;
    }
    
    /**
     * 插入记录并返回新插入的IDInsert a record and return the newly inserted ID
     */
    public function insert($table, $data) {
        $fields = array_keys($data);
        $placeholders = array_map(fn($field) => ":{$field}", $fields);
        
        $sql = "INSERT INTO {$table} (" . implode(", ", $fields) . ") 
                VALUES (" . implode(", ", $placeholders) . ")";
        
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($data);
            return $this->getConnection()->lastInsertId();
        } catch(PDOException $e) {
            echo "Insert failed: " . $e->getMessage();
            return false;
        }
    }
    
    /**
     * Update records in the database
     */
    public function update($table, $data, $where, $whereParams = []) {
        $setClauses = [];
        $params = [];
        
        foreach($data as $key => $value) {
            $setClauses[] = "{$key} = :{$key}";
            $params[$key] = $value;
        }
        
        $sql = "UPDATE {$table} SET " . implode(", ", $setClauses) . " WHERE {$where}";
        
        foreach($whereParams as $key => $value) {
            $params[$key] = $value;
        }
        
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            echo "Update failed: " . $e->getMessage();
            return false;
        }
    }
    
    /**
     * Delete records from the database
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";

        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            echo "Delete failed: " . $e->getMessage();
            return false;
        }
    }

    
    /**
     * Test connection
     */
    public function testConnection() {
        try {
            $this->getConnection();
            echo "✅ Database connection successful!";
        } catch (Exception $e) {
            echo "❌ Database connection failed: " . $e->getMessage();
        }
    }
} 