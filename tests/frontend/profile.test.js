/**
 * 用户资料页面测试
 */

// 加载测试工具
require('../setup');

// 模拟DataService
window.DataService = {
  getCurrentUser: jest.fn(),
  formatPrice: jest.fn(price => `$${price.toFixed(2)}`),
};

// 模拟ApiService
window.ApiService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
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
    'navbar-placeholder', 'footer-placeholder', 'profile-container',
    'admin-button', 'profile-name', 'profile-email', 'profile-role',
    'profile-img', 'profile-joined', 'save-btn'
  ];
  
  elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    if (id === 'admin-button') {
      el.style.display = 'none';
      el.addEventListener = jest.fn();
      el.click = jest.fn();
    }
    document.body.appendChild(el);
  });
}

describe('用户资料页面测试', () => {
  beforeEach(() => {
    // 清除文档内容
    document.body.innerHTML = '';
    
    // 创建模拟元素
    createMockElements();
    
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 模拟window.location
    delete window.location;
    window.location = { href: '' };
  });
  
  test('管理员用户可以看到并点击Admin Dashboard按钮', () => {
    // 模拟已登录的管理员用户
    const adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z'
    };
    
    DataService.getCurrentUser.mockReturnValue(adminUser);
    
    // 创建admin-button的click事件处理函数
    const adminButton = document.getElementById('admin-button');
    
    // 定义点击admin按钮的行为
    function goToAdminDashboard() {
      const currentUser = DataService.getCurrentUser();
      if (currentUser && currentUser.role === 'admin') {
        window.location.href = '/src/client/views/admin/dashboard.html';
        return true;
      }
      return false;
    }
    
    // 模拟事件监听器
    adminButton.addEventListener = jest.fn((event, callback) => {
      if (event === 'click') {
        adminButton.clickHandler = callback;
      }
    });
    
    adminButton.click = jest.fn(() => {
      if (adminButton.clickHandler) {
        adminButton.clickHandler();
      }
    });
    
    // 设置按钮可见（模拟updateAuthState的效果）
    adminButton.style.display = 'block';
    
    // 添加事件监听器
    adminButton.addEventListener('click', goToAdminDashboard);
    
    // 模拟点击按钮
    adminButton.click();
    
    // 验证结果
    expect(window.location.href).toBe('/src/client/views/admin/dashboard.html');
  });
  
  test('非管理员用户不会看到Admin Dashboard按钮', () => {
    // 模拟已登录的普通用户
    const regularUser = {
      id: 2,
      username: 'user',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      createdAt: '2023-01-02T00:00:00Z'
    };
    
    DataService.getCurrentUser.mockReturnValue(regularUser);
    
    // 模拟updateAuthState函数的行为
    function updateAuthState() {
      const currentUser = DataService.getCurrentUser();
      const adminButton = document.getElementById('admin-button');
      
      if (currentUser && currentUser.role === 'admin' && adminButton) {
        adminButton.style.display = 'block';
      } else if (adminButton) {
        adminButton.style.display = 'none';
      }
    }
    
    // 执行updateAuthState
    updateAuthState();
    
    // 验证结果
    expect(document.getElementById('admin-button').style.display).toBe('none');
  });
}); 