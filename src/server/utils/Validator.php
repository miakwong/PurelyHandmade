<?php
namespace Utils;

class Validator {
    private $errors = [];
    private $data = [];
    private $rules = [];
    
    public function __construct($data = [], $rules = []) {
        $this->data = $data;
        $this->rules = $rules;
    }
    
    public function validate($data = null, $rules = null) {
        if ($data !== null) {
            $this->data = $data;
        }
        
        if ($rules !== null) {
            $this->rules = $rules;
        }
        
        $this->errors = [];
        
        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            
            foreach ($rules as $rule) {
                // Check if rule has parameters
                if (strpos($rule, ':') !== false) {
                    list($ruleName, $ruleParams) = explode(':', $rule, 2);
                    $params = explode(',', $ruleParams);
                } else {
                    $ruleName = $rule;
                    $params = [];
                }
                
                $methodName = 'validate' . ucfirst($ruleName);
                
                if (method_exists($this, $methodName)) {
                    $value = $this->getValue($field);
                    
                    if (!$this->$methodName($value, $field, $params)) {
                        break; // Stop validating this field once an error is found
                    }
                }
            }
        }
        
        return empty($this->errors);
    }
    
    public function getErrors() {
        return $this->errors;
    }
    
    private function getValue($field) {
        if (strpos($field, '.') !== false) {
            // Handle nested fields (e.g. user.email)
            $keys = explode('.', $field);
            $value = $this->data;
            
            foreach ($keys as $key) {
                if (!isset($value[$key])) {
                    return null;
                }
                $value = $value[$key];
            }
            
            return $value;
        }
        
        return $this->data[$field] ?? null;
    }
    
    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        
        $this->errors[$field][] = $message;
    }
    
    // Validation rules
    
    private function validateRequired($value, $field) {
        if ($value === null || $value === '') {
            $this->addError($field, "$field is required");
            return false;
        }
        
        return true;
    }
    
    private function validateEmail($value, $field) {
        if (empty($value)) {
            return true; // Skip validation if empty (use required rule to check for empty)
        }
        
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "$field must be a valid email address");
            return false;
        }
        
        return true;
    }
    
    private function validateMin($value, $field, $params) {
        if (empty($value)) {
            return true;
        }
        
        $min = (int) $params[0];
        
        if (is_string($value) && strlen($value) < $min) {
            $this->addError($field, "$field must be at least $min characters");
            return false;
        } elseif (is_numeric($value) && $value < $min) {
            $this->addError($field, "$field must be at least $min");
            return false;
        }
        
        return true;
    }
    
    private function validateMax($value, $field, $params) {
        if (empty($value)) {
            return true;
        }
        
        $max = (int) $params[0];
        
        if (is_string($value) && strlen($value) > $max) {
            $this->addError($field, "$field must not exceed $max characters");
            return false;
        } elseif (is_numeric($value) && $value > $max) {
            $this->addError($field, "$field must not exceed $max");
            return false;
        }
        
        return true;
    }
    
    private function validateNumeric($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (!is_numeric($value)) {
            $this->addError($field, "$field must be a number");
            return false;
        }
        
        return true;
    }
    
    private function validateInteger($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (!filter_var($value, FILTER_VALIDATE_INT)) {
            $this->addError($field, "$field must be an integer");
            return false;
        }
        
        return true;
    }
    
    private function validateAlpha($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (!ctype_alpha($value)) {
            $this->addError($field, "$field must contain only letters");
            return false;
        }
        
        return true;
    }
    
    private function validateAlphanum($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (!ctype_alnum($value)) {
            $this->addError($field, "$field must contain only letters and numbers");
            return false;
        }
        
        return true;
    }
    
    private function validateBoolean($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (!is_bool($value) && $value !== '0' && $value !== '1' && $value !== 0 && $value !== 1) {
            $this->addError($field, "$field must be a boolean value");
            return false;
        }
        
        return true;
    }
    
    private function validateDate($value, $field) {
        if (empty($value)) {
            return true;
        }
        
        if (strtotime($value) === false) {
            $this->addError($field, "$field must be a valid date");
            return false;
        }
        
        return true;
    }
    
    private function validateIn($value, $field, $params) {
        if (empty($value)) {
            return true;
        }
        
        if (!in_array($value, $params)) {
            $allowed = implode(', ', $params);
            $this->addError($field, "$field must be one of: $allowed");
            return false;
        }
        
        return true;
    }
    
    private function validateConfirmed($value, $field) {
        $confirmation = $this->getValue("$field" . '_confirmation');
        
        if ($confirmation === null || $value !== $confirmation) {
            $this->addError($field, "$field confirmation does not match");
            return false;
        }
        
        return true;
    }
    
    // Helper validation methods
    
    public static function validateEmail_($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function validatePassword_($password) {
        // Password must be at least 8 characters with at least one uppercase letter,
        // one lowercase letter, one number, and one special character
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/', $password);
    }
    
    public static function validateUsername_($username) {
        // Username must be 3-20 characters and contain only letters, numbers, and underscores
        return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
    }
    
    public static function validatePhone_($phone) {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Check if phone number is valid (10-15 digits)
        return strlen($phone) >= 10 && strlen($phone) <= 15;
    }
} 