<?php
namespace Utils;

class Logger {
    private $logFile;
    private $dateFormat = 'Y-m-d H:i:s';
    
    public function __construct($logFileName = null) {
        if ($logFileName === null) {
            $logFileName = 'app.log';
        }
        
        $this->logFile = dirname(__DIR__, 3) . '/logs/' . $logFileName;
        
        // Create logs directory if it doesn't exist
        $logsDir = dirname($this->logFile);
        if (!is_dir($logsDir)) {
            mkdir($logsDir, 0777, true);
        }
    }
    
    public function info($message, $context = []) {
        $this->log('INFO', $message, $context);
    }
    
    public function error($message, $context = []) {
        $this->log('ERROR', $message, $context);
    }
    
    public function warning($message, $context = []) {
        $this->log('WARNING', $message, $context);
    }
    
    public function debug($message, $context = []) {
        $this->log('DEBUG', $message, $context);
    }
    
    private function log($level, $message, $context = []) {
        $date = date($this->dateFormat);
        $contextString = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[$date] [$level] $message$contextString" . PHP_EOL;
        
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
    }
    
    public static function formatException(\Throwable $exception) {
        return [
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ];
    }
} 