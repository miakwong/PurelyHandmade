<?php
namespace Utils;

class Request {
    private $data;
    
    public function __construct() {
        $this->data = $this->parseRequestData();
    }
    
    private function parseRequestData() {
        $method = $_SERVER['REQUEST_METHOD'];
        $data = [];
        
        // Parse query parameters
        if (!empty($_GET)) {
            $data = array_merge($data, $_GET);
        }
        
        // Parse POST data
        if ($method === 'POST' && !empty($_POST)) {
            $data = array_merge($data, $_POST);
        }
        
        // Parse JSON data from request body
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $json = file_get_contents('php://input');
            $jsonData = json_decode($json, true);
            if ($jsonData) {
                $data = array_merge($data, $jsonData);
            }
        }
        
        return $data;
    }
    
    public function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    public function getJson() {
        $json = file_get_contents('php://input');
        return json_decode($json, true);
    }
    
    public function getQueryParams() {
        return $_GET;
    }
    
    public function getParam($key, $default = null) {
        return $this->data[$key] ?? $default;
    }
    
    public function has($key) {
        return isset($this->data[$key]);
    }
    
    public function all() {
        return $this->data;
    }
    
    public function only($keys) {
        if (is_string($keys)) {
            $keys = [$keys];
        }
        
        $data = [];
        foreach ($keys as $key) {
            if (isset($this->data[$key])) {
                $data[$key] = $this->data[$key];
            }
        }
        
        return $data;
    }
    
    public function except($keys) {
        if (is_string($keys)) {
            $keys = [$keys];
        }
        
        $data = $this->data;
        foreach ($keys as $key) {
            unset($data[$key]);
        }
        
        return $data;
    }
    
    public function getHeaders() {
        // 优先使用getallheaders函数，这是获取HTTP头的标准方法
        if (function_exists('getallheaders')) {
            return getallheaders();
        }
        
        // 备用方法：从$_SERVER提取头信息
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$header] = $value;
            } else if ($key === 'CONTENT_TYPE' || $key === 'CONTENT_LENGTH') {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower($key))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
    public function getHeader($key, $default = null) {
        $headers = $this->getHeaders();
        
        // 尝试直接匹配
        if (isset($headers[$key])) {
            return $headers[$key];
        }
        
        // 尝试不区分大小写的匹配
        foreach ($headers as $headerKey => $headerValue) {
            if (strtolower($headerKey) === strtolower($key)) {
                return $headerValue;
            }
        }
        
        return $default;
    }
    
    public function getBearerToken() {
        // 首先尝试从getallheaders中获取原始Authorization头
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    if (strpos($value, 'Bearer ') === 0) {
                        return substr($value, 7);
                    }
                }
            }
        }
        
        // 然后尝试从$_SERVER中获取
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        
        // Apache可能传递不带HTTP_前缀的Authorization头
        if (isset($_SERVER['Authorization'])) {
            $authHeader = $_SERVER['Authorization'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        
        // 最后尝试从URL参数中获取token
        if (isset($_GET['token'])) {
            return $_GET['token'];
        }
        
        return null;
    }
} 