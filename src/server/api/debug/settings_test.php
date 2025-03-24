<?php
require_once __DIR__ . '/../../bootstrap.php';

use Utils\Database;
use Utils\Response;
use Controllers\SettingsController;

// No authentication required for this debug endpoint
$response = new Response();

try {
    // Display debug info
    error_log("===== DEBUG: Settings Test Endpoint =====");
    
    // Check database connection
    $db = new Database();
    $db->connect();
    error_log("Database connected successfully");
    
    // Check if Settings table exists
    $tableExists = false;
    try {
        $result = $db->fetch("SHOW TABLES LIKE 'Settings'");
        $tableExists = !empty($result);
        error_log("Settings table exists check: " . ($tableExists ? "Yes" : "No"));
        
        if (!$tableExists) {
            // Create Settings table if it doesn't exist
            error_log("Creating Settings table...");
            $createTableSQL = "
                CREATE TABLE IF NOT EXISTS `Settings` (
                  `id` int NOT NULL AUTO_INCREMENT,
                  `key` varchar(191) NOT NULL,
                  `value` text,
                  `group` varchar(191) NOT NULL DEFAULT 'general',
                  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `group_key` (`group`, `key`)
                )
            ";
            $db->query($createTableSQL);
            error_log("Settings table created successfully");
        }
    } catch (Exception $e) {
        error_log("Error checking/creating Settings table: " . $e->getMessage());
    }
    
    // Try to insert a test setting directly
    error_log("Attempting direct test insert...");
    
    try {
        $now = date('Y-m-d H:i:s');
        $testInsertSQL = "INSERT INTO `Settings` (`key`, `value`, `group`, `updatedAt`) 
                           VALUES ('test_key', 'test_value', 'test_group', :now)
                           ON DUPLICATE KEY UPDATE `value` = 'test_value', `updatedAt` = :now";
        
        $result = $db->query($testInsertSQL, ['now' => $now]);
        error_log("Direct test insert result: " . ($result ? "Success" : "Failed"));
    } catch (Exception $e) {
        error_log("Error in direct test insert: " . $e->getMessage());
    }
    
    // Try using the controller
    error_log("Testing via SettingsController...");
    $settingsController = new SettingsController();
    
    $testData = [
        'test_group' => [
            'controller_test_key' => 'controller_test_value'
        ]
    ];
    
    $result = $settingsController->updateSettings($testData);
    error_log("Controller update result: " . print_r($result, true));
    
    // Return the results
    $response->success([
        'message' => 'Settings test completed - check server logs',
        'table_exists' => $tableExists,
        'controller_result' => $result
    ]);
    
} catch (Exception $e) {
    error_log("Exception in settings test: " . $e->getMessage());
    $response->serverError('Error testing settings: ' . $e->getMessage());
} 