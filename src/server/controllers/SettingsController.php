<?php
namespace Controllers;

use Models\Settings;
use Utils\Database;
use Utils\Logger;
use Utils\Validator;

class SettingsController {
    private $db;
    private $settings;
    private $logger;
    
    public function __construct() {
        $this->db = new Database();
        $this->db->connect();
        $this->settings = new Settings($this->db);
        $this->logger = new Logger('settings.log');
    }
    
    /**
     * 获取所有设置或特定组的设置
     * @param string|null $group 设置组
     * @return array 响应数据
     */
    public function getSettings($group = null) {
        try {
            $settings = $this->settings->getAll($group);
            
            // 如果指定组没有任何设置，返回空对象
            if ($group !== null && !isset($settings[$group])) {
                $settings[$group] = [];
            }
            
            return [
                'success' => true,
                'message' => 'Settings retrieved successfully',
                'settings' => $settings
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get settings failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to get settings: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 更新设置
     * @param array $data 设置数据
     * @return array 响应数据
     */
    public function updateSettings($data) {
        try {
            // Add more detailed debugging
            error_log("Settings update starting with data: " . print_r($data, true));
            
            // 验证数据结构
            if (!is_array($data)) {
                error_log("Settings data is not an array: " . gettype($data));
                return [
                    'success' => false,
                    'message' => 'Invalid data format: not an array'
                ];
            }
            
            // 处理设置数据
            $settingsData = [];
            
            foreach ($data as $group => $groupSettings) {
                error_log("Processing group: " . $group);
                
                if (!is_array($groupSettings)) {
                    // 如果组设置不是数组，尝试将其作为单个键值对处理
                    error_log("Group settings is not an array: " . gettype($groupSettings));
                    $settingsData[$group] = [];
                    
                    // 如果值不是数组，作为单个设置处理
                    if (is_scalar($groupSettings) || is_null($groupSettings)) {
                        // 使用默认键名
                        $settingsData[$group]['value'] = $groupSettings;
                    }
                } else {
                    // 标准格式：$data['group']['key'] = 'value'
                    error_log("Group settings is an array with " . count($groupSettings) . " items");
                    $settingsData[$group] = $groupSettings;
                }
            }
            
            // 批量保存设置
            error_log("Attempting to save settings: " . print_r($settingsData, true));
            
            try {
                $result = $this->settings->batchSet($settingsData);
                error_log("batchSet result: " . ($result ? "true" : "false"));
            } catch (\Exception $e) {
                error_log("Exception in batchSet: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
                throw $e;
            }
            
            if ($result) {
                // 成功保存，返回更新后的设置
                $settings = $this->settings->getAll();
                error_log("Settings updated successfully");
                
                return [
                    'success' => true,
                    'message' => 'Settings updated successfully',
                    'settings' => $settings
                ];
            } else {
                error_log("batchSet returned false - no database errors but update failed");
                return [
                    'success' => false,
                    'message' => 'Failed to update settings (no errors reported)'
                ];
            }
        } catch (\Exception $e) {
            $this->logger->error('Update settings failed', Logger::formatException($e));
            error_log("Exception in updateSettings: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 删除设置
     * @param string $key 设置键
     * @param string $group 设置组
     * @return array 响应数据
     */
    public function deleteSettings($key, $group = 'general') {
        try {
            // 如果键为null或空，且组不为空，则删除整个组
            if (empty($key) && !empty($group)) {
                $result = $this->settings->deleteGroup($group);
                $message = 'Settings group deleted successfully';
            } else {
                $result = $this->settings->delete($key, $group);
                $message = 'Setting deleted successfully';
            }
            
            if ($result) {
                return [
                    'success' => true,
                    'message' => $message
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to delete setting(s)'
                ];
            }
        } catch (\Exception $e) {
            $this->logger->error('Delete setting failed', Logger::formatException($e));
            
            return [
                'success' => false,
                'message' => 'Failed to delete setting(s): ' . $e->getMessage()
            ];
        }
    }
} 