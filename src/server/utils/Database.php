<?php
namespace Utils;

use PDO;
use PDOException;
use Exception;

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $socket;
    private $conn;
    
    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'purely_handmade';
        $this->username = $_ENV['DB_USER'] ?? 'no15438';
        $this->password = $_ENV['DB_PASSWORD'] ?? '158795';
        $this->port = $_ENV['DB_PORT'] ?? 3306;
        $this->socket = $_ENV['DB_SOCKET'] ?? null;
        
        // For debugging
        error_log("Database connection settings:");
        error_log("Host: " . $this->host);
        error_log("DB Name: " . $this->db_name);
        error_log("Username: " . $this->username);
        error_log("Socket: " . ($this->socket ? $this->socket : "Not set"));
    }
    
    public function connect() {
        $this->conn = null;
        
        try {
            // For mysql sockets, we need to use different approach
            if (file_exists('/tmp/mysql.sock')) {
                $dsn = "mysql:unix_socket=/tmp/mysql.sock;dbname={$this->db_name};charset=utf8mb4";
                error_log("Using /tmp/mysql.sock for connection");
            } elseif (file_exists('/opt/homebrew/var/mysql/mysql.sock')) {
                $dsn = "mysql:unix_socket=/opt/homebrew/var/mysql/mysql.sock;dbname={$this->db_name};charset=utf8mb4";
                error_log("Using /opt/homebrew/var/mysql/mysql.sock for connection");
            } else {
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
                
                if ($this->socket) {
                    $dsn .= ";unix_socket={$this->socket}";
                } else {
                    $dsn .= ";port={$this->port}";
                }
                error_log("Using TCP connection: " . $dsn);
            }
            
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
            error_log("Database connection successful!");
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection error: " . $e->getMessage());
        }
        
        return $this->conn;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            
            // For debugging
            error_log("Executing SQL: " . $sql);
            error_log("With parameters: " . json_encode($params));
            
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            throw new Exception("Query error: " . $e->getMessage());
        }
    }
    
    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->query($sql, $params);
            return $stmt->fetchAll();
        } catch(Exception $e) {
            throw new Exception($e->getMessage());
        }
    }
    
    public function fetch($sql, $params = []) {
        try {
            $stmt = $this->query($sql, $params);
            return $stmt->fetch();
        } catch(Exception $e) {
            throw new Exception($e->getMessage());
        }
    }
    
    public function insert($table, $data) {
        try {
            // Remove backticks from table name for column construction
            $cleanTable = trim($table, '`');
            
            $columns = array_keys($data);
            $columnSql = implode(', ', $columns);
            $bindingSql = implode(', ', array_map(fn($col) => ":$col", $columns));
            
            $sql = "INSERT INTO $table ($columnSql) VALUES ($bindingSql)";
            
            // Debug log
            error_log("Insert SQL: " . $sql);
            error_log("Insert data: " . json_encode($data));
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($data);
            
            return $this->conn->lastInsertId();
        } catch(PDOException $e) {
            error_log("Insert error: " . $e->getMessage());
            throw new Exception("Insert error: " . $e->getMessage());
        }
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        try {
            $setSql = implode(', ', array_map(fn($col) => "$col = :$col", array_keys($data)));
            
            $sql = "UPDATE $table SET $setSql WHERE $where";
            
            // Debug log
            error_log("Update SQL: " . $sql);
            error_log("Update data: " . json_encode(array_merge($data, $whereParams)));
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(array_merge($data, $whereParams));
            
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log("Update error: " . $e->getMessage());
            throw new Exception("Update error: " . $e->getMessage());
        }
    }
    
    public function delete($table, $where, $params = []) {
        try {
            $sql = "DELETE FROM $table WHERE $where";
            
            // Debug log
            error_log("Delete SQL: " . $sql);
            error_log("Delete params: " . json_encode($params));
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log("Delete error: " . $e->getMessage());
            throw new Exception("Delete error: " . $e->getMessage());
        }
    }
    
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }
} 