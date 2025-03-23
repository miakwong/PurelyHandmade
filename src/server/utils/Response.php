<?php
namespace Utils;

class Response {
    public function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    public function success($data = [], $message = 'Success', $statusCode = 200) {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];
        
        $this->json($response, $statusCode);
    }
    
    public function error($message = 'Error', $statusCode = 400, $errors = []) {
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        
        $this->json($response, $statusCode);
    }
    
    public function unauthorized($message = 'Unauthorized access') {
        $this->error($message, 401);
    }
    
    public function forbidden($message = 'Forbidden access') {
        $this->error($message, 403);
    }
    
    public function notFound($message = 'Resource not found') {
        $this->error($message, 404);
    }
    
    public function badRequest($message = 'Bad request') {
        $this->error($message, 400);
    }
    
    public function validationError($errors = []) {
        $this->error('Validation error', 422, $errors);
    }
    
    public function serverError($message = 'Internal server error') {
        $this->error($message, 500);
    }
    
    public function redirect($url) {
        header("Location: $url");
        exit;
    }
    
    public function setHeader($key, $value) {
        header("$key: $value");
        return $this;
    }
    
    public function setStatusCode($code) {
        http_response_code($code);
        return $this;
    }
} 