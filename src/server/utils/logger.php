<?php
/**
 * 日志工具函数
 * 提供简单的日志记录功能
 */

/**
 * 记录日志消息
 * @param string $message 日志消息
 * @param string $level 日志级别 (INFO, WARNING, ERROR, DEBUG)
 * @param string $file 可选的日志文件路径
 * @return bool 是否成功记录
 */
function logMessage($message, $level = 'INFO', $file = null) {
    // 如果未提供日志文件，使用默认路径
    if ($file === null) {
        $logDir = __DIR__ . '/../../logs';
        
        // 确保日志目录存在
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $file = $logDir . '/app_' . date('Y-m-d') . '.log';
    }
    
    // 格式化日志消息
    $formattedMessage = '[' . date('Y-m-d H:i:s') . '] [' . strtoupper($level) . '] ' . $message . PHP_EOL;
    
    // 写入日志文件
    $result = file_put_contents($file, $formattedMessage, FILE_APPEND);
    
    // 如果是错误级别，还可以输出到标准错误
    if (strtoupper($level) === 'ERROR') {
        error_log($message);
    }
    
    return $result !== false;
}

/**
 * 记录信息日志
 * @param string $message 日志消息
 * @return bool 是否成功记录
 */
function logInfo($message) {
    return logMessage($message, 'INFO');
}

/**
 * 记录警告日志
 * @param string $message 日志消息
 * @return bool 是否成功记录
 */
function logWarning($message) {
    return logMessage($message, 'WARNING');
}

/**
 * 记录错误日志
 * @param string $message 日志消息
 * @return bool 是否成功记录
 */
function logError($message) {
    return logMessage($message, 'ERROR');
}

/**
 * 记录调试日志
 * @param string $message 日志消息
 * @return bool 是否成功记录
 */
function logDebug($message) {
    return logMessage($message, 'DEBUG');
}
?> 