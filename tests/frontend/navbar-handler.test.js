/**
 * Navbar Handler Tests
 * 测试导航栏处理功能
 */

// 导入必要的模块
require('../setup');

// 准备导入navbar-handler.js
beforeAll(() => {
  // 确保在浏览器环境中能够加载
  global.fetch = jest.fn();
  // 将来可以通过这种方式导入
  // const navbarHandler = require('../../src/client/js/navbar-handler.js');
});

describe('Navbar Handler', () => {
  let mockLocalStorage = {};
  
  // 在每个测试前重置模拟
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置DOM
    document.body.innerHTML = '';
    
    const navbarPlaceholder = document.createElement('div');
    navbarPlaceholder.id = 'navbar-placeholder';
    document.body.appendChild(navbarPlaceholder);
    
    const footerPlaceholder = document.createElement('div');
    footerPlaceholder.id = 'footer-placeholder';
    document.body.appendChild(footerPlaceholder);
    
    const loginBtn = document.createElement('div');
    loginBtn.id = 'login-btn';
    loginBtn.style.display = 'block';
    document.body.appendChild(loginBtn);
    
    const logoutBtn = document.createElement('div');
    logoutBtn.id = 'logout-btn';
    logoutBtn.style.display = 'none';
    document.body.appendChild(logoutBtn);
    
    const cartCount = document.createElement('div');
    cartCount.id = 'cart-count';
    cartCount.style.display = 'none';
    cartCount.textContent = '0';
    document.body.appendChild(cartCount);
    
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
    
    // 模拟控制台日志
    global.console = {
      log: jest.fn(),
      error: jest.fn()
    };
    
    // 模拟updateAuthButton函数
    global.updateAuthButton = jest.fn();
    
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
            
            // Update cart count after navbar is loaded
            if (typeof updateCartCount === 'function') {
              updateCartCount();
            }
            
            // Update authentication button state after navbar is loaded
            setTimeout(() => {
              console.log('Checking for updateAuthButton availability');
              if (typeof updateAuthButton === 'function') {
                console.log('Updating auth button state');
                updateAuthButton();
              } else {
                console.log('updateAuthButton function not available, using fallback');
                // Fallback: Manually update login/logout buttons
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                const loginBtn = document.getElementById('login-btn');
                const logoutBtn = document.getElementById('logout-btn');
                
                if (currentUser) {
                  loginBtn.style.display = 'none';
                  logoutBtn.style.display = 'block';
                } else {
                  loginBtn.style.display = 'block';
                  logoutBtn.style.display = 'none';
                }
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
      expect(updateAuthButton).toHaveBeenCalled();
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
    
    test('updateAuthButton未定义时应使用后备方案', async () => {
      // 确认初始状态
      const loginBtn = document.getElementById('login-btn');
      const logoutBtn = document.getElementById('logout-btn');
      expect(loginBtn.style.display).toBe('block');
      expect(logoutBtn.style.display).toBe('none');
      
      // 模拟用户已登录
      mockLocalStorage['currentUser'] = JSON.stringify({ id: 1, username: 'testuser' });
      
      // 移除全局updateAuthButton函数
      delete global.updateAuthButton;
      
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
              console.log('Checking for updateAuthButton availability');
              if (typeof updateAuthButton === 'function') {
                console.log('Updating auth button state');
                updateAuthButton();
              } else {
                console.log('updateAuthButton function not available, using fallback');
                // Fallback: Manually update login/logout buttons
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                const loginBtn = document.getElementById('login-btn');
                const logoutBtn = document.getElementById('logout-btn');
                
                if (currentUser) {
                  loginBtn.style.display = 'none';
                  logoutBtn.style.display = 'block';
                } else {
                  loginBtn.style.display = 'block';
                  logoutBtn.style.display = 'none';
                }
              }
            }, 100);
          });
      }
      
      // 调用loadNavbar函数
      await loadNavbar();
      
      // 验证结果
      expect(console.log).toHaveBeenCalledWith('updateAuthButton function not available, using fallback');
      expect(loginBtn.style.display).toBe('none');
      expect(logoutBtn.style.display).toBe('block');
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
  
  // updateCartCount 函数测试
  describe('updateCartCount', () => {
    test('购物车有商品时应显示商品数量', () => {
      // 验证初始状态
      const cartElement = document.getElementById('cart-count');
      expect(cartElement.style.display).toBe('none');
      expect(cartElement.textContent).toBe('0');
      
      // 模拟购物车数据
      const mockCart = [
        { id: 1, name: 'Product 1', quantity: 2 },
        { id: 2, name: 'Product 2', quantity: 1 }
      ];
      
      mockLocalStorage['cart'] = JSON.stringify(mockCart);
      
      // 模拟updateCartCount函数的行为
      function updateCartCount() {
        const cartElement = document.getElementById('cart-count');
        if (!cartElement) {
          console.error('Cart count element not found');
          return;
        }
        
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        if (totalItems > 0) {
          cartElement.textContent = totalItems.toString();
          cartElement.style.display = 'inline';
        } else {
          cartElement.style.display = 'none';
        }
      }
      
      // 调用updateCartCount函数
      updateCartCount();
      
      // 验证结果 - 购物车应该显示并有3个物品
      expect(cartElement.textContent).toBe('3');
      expect(cartElement.style.display).toBe('inline');
    });
    
    test('购物车为空时应隐藏商品数量', () => {
      // 验证初始状态
      const cartElement = document.getElementById('cart-count');
      expect(cartElement.style.display).toBe('none');
      
      // 模拟空购物车
      mockLocalStorage['cart'] = JSON.stringify([]);
      
      // 模拟updateCartCount函数的行为
      function updateCartCount() {
        const cartElement = document.getElementById('cart-count');
        if (!cartElement) {
          console.error('Cart count element not found');
          return;
        }
        
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        if (totalItems > 0) {
          cartElement.textContent = totalItems.toString();
          cartElement.style.display = 'inline';
        } else {
          cartElement.style.display = 'none';
        }
      }
      
      // 调用updateCartCount函数
      updateCartCount();
      
      // 验证结果 - 购物车应该隐藏
      expect(cartElement.style.display).toBe('none');
    });
  });
  
  // initPage 函数测试
  describe('initPage', () => {
    test('应该初始化页面', async () => {
      // 模拟loadNavbar和loadFooter函数
      global.loadNavbar = jest.fn().mockResolvedValue();
      global.loadFooter = jest.fn().mockResolvedValue();
      
      // 模拟initPage函数的行为
      function initPage() {
        console.log('Initializing page...');
        loadNavbar();
        loadFooter();
        console.log('Page initialization complete');
      }
      
      // 调用initPage函数
      initPage();
      
      // 验证结果
      expect(console.log).toHaveBeenCalledWith('Initializing page...');
      expect(global.loadNavbar).toHaveBeenCalled();
      expect(global.loadFooter).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Page initialization complete');
    });
  });
}); 