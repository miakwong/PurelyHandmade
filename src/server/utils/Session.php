<?php
namespace Utils;

class Session {
    private static $started = false;
    
    public static function start() {
        if (self::$started) {
            return;
        }
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        self::$started = true;
    }
    
    public static function get($key, $default = null) {
        self::start();
        return $_SESSION[$key] ?? $default;
    }
    
    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
    }
    
    public static function has($key) {
        self::start();
        return isset($_SESSION[$key]);
    }
    
    public static function remove($key) {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }
    
    public static function clear() {
        self::start();
        $_SESSION = [];
    }
    
    public static function destroy() {
        self::start();
        
        // Unset all session variables
        $_SESSION = [];
        
        // Delete the session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        
        // Destroy the session
        session_destroy();
        
        self::$started = false;
    }
    
    public static function regenerate() {
        self::start();
        session_regenerate_id(true);
    }
    
    public static function flash($key, $value = null) {
        self::start();
        
        if ($value === null) {
            // Retrieve the flash message then remove it
            $value = self::get($key);
            self::remove($key);
            return $value;
        } else {
            // Store a flash message
            self::set($key, $value);
        }
    }
    
    public static function all() {
        self::start();
        return $_SESSION;
    }
    
    public static function id() {
        self::start();
        return session_id();
    }
} 