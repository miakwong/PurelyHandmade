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
            @mkdir($logsDir, 0777, true);
        }

        // 尝试确保日志文件是可写的
        if (!file_exists($this->logFile)) {
            @touch($this->logFile);
            @chmod($this->logFile, 0666);
        } else if (!is_writable($this->logFile)) {
            @chmod($this->logFile, 0666);
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
        
        try {
            // 尝试写入日志文件
            if (is_writable($this->logFile) || !file_exists($this->logFile)) {
                @file_put_contents($this->logFile, $logMessage, FILE_APPEND);
            } else {
                // 如果不能写入，使用error_log作为备选
                error_log("Logger: 无法写入日志文件 {$this->logFile}. 消息: $logMessage");
            }
        } catch (\Exception $e) {
            // 捕获任何异常，确保日志失败不会影响应用程序
            error_log("Logger异常: " . $e->getMessage() . ". 尝试记录的消息: $logMessage");
        }
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