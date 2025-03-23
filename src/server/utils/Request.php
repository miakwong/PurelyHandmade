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
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
    public function getHeader($key, $default = null) {
        $headers = $this->getHeaders();
        $key = str_replace(' ', '-', ucwords(str_replace('-', ' ', strtolower($key))));
        return $headers[$key] ?? $default;
    }
    
    public function getBearerToken() {
        $headers = $this->getHeaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        
        return null;
    }
} 