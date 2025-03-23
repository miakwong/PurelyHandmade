<?php
/**
 * Bootstrap file for the PurelyHandmade backend API
 */

// Enable error reporting in development environment
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load environment variables from .env file
$dotenv = dirname(__DIR__, 2) . '/.env';
if (file_exists($dotenv)) {
    $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
            putenv(sprintf('%s=%s', $name, $value));
        }
    }
}

// Define constants
define('BASE_PATH', dirname(__DIR__, 2));
// Use HTTP as default scheme if not defined
$scheme = isset($_SERVER['REQUEST_SCHEME']) ? $_SERVER['REQUEST_SCHEME'] : 'http';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8000';
define('APP_URL', $scheme . '://' . $host);

// Set default timezone
date_default_timezone_set('UTC');

// Autoload classes
spl_autoload_register(function ($class) {
    $baseDir = __DIR__ . '/';
    $class = str_replace('\\', '/', $class);
    
    // Map class prefixes to directories
    $prefixes = [
        'Controllers' => 'controllers',
        'Models' => 'models',
        'Utils' => 'utils',
        'Middleware' => 'middleware'
    ];
    
    foreach ($prefixes as $prefix => $dir) {
        if (strpos($class, $prefix) === 0) {
            $file = $baseDir . $dir . '/' . substr($class, strlen($prefix) + 1) . '.php';
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
    
    // For classes without prefix, try direct mapping
    $file = $baseDir . strtolower($class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// Setup error handling
set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Helper function to get request method
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

// Helper function to get request path
function getRequestPath() {
    $path = $_SERVER['REQUEST_URI'];
    $position = strpos($path, '?');
    if ($position !== false) {
        $path = substr($path, 0, $position);
    }
    return $path;
} 