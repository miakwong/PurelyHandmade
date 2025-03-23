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
     * 获取所有设置
     * @param string|null $group 设置组，可以为null表示获取所有组
     * @return array 设置数据
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
        
        // 将结果转换为按组分类的关联数组
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
     * 获取指定键的设置值
     * @param string $key 设置键
     * @param string $group 设置组
     * @param mixed $default 默认值
     * @return mixed 设置值或默认值
     */
    public function get($key, $group = 'general', $default = null) {
        $sql = "SELECT * FROM {$this->table} WHERE `key` = :key AND `group` = :group";
        $setting = $this->db->fetch($sql, ['key' => $key, 'group' => $group]);
        
        return $setting ? $setting['value'] : $default;
    }
    
    /**
     * 保存设置值
     * @param string $key 设置键
     * @param mixed $value 设置值
     * @param string $group 设置组
     * @return bool 是否成功
     */
    public function set($key, $value, $group = 'general') {
        try {
            error_log("Setting::set called for $group/$key");
            
            // 检查key和group是否合法
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
            
            // 检查设置是否已存在
            $sql = "SELECT id FROM {$this->table} WHERE `key` = :key AND `group` = :group";
            error_log("Executing SQL: $sql with key=$key, group=$group");
            
            $setting = $this->db->fetch($sql, ['key' => $key, 'group' => $group]);
            error_log("Fetch result: " . ($setting ? "Found existing setting with ID " . $setting['id'] : "No existing setting found"));
            
            $now = date('Y-m-d H:i:s');
            
            if ($setting) {
                // 更新现有设置
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
                // 创建新设置
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
     * 批量保存设置
     * @param array $settings 设置数组 ['group' => ['key' => 'value']]
     * @return bool 是否成功
     */
    public function batchSet($settings) {
        $success = true;
        
        error_log("Settings model batchSet called with settings: " . print_r($settings, true));
        
        // 开始事务
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
     * 删除设置
     * @param string $key 设置键
     * @param string $group 设置组
     * @return bool 是否成功
     */
    public function delete($key, $group = 'general') {
        return $this->db->delete(
            $this->table,
            '`key` = :key AND `group` = :group',
            ['key' => $key, 'group' => $group]
        );
    }
    
    /**
     * 删除一组设置
     * @param string $group 设置组
     * @return bool 是否成功
     */
    public function deleteGroup($group) {
        return $this->db->delete(
            $this->table,
            '`group` = :group',
            ['group' => $group]
        );
    }
} 