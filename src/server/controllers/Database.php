<?php
/**
 * 数据库连接和查询辅助类
 */
class Database {
    private $host = 'localhost';
    private $db_name = 'purely_handmade';
    private $username = 'root';
    private $password = '';
    private $conn = null;
    
    /**
     * 获取数据库连接
     */
    public function getConnection() {
        try {
            if ($this->conn === null) {
                $this->conn = new PDO(
                    "mysql:host={$this->host};dbname={$this->db_name}",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->exec("set names utf8");
            }
            return $this->conn;
        } catch(PDOException $e) {
            echo "连接失败: " . $e->getMessage();
            return null;
        }
    }
    
    /**
     * 执行查询并返回结果集
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            echo "查询失败: " . $e->getMessage();
            return null;
        }
    }
    
    /**
     * 执行查询并返回单个结果
     */
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
    }
    
    /**
     * 执行查询并返回所有结果
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    }
    
    /**
     * 插入记录并返回新插入的ID
     */
    public function insert($table, $data) {
        $fields = array_keys($data);
        $placeholders = array_map(function($field) {
            return ":{$field}";
        }, $fields);
        
        $sql = "INSERT INTO {$table} (" . implode(", ", $fields) . ") 
                VALUES (" . implode(", ", $placeholders) . ")";
        
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($data);
            return $this->getConnection()->lastInsertId();
        } catch(PDOException $e) {
            echo "插入失败: " . $e->getMessage();
            return false;
        }
    }
    
    /**
     * 更新记录
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
        } catch(PDOException $e) {
            echo "更新失败: " . $e->getMessage();
            return false;
        }
    }
    
    /**
     * 删除记录
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        
        try {
            $stmt = $this->getConnection()->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch(PDOException $e) {
            echo "删除失败: " . $e->getMessage();
            return false;
        }
    }
} 