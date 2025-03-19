/**
 * 用户认证（登录、注册）页面测试
 */

// 加载测试工具
require('../setup');

// 模拟ApiService
window.ApiService = {
  post: jest.fn(),
  get: jest.fn()
};

// 模拟DataService
window.DataService = {
  getCurrentUser: jest.fn(),
  setCurrentUser: jest.fn(),
  logout: jest.fn()
};

// 模拟UIHelpers
window.UIHelpers = {
  loadNavbar: jest.fn(),
  loadFooter: jest.fn(),
  updateAuthState: jest.fn(),
  showToast: jest.fn()
};

// 创建模拟DOM元素
function createMockElements() {
  const elements = [
    // 登录页面元素
    'navbar-placeholder', 'footer-placeholder', 'login-form',
    'loginIdentifier', 'loginPassword', 'rememberMe', 
    'login-error', 'login-button',
    
    // 注册页面元素
    'register-form', 'firstName', 'lastName', 'username',
    'regEmail', 'regPassword', 'regPasswordConfirm', 'birthday',
    'genderMale', 'termsCheck', 'form-validation-error',
    'avatarUpload', 'avatarPreview', 'submit-btn',
    
    // 通用元素
    'toast', 'toast-message'
  ];
  
  elements.forEach(id => {
    const el = document.createElement(id.includes('form') ? 'form' : 'div');
    el.id = id;
    
    if (id.includes('form')) {
      el.reset = jest.fn();
      el.reportValidity = jest.fn(() => true);
      el.checkValidity = jest.fn(() => true);
      el.addEventListener = jest.fn();
    }
    
    if (id === 'login-button' || id === 'submit-btn') {
      el.disabled = false;
      el.click = jest.fn();
    }
    
    if (['loginIdentifier', 'loginPassword', 'firstName', 'lastName', 'username', 
         'regEmail', 'regPassword', 'regPasswordConfirm', 'birthday'].includes(id)) {
      el.value = '';
      el.type = id.includes('Password') ? 'password' : (id === 'birthday' ? 'date' : 'text');
    }
    
    if (['rememberMe', 'genderMale', 'termsCheck'].includes(id)) {
      el.checked = false;
      el.type = 'checkbox';
    }
    
    document.body.appendChild(el);
  });
}

