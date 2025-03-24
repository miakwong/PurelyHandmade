<?php
namespace Models;

use Utils\Database;

class Settings {
    private $db;
    private $table = '`Settings`';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Get all settings
     * @param string|null $group setting group, can be null for all groups
     * @return array settings data
     */
    public function getAll($group = null) {
        $whereClause = '';
        $params = [];
        
        if ($group !== null) {
            $whereClause = 'WHERE `group` = :group';
            $params['group'] = $group;
        }
        
        $sql = "SELECT * FROM {$this->table} $whereClause ORDER BY `group`, `key`";
        $settings = $this->db->fetchAll($sql, $params);
        
        // Convert results to an associative array grouped by group
        $result = [];
        foreach ($settings as $setting) {
            $groupName = $setting['group'];
            $key = $setting['key'];
            
            if (!isset($result[$groupName])) {
                $result[$groupName] = [];
            }
            
            $result[$groupName][$key] = [
                'id' => $setting['id'],
                'value' => $setting['value'],
                'updatedAt' => $setting['updatedAt']
            ];
        }
        
        return $result;
    }
    
    /**
     * Get the value of a specific setting key
     * @param string $key setting key
     * @param string $group setting group
     * @param mixed $default default value
     * @return mixed setting value or default value
     */
    public function get($key, $group = 'general', $default = null) {
        $sql = "SELECT * FROM {$this->table} WHERE `key` = :key AND `group` = :group";
        $setting = $this->db->fetch($sql, ['key' => $key, 'group' => $group]);
        
        return $setting ? $setting['value'] : $default;
    }
    
    /**
     * Save setting value
     * @param string $key setting key
     * @param mixed $value setting value
     * @param string $group setting group
     * @return bool whether successful
     */
    public function set($key, $value, $group = 'general') {
        try {
            error_log("Setting::set called for $group/$key");
            
            // Check if key and group are valid
            if (empty($key) || !is_string($key)) {
                error_log("Invalid key: " . print_r($key, true));
                return false;
            }
            
            if (empty($group) || !is_string($group)) {
                error_log("Invalid group: " . print_r($group, true));
                return false;
            }
            
            // Ensure value is something that can be stored in a text field
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value);
            } elseif (!is_scalar($value) && !is_null($value)) {
                $value = "";
            }
            
            // Check if setting exists
            $sql = "SELECT id FROM {$this->table} WHERE `key` = :key AND `group` = :group";
            error_log("Executing SQL: $sql with key=$key, group=$group");
            
            $setting = $this->db->fetch($sql, ['key' => $key, 'group' => $group]);
            error_log("Fetch result: " . ($setting ? "Found existing setting with ID " . $setting['id'] : "No existing setting found"));
            
            $now = date('Y-m-d H:i:s');
            
            if ($setting) {
                // Update existing setting
                error_log("Updating existing setting id=" . $setting['id']);
                $result = $this->db->update(
                    $this->table,
                    ['value' => $value, 'updatedAt' => $now],
                    '`id` = :id',
                    ['id' => $setting['id']]
                );
                error_log("Update result: " . ($result ? "success" : "failed"));
                return $result;
            } else {
                // Create new setting
                error_log("Creating new setting");
                $result = $this->db->insert($this->table, [
                    'key' => $key,
                    'value' => $value,
                    'group' => $group,
                    'updatedAt' => $now
                ]);
                error_log("Insert result: " . ($result ? "success" : "failed"));
                return $result;
            }
        } catch (\Exception $e) {
            error_log("Exception in Setting::set: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }
    
    /**
     * Batch save settings
     * @param array $settings settings array ['group' => ['key' => 'value']]
     * @return bool whether successful
     */
    public function batchSet($settings) {
        $success = true;
        
        error_log("Settings model batchSet called with settings: " . print_r($settings, true));
        
        // Start transaction
        error_log("Starting transaction");
        $this->db->query('START TRANSACTION');
        
        try {
            foreach ($settings as $group => $groupSettings) {
                error_log("Processing group: $group with " . count($groupSettings) . " settings");
                
                foreach ($groupSettings as $key => $value) {
                    error_log("Saving setting $group/$key with value: " . substr(print_r($value, true), 0, 100) . (strlen(print_r($value, true)) > 100 ? "..." : ""));
                    
                    // Handle different value types
                    if (is_array($value)) {
                        error_log("Value is an array, converting to JSON");
                        $value = json_encode($value);
                    } elseif (is_object($value)) {
                        error_log("Value is an object, converting to JSON");
                        $value = json_encode($value);
                    } elseif (!is_scalar($value) && !is_null($value)) {
                        error_log("Value is not scalar or null: " . gettype($value));
                        // Use a default value if something strange comes in
                        $value = "";
                    }
                    
                    $result = $this->set($key, $value, $group);
                    error_log("Set result for $group/$key: " . ($result ? "success" : "failed"));
                    
                    if (!$result) {
                        $success = false;
                        error_log("Setting $group/$key failed, will rollback transaction");
                    }
                }
            }
            
            if ($success) {
                error_log("All settings saved successfully, committing transaction");
                $this->db->query('COMMIT');
            } else {
                error_log("Some settings failed to save, rolling back transaction");
                $this->db->query('ROLLBACK');
            }
        } catch (\Exception $e) {
            error_log("Exception in batchSet: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            $this->db->query('ROLLBACK');
            error_log("Transaction rolled back due to exception");
            $success = false;
        }
        
        return $success;
    }
    
    /**
     * Delete setting
     * @param string $key setting key
     * @param string $group setting group
     * @return bool whether successful
     */
    public function delete($key, $group = 'general') {
        return $this->db->delete(
            $this->table,
            '`key` = :key AND `group` = :group',
            ['key' => $key, 'group' => $group]
        );
    }
    
    /**
     * Delete a group of settings
     * @param string $group setting group
     * @return bool whether successful
     */
    public function deleteGroup($group) {
        return $this->db->delete(
            $this->table,
            '`group` = :group',
            ['group' => $group]
        );
    }
} 