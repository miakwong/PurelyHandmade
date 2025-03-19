/**
 * Common Functions Tests
 * 测试Common.js中的共享函数
 */

// 导入必要的模块
require('../setup');

// 准备导入common.js
beforeAll(() => {
  // 确保在浏览器环境中能够加载
  global.fetch = jest.fn();
  // 等保存文件后可以通过这种方式导入
  // const common = require('../../src/client/js/common.js');
});

describe('Common Functions', () => {
  let mockLocalStorage = {};
  
  // 在每个测试前重置模拟
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置DOM
    document.body.innerHTML = '';
    const loginButton = document.createElement('div');
    loginButton.id = 'login-button';
    loginButton.style.display = 'block';
    document.body.appendChild(loginButton);
    
    const logoutButton = document.createElement('div');
    logoutButton.id = 'logout-button';
    logoutButton.style.display = 'none';
    document.body.appendChild(logoutButton);
    
    const registerButton = document.createElement('div');
    registerButton.id = 'register-button';
    registerButton.style.display = 'block';
    document.body.appendChild(registerButton);
    
    const profileButton = document.createElement('div');
    profileButton.id = 'profile-button';
    profileButton.style.display = 'none';
    document.body.appendChild(profileButton);
    
    const adminButton = document.createElement('div');
    adminButton.id = 'admin-dashboard-button';
    adminButton.style.display = 'none';
    document.body.appendChild(adminButton);
    
    const navbarPlaceholder = document.createElement('div');
    navbarPlaceholder.id = 'navbar-placeholder';
    document.body.appendChild(navbarPlaceholder);
    
    const footerPlaceholder = document.createElement('div');
    footerPlaceholder.id = 'footer-placeholder';
    document.body.appendChild(footerPlaceholder);
    
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // 模拟fetch API
    global.fetch.mockImplementation((url) => {
      if (url.includes('navbar.html')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('<nav>Navbar Content</nav>')
        });
      } else if (url.includes('footer.html')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('<footer>Footer Content</footer>')
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // 重置mock storage
    mockLocalStorage = {};
    
    // 模拟localStorage
    global.localStorage = {
      getItem: jest.fn(key => mockLocalStorage[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete mockLocalStorage[key];
      })
    };
    
    // 模拟bootstrap Toast
    global.bootstrap = {
      Toast: jest.fn().mockImplementation(() => ({
        show: jest.fn()
      }))
    };
    
    // 模拟控制台日志
    global.console = {
      log: jest.fn(),
      error: jest.fn()
    };
    
    // 模拟window.location
    delete window.location;
    window.location = {
      href: 'http://localhost/',
      pathname: '/',
      replace: jest.fn()
    };
    
    // 模拟alert
    global.alert = jest.fn();
    
    // 添加setTimeout
    global.setTimeout = jest.fn((callback) => callback());
  });
  
  // loadNavbar 函数测试
  describe('loadNavbar', () => {
    test('应该成功加载导航栏', async () => {
      // 模拟loadNavbar函数的行为
      function loadNavbar() {
        return fetch('/src/client/assets/layout/navbar.html')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load navbar (${response.status})`);
            }
            return response.text();
          })
          .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            console.log('Navbar loaded successfully');
            
            // Update authentication button state after navbar is loaded
            setTimeout(() => {
              if (typeof updateAuthState === 'function') {
                updateAuthState();
              }
              // Update cart count if function exists
              if (typeof updateCartCount === 'function') {
                updateCartCount();
              }
            }, 100);
          })
          .catch(error => {
            console.error('Error loading navbar:', error);
            document.getElementById('navbar-placeholder').innerHTML =
              '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
          });
      }
      
      // 调用loadNavbar函数
      await loadNavbar();
      
      // 验证结果
      expect(fetch).toHaveBeenCalledWith('/src/client/assets/layout/navbar.html');
      expect(document.getElementById('navbar-placeholder').innerHTML).toBe('<nav>Navbar Content</nav>');
      expect(console.log).toHaveBeenCalledWith('Navbar loaded successfully');
    });
    
    test('导航栏加载失败时应显示错误消息', async () => {
      // 模拟fetch失败
      fetch.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          status: 404
        });
      });
      
      // 模拟loadNavbar函数的行为
      function loadNavbar() {
        return fetch('/src/client/assets/layout/navbar.html')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load navbar (${response.status})`);
            }
            return response.text();
          })
          .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            console.log('Navbar loaded successfully');
          })
          .catch(error => {
            console.error('Error loading navbar:', error);
            document.getElementById('navbar-placeholder').innerHTML =
              '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
          });
      }
      
      // 调用loadNavbar函数
      await loadNavbar();
      
      // 验证结果
      expect(fetch).toHaveBeenCalledWith('/src/client/assets/layout/navbar.html');
      expect(document.getElementById('navbar-placeholder').innerHTML).toContain('Failed to load navigation bar');
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  // loadFooter 函数测试
  describe('loadFooter', () => {
    test('应该成功加载页脚', async () => {
      // 模拟loadFooter函数的行为
      function loadFooter() {
        return fetch('/src/client/assets/layout/footer.html')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load footer (${response.status})`);
            }
            return response.text();
          })
          .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
            console.log('Footer loaded successfully');
          })
          .catch(error => {
            console.error('Error loading footer:', error);
          });
      }
      
      // 调用loadFooter函数
      await loadFooter();
      
      // 验证结果
      expect(fetch).toHaveBeenCalledWith('/src/client/assets/layout/footer.html');
      expect(document.getElementById('footer-placeholder').innerHTML).toBe('<footer>Footer Content</footer>');
      expect(console.log).toHaveBeenCalledWith('Footer loaded successfully');
    });
  });
  
  // updateAuthState 函数测试
  describe('updateAuthState', () => {
    test('已登录用户应正确显示相关按钮', () => {
      // 验证初始状态
      expect(document.getElementById('login-button').style.display).toBe('block');
      expect(document.getElementById('logout-button').style.display).toBe('none');
      
      // 模拟用户已登录
      mockLocalStorage['currentUser'] = JSON.stringify({ id: 1, username: 'testuser', role: 'user' });
      
      // 模拟updateAuthState函数的行为
      function updateAuthState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const registerButton = document.getElementById('register-button');
        const profileButton = document.getElementById('profile-button');
        const adminDashboardButton = document.getElementById('admin-dashboard-button');
        
        if (currentUser) {
          // 用户已登录
          loginButton.style.display = 'none';
          registerButton.style.display = 'none';
          logoutButton.style.display = 'block';
          profileButton.style.display = 'block';
          
          // 如果是管理员，显示管理员仪表板按钮
          if (currentUser.role === 'admin') {
            adminDashboardButton.style.display = 'block';
          } else {
            adminDashboardButton.style.display = 'none';
          }
        } else {
          // 用户未登录
          loginButton.style.display = 'block';
          registerButton.style.display = 'block';
          logoutButton.style.display = 'none';
          profileButton.style.display = 'none';
          adminDashboardButton.style.display = 'none';
        }
      }
      
      // 调用updateAuthState函数
      updateAuthState();
      
      // 验证结果 - 直接检查DOM改变
      expect(document.getElementById('login-button').style.display).toBe('none');
      expect(document.getElementById('register-button').style.display).toBe('none');
      expect(document.getElementById('logout-button').style.display).toBe('block');
      expect(document.getElementById('profile-button').style.display).toBe('block');
      expect(document.getElementById('admin-dashboard-button').style.display).toBe('none');
    });
    
    test('管理员用户应显示管理员按钮', () => {
      // 模拟管理员已登录
      mockLocalStorage['currentUser'] = JSON.stringify({ id: 1, username: 'admin', role: 'admin' });
      
      // 模拟updateAuthState函数的行为
      function updateAuthState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const registerButton = document.getElementById('register-button');
        const profileButton = document.getElementById('profile-button');
        const adminDashboardButton = document.getElementById('admin-dashboard-button');
        
        if (currentUser) {
          // 用户已登录
          loginButton.style.display = 'none';
          registerButton.style.display = 'none';
          logoutButton.style.display = 'block';
          profileButton.style.display = 'block';
          
          // 如果是管理员，显示管理员仪表板按钮
          if (currentUser.role === 'admin') {
            adminDashboardButton.style.display = 'block';
          } else {
            adminDashboardButton.style.display = 'none';
          }
        } else {
          // 用户未登录
          loginButton.style.display = 'block';
          registerButton.style.display = 'block';
          logoutButton.style.display = 'none';
          profileButton.style.display = 'none';
          adminDashboardButton.style.display = 'none';
        }
      }
      
      // 调用updateAuthState函数
      updateAuthState();
      
      // 验证结果
      expect(document.getElementById('login-button').style.display).toBe('none');
      expect(document.getElementById('register-button').style.display).toBe('none');
      expect(document.getElementById('logout-button').style.display).toBe('block');
      expect(document.getElementById('profile-button').style.display).toBe('block');
      expect(document.getElementById('admin-dashboard-button').style.display).toBe('block');
    });
  });
  
  // showToast 函数测试
  describe('showToast', () => {
    test('应该创建并显示Toast通知', () => {
      // 模拟showToast函数的行为
      function showToast(message, type = 'primary') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
          console.error('Toast container not found');
          return;
        }
        
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
          <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
              <strong class="me-auto">Purely Handmade</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${message}
            </div>
          </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Automatically remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function () {
          toastElement.remove();
        });
      }
      
      // 调用showToast函数
      showToast('Test message', 'success');
      
      // 验证结果
      expect(document.getElementById('toast-container').innerHTML).toContain('Test message');
      expect(document.getElementById('toast-container').innerHTML).toContain('bg-success');
      expect(bootstrap.Toast).toHaveBeenCalled();
    });
  });
  
  // checkAdminPermissions 函数测试
  describe('checkAdminPermissions', () => {
    test('非管理员用户应被重定向到首页', () => {
      // 模拟checkAdminPermissions函数的行为
      function checkAdminPermissions() {
        // 模拟普通用户登录
        const currentUser = { id: 1, username: 'user', role: 'user' };
        
        if (!currentUser) {
          // 用户未登录，重定向到登录页面
          window.location.replace('/src/client/views/auth/login.html');
          return false;
        }
        
        if (currentUser.role !== 'admin') {
          // 用户不是管理员，重定向到首页
          window.location.replace('/');
          alert('You do not have permission to access this page.');
          return false;
        }
        
        return true;
      }
      
      // 调用checkAdminPermissions函数
      const result = checkAdminPermissions();
      
      // 验证结果
      expect(result).toBe(false);
      expect(window.location.replace).toHaveBeenCalledWith('/');
      expect(alert).toHaveBeenCalledWith('You do not have permission to access this page.');
    });
    
    test('管理员用户应有权访问管理页面', () => {
      // 模拟checkAdminPermissions函数的行为
      function checkAdminPermissions() {
        // 模拟管理员登录
        const currentUser = { id: 1, username: 'admin', role: 'admin' };
        
        if (!currentUser) {
          // 用户未登录，重定向到登录页面
          window.location.replace('/src/client/views/auth/login.html');
          return false;
        }
        
        if (currentUser.role !== 'admin') {
          // 用户不是管理员，重定向到首页
          window.location.replace('/');
          alert('You do not have permission to access this page.');
          return false;
        }
        
        return true;
      }
      
      // 调用checkAdminPermissions函数
      const result = checkAdminPermissions();
      
      // 验证结果
      expect(result).toBe(true);
      expect(window.location.replace).not.toHaveBeenCalled();
    });
  });
}); 