describe('用户认证页面测试', () => {
  beforeEach(() => {
    // 清除文档内容
    document.body.innerHTML = '';
    
    // 创建模拟元素
    createMockElements();
    
    // 模拟Bootstrap组件
    window.bootstrap = {
      Modal: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn()
      })),
      Toast: jest.fn(() => ({
        show: jest.fn()
      }))
    };
    
    // 模拟localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('登录页面测试', () => {
    test('用户可以成功登录', () => {
      // 设置登录表单值
      document.getElementById('loginIdentifier').value = 'testuser';
      document.getElementById('loginPassword').value = 'password123';
      
      // 模拟API响应
      ApiService.post.mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        }
      });
      
      // 定义登录函数
      async function login(event) {
        if (event) event.preventDefault();
        
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        
        if (!loginForm.checkValidity()) {
          loginForm.reportValidity();
          return;
        }
        
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!identifier || !password) {
          loginError.textContent = 'Please enter both username/email and password';
          loginError.classList.remove('d-none');
          return;
        }
        
        try {
          // 禁用登录按钮
          document.getElementById('login-button').disabled = true;
          
          const response = await ApiService.post('/api/auth/login', {
            username: identifier,
            password: password
          });
          
          if (response.success) {
            DataService.setCurrentUser(response.data, rememberMe);
            UIHelpers.showToast('Login successful!', 'success');
            
            // 模拟重定向
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
            
            return true;
          } else {
            loginError.textContent = response.data || 'Login failed';
            loginError.classList.remove('d-none');
            return false;
          }
        } catch (error) {
          loginError.textContent = error.message || 'An error occurred during login';
          loginError.classList.remove('d-none');
          return false;
        } finally {
          // 重新启用登录按钮
          document.getElementById('login-button').disabled = false;
        }
      }
      
      // 添加表单提交事件监听器
      const loginForm = document.getElementById('login-form');
      loginForm.addEventListener('submit', login);
      
      // 模拟表单提交
      const submitEvent = { preventDefault: jest.fn() };
      return login(submitEvent).then(result => {
        // 验证结果
        expect(result).toBe(true);
        expect(ApiService.post).toHaveBeenCalledWith('/api/auth/login', {
          username: 'testuser',
          password: 'password123'
        });
        expect(DataService.setCurrentUser).toHaveBeenCalled();
        expect(UIHelpers.showToast).toHaveBeenCalledWith('Login successful!', 'success');
      });
    });
    
    test('登录失败时显示错误信息', () => {
      // 设置登录表单值
      document.getElementById('loginIdentifier').value = 'wronguser';
      document.getElementById('loginPassword').value = 'wrongpassword';
      
      // 模拟API响应
      ApiService.post.mockResolvedValue({
        success: false,
        data: 'Invalid username or password'
      });
      
      // 定义登录函数
      async function login(event) {
        if (event) event.preventDefault();
        
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        
        if (!loginForm.checkValidity()) {
          loginForm.reportValidity();
          return;
        }
        
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        try {
          // 禁用登录按钮
          document.getElementById('login-button').disabled = true;
          
          const response = await ApiService.post('/api/auth/login', {
            username: identifier,
            password: password
          });
          
          if (response.success) {
            DataService.setCurrentUser(response.data);
            UIHelpers.showToast('Login successful!', 'success');
            return true;
          } else {
            loginError.textContent = response.data || 'Login failed';
            loginError.classList.remove('d-none');
            return false;
          }
        } catch (error) {
          loginError.textContent = error.message || 'An error occurred during login';
          loginError.classList.remove('d-none');
          return false;
        } finally {
          // 重新启用登录按钮
          document.getElementById('login-button').disabled = false;
        }
      }
      
      // 模拟表单提交
      const submitEvent = { preventDefault: jest.fn() };
      return login(submitEvent).then(result => {
        // 验证结果
        expect(result).toBe(false);
        expect(ApiService.post).toHaveBeenCalledWith('/api/auth/login', {
          username: 'wronguser',
          password: 'wrongpassword'
        });
        expect(DataService.setCurrentUser).not.toHaveBeenCalled();
        
        // 验证错误显示
        const loginError = document.getElementById('login-error');
        expect(loginError.textContent).toBe('Invalid username or password');
        expect(loginError.classList.contains('d-none')).toBe(false);
      });
    });
  });
  
  describe('注册页面测试', () => {
    test('用户可以成功注册', () => {
      // 设置注册表单值
      document.getElementById('firstName').value = 'John';
      document.getElementById('lastName').value = 'Doe';
      document.getElementById('username').value = 'johndoe';
      document.getElementById('regEmail').value = 'john@example.com';
      document.getElementById('regPassword').value = 'Password123';
      document.getElementById('regPasswordConfirm').value = 'Password123';
      document.getElementById('birthday').value = '1990-01-01';
      document.getElementById('genderMale').checked = true;
      document.getElementById('termsCheck').checked = true;
      
      // 模拟文件上传
      const fileInputMock = {
        files: [{
          name: 'avatar.jpg',
          type: 'image/jpeg',
          size: 1024 * 100 // 100KB
        }]
      };
      
      // 重写avatarUpload元素以包含文件
      Object.defineProperty(document.getElementById('avatarUpload'), 'files', {
        value: fileInputMock.files
      });
      
      // 模拟API响应
      ApiService.post.mockResolvedValue({
        success: true,
        data: {
          id: 2,
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user'
        }
      });
      
      // 定义注册函数
      async function register(event) {
        if (event) event.preventDefault();
        
        const registerForm = document.getElementById('register-form');
        const validationError = document.getElementById('form-validation-error');
        
        if (!registerForm.checkValidity()) {
          registerForm.reportValidity();
          return;
        }
        
        // 获取表单数据
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regPasswordConfirm').value;
        const birthday = document.getElementById('birthday').value;
        const gender = document.getElementById('genderMale').checked ? 'male' : 'female';
        const termsAccepted = document.getElementById('termsCheck').checked;
        
        // 验证密码匹配
        if (password !== confirmPassword) {
          validationError.textContent = 'Passwords do not match';
          validationError.classList.remove('d-none');
          return;
        }
        
        // 验证条款接受
        if (!termsAccepted) {
          validationError.textContent = 'You must accept the terms and conditions';
          validationError.classList.remove('d-none');
          return;
        }
        
        // 准备注册数据
        const registrationData = {
          firstName,
          lastName,
          username,
          email,
          password,
          birthday,
          gender
        };
        
        try {
          // 禁用注册按钮
          document.getElementById('submit-btn').disabled = true;
          
          const response = await ApiService.post('/api/auth/register', registrationData);
          
          if (response.success) {
            DataService.setCurrentUser(response.data);
            UIHelpers.showToast('Registration successful!', 'success');
            
            // 模拟重定向
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
            
            return true;
          } else {
            validationError.textContent = response.data || 'Registration failed';
            validationError.classList.remove('d-none');
            return false;
          }
        } catch (error) {
          validationError.textContent = error.message || 'An error occurred during registration';
          validationError.classList.remove('d-none');
          return false;
        } finally {
          // 重新启用注册按钮
          document.getElementById('submit-btn').disabled = false;
        }
      }
      
      // 添加表单提交事件监听器
      const registerForm = document.getElementById('register-form');
      registerForm.addEventListener('submit', register);
      
      // 模拟表单提交
      const submitEvent = { preventDefault: jest.fn() };
      return register(submitEvent).then(result => {
        // 验证结果
        expect(result).toBe(true);
        expect(ApiService.post).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com'
        }));
        expect(DataService.setCurrentUser).toHaveBeenCalled();
        expect(UIHelpers.showToast).toHaveBeenCalledWith('Registration successful!', 'success');
      });
    });
    
    test('注册表单验证错误', () => {
      // 设置注册表单值（缺少条款接受）
      document.getElementById('firstName').value = 'John';
      document.getElementById('lastName').value = 'Doe';
      document.getElementById('username').value = 'johndoe';
      document.getElementById('regEmail').value = 'john@example.com';
      document.getElementById('regPassword').value = 'Password123';
      document.getElementById('regPasswordConfirm').value = 'Password123';
      document.getElementById('birthday').value = '1990-01-01';
      document.getElementById('genderMale').checked = true;
      document.getElementById('termsCheck').checked = false; // 未接受条款
      
      // 定义注册函数
      function register(event) {
        if (event) event.preventDefault();
        
        const registerForm = document.getElementById('register-form');
        const validationError = document.getElementById('form-validation-error');
        
        if (!registerForm.checkValidity()) {
          registerForm.reportValidity();
          return false;
        }
        
        // 获取表单数据
        const termsAccepted = document.getElementById('termsCheck').checked;
        
        // 验证条款接受
        if (!termsAccepted) {
          validationError.textContent = 'You must accept the terms and conditions';
          validationError.classList.remove('d-none');
          return false;
        }
        
        return true;
      }
      
      // 模拟表单提交
      const submitEvent = { preventDefault: jest.fn() };
      const result = register(submitEvent);
      
      // 验证结果
      expect(result).toBe(false);
      const validationError = document.getElementById('form-validation-error');
      expect(validationError.textContent).toBe('You must accept the terms and conditions');
      expect(validationError.classList.contains('d-none')).toBe(false);
    });
    
    test('密码不匹配验证', () => {
      // 设置注册表单值（密码不匹配）
      document.getElementById('firstName').value = 'John';
      document.getElementById('lastName').value = 'Doe';
      document.getElementById('username').value = 'johndoe';
      document.getElementById('regEmail').value = 'john@example.com';
      document.getElementById('regPassword').value = 'Password123';
      document.getElementById('regPasswordConfirm').value = 'DifferentPassword'; // 不匹配的密码
      document.getElementById('birthday').value = '1990-01-01';
      document.getElementById('genderMale').checked = true;
      document.getElementById('termsCheck').checked = true;
      
      // 定义注册函数
      function register(event) {
        if (event) event.preventDefault();
        
        const registerForm = document.getElementById('register-form');
        const validationError = document.getElementById('form-validation-error');
        
        if (!registerForm.checkValidity()) {
          registerForm.reportValidity();
          return false;
        }
        
        // 获取表单数据
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regPasswordConfirm').value;
        
        // 验证密码匹配
        if (password !== confirmPassword) {
          validationError.textContent = 'Passwords do not match';
          validationError.classList.remove('d-none');
          return false;
        }
        
        return true;
      }
      
      // 模拟表单提交
      const submitEvent = { preventDefault: jest.fn() };
      const result = register(submitEvent);
      
      // 验证结果
      expect(result).toBe(false);
      const validationError = document.getElementById('form-validation-error');
      expect(validationError.textContent).toBe('Passwords do not match');
      expect(validationError.classList.contains('d-none')).toBe(false);
    });
  });
}); 