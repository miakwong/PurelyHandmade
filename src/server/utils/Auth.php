<?php
namespace Utils;

class Auth {
    private $secretKey;
    private $expiryTime;
    
    public function __construct() {
        $this->secretKey = $_ENV['JWT_SECRET'] ?? 'default-secret-key';
        $this->expiryTime = $_ENV['JWT_EXPIRY'] ?? '24h';
    }
    
    public function generateToken($userId) {
        // Create token header
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]);
        $header = $this->base64UrlEncode($header);
        
        // Calculate expiry time
        $expiry = $this->calculateExpiryTime();
        
        // Create token payload
        $payload = json_encode([
            'sub' => $userId,
            'iat' => time(),
            'exp' => $expiry
        ]);
        $payload = $this->base64UrlEncode($payload);
        
        // Create signature
        $signature = hash_hmac('sha256', "$header.$payload", $this->secretKey, true);
        $signature = $this->base64UrlEncode($signature);
        
        // Return complete token
        return "$header.$payload.$signature";
    }
    
    public function validateToken($token) {
        // Split token into parts
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Verify signature
        $verified = hash_hmac('sha256', "$header.$payload", $this->secretKey, true);
        $verified = $this->base64UrlEncode($verified);
        
        if ($signature !== $verified) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode($this->base64UrlDecode($payload), true);
        
        // Check if token has expired
        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            return false;
        }
        
        return true;
    }
    
    public function getUserIdFromToken($token) {
        if (!$this->validateToken($token)) {
            return null;
        }
        
        $parts = explode('.', $token);
        $payload = json_decode($this->base64UrlDecode($parts[1]), true);
        
        return $payload['sub'] ?? null;
    }
    
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    private function calculateExpiryTime() {
        $expiry = $this->expiryTime;
        $time = time();
        
        if (preg_match('/^(\d+)h$/', $expiry, $matches)) {
            $hours = (int) $matches[1];
            $time += $hours * 3600;
        } elseif (preg_match('/^(\d+)d$/', $expiry, $matches)) {
            $days = (int) $matches[1];
            $time += $days * 86400;
        } elseif (preg_match('/^(\d+)m$/', $expiry, $matches)) {
            $minutes = (int) $matches[1];
            $time += $minutes * 60;
        } else {
            // Default to 24 hours
            $time += 86400;
        }
        
        return $time;
    }
} 