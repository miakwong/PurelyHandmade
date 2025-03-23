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
        // 检查设置是否已存在
        $sql = "SELECT id FROM {$this->table} WHERE `key` = :key AND `group` = :group";
        $setting = $this->db->fetch($sql, ['key' => $key, 'group' => $group]);
        
        $now = date('Y-m-d H:i:s');
        
        if ($setting) {
            // 更新现有设置
            return $this->db->update(
                $this->table,
                ['value' => $value, 'updatedAt' => $now],
                '`id` = :id',
                ['id' => $setting['id']]
            );
        } else {
            // 创建新设置
            return $this->db->insert($this->table, [
                'key' => $key,
                'value' => $value,
                'group' => $group,
                'updatedAt' => $now
            ]);
        }
    }
    
    /**
     * 批量保存设置
     * @param array $settings 设置数组 ['group' => ['key' => 'value']]
     * @return bool 是否成功
     */
    public function batchSet($settings) {
        $success = true;
        
        // 开始事务
        $this->db->query('START TRANSACTION');
        
        try {
            foreach ($settings as $group => $groupSettings) {
                foreach ($groupSettings as $key => $value) {
                    $result = $this->set($key, $value, $group);
                    if (!$result) {
                        $success = false;
                    }
                }
            }
            
            if ($success) {
                $this->db->query('COMMIT');
            } else {
                $this->db->query('ROLLBACK');
            }
        } catch (\Exception $e) {
            $this->db->query('ROLLBACK');
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