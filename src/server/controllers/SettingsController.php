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
            // 验证数据结构
            if (!is_array($data)) {
                return [
                    'success' => false,
                    'message' => 'Invalid data format'
                ];
            }
            
            // 处理设置数据
            $settingsData = [];
            
            foreach ($data as $group => $groupSettings) {
                if (!is_array($groupSettings)) {
                    // 如果组设置不是数组，尝试将其作为单个键值对处理
                    $settingsData[$group] = [];
                    
                    // 如果值不是数组，作为单个设置处理
                    if (is_scalar($groupSettings) || is_null($groupSettings)) {
                        // 使用默认键名
                        $settingsData[$group]['value'] = $groupSettings;
                    }
                } else {
                    // 标准格式：$data['group']['key'] = 'value'
                    $settingsData[$group] = $groupSettings;
                }
            }
            
            // 批量保存设置
            $result = $this->settings->batchSet($settingsData);
            
            if ($result) {
                // 成功保存，返回更新后的设置
                $settings = $this->settings->getAll();
                
                return [
                    'success' => true,
                    'message' => 'Settings updated successfully',
                    'settings' => $settings
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to update settings'
                ];
            }
        } catch (\Exception $e) {
            $this->logger->error('Update settings failed', Logger::formatException($e));
            
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