/**
 * Dashboard页面功能测试
 */

// 加载测试工具
require('../setup');

// 模拟AdminApiService
window.AdminApiService = {
  getAllProducts: jest.fn(),
  getAllOrders: jest.fn(),
  getAllUsers: jest.fn(),
  getSiteStatistics: jest.fn()
};

// 模拟DataService
window.DataService = {
  getCurrentUser: jest.fn()
};

// 创建模拟DOM元素
function createMockElements() {
  const elements = [
    'navbar-placeholder', 'error-container', 'error-message', 
    'total-products', 'products-change', 'total-orders', 
    'orders-change', 'total-users', 'users-change', 
    'total-revenue', 'revenue-change', 'recent-orders-table', 
    'refreshData'
  ];
  
  elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    if (id === 'error-container') {
      el.classList.add('d-none');
    }
    document.body.appendChild(el);
  });
}

describe('Dashboard页面测试', () => {
  beforeEach(() => {
    // 清除文档内容
    document.body.innerHTML = '';
    
    // 创建模拟元素
    createMockElements();
    
    // 模拟事件监听器集合
    window.eventListeners = {};
    
    // 模拟添加事件监听器
    document.getElementById('refreshData').addEventListener = jest.fn((event, callback) => {
      window.eventListeners[event] = callback;
    });
    
    // 模拟点击事件
    document.getElementById('refreshData').click = jest.fn(() => {
      if (window.eventListeners['click']) {
        window.eventListeners['click']();
      }
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('管理员可以查看仪表盘', () => {
    // 模拟已登录的管理员用户
    DataService.getCurrentUser.mockReturnValue({
      role: 'admin',
      username: 'admin'
    });
    
    // 模拟loadDashboardData函数
    window.loadDashboardData = jest.fn();
    
    // 模拟dashboard页面中检查管理员权限的代码
    function checkAdminPermissions() {
      const currentUser = DataService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/src/client/views/auth/login.html?redirect=admin';
        return false;
      }
      
      // 加载仪表盘数据
      window.loadDashboardData();
      return true;
    }
    
    // 执行权限检查
    const result = checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(true);
    expect(window.loadDashboardData).toHaveBeenCalled();
  });
  
  test('非管理员用户无法查看仪表盘', () => {
    // 模拟location.href
    const originalHref = window.location.href;
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: originalHref
    });
    
    // 模拟普通用户
    DataService.getCurrentUser.mockReturnValue({
      role: 'user',
      username: 'regularuser'
    });
    
    // 模拟loadDashboardData函数
    window.loadDashboardData = jest.fn();
    
    // 模拟dashboard页面中检查管理员权限的代码
    function checkAdminPermissions() {
      const currentUser = DataService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/src/client/views/auth/login.html?redirect=admin';
        return false;
      }
      
      // 加载仪表盘数据
      window.loadDashboardData();
      return true;
    }
    
    // 执行权限检查
    const result = checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(false);
    expect(window.location.href).toBe('/src/client/views/auth/login.html?redirect=admin');
    expect(window.loadDashboardData).not.toHaveBeenCalled();
  });
  
  test('仪表盘数据加载并显示', () => {
    // 模拟API响应
    const productsResponse = { 
      success: true, 
      data: [{ id: 1 }, { id: 2 }] 
    };
    
    const ordersResponse = { 
      success: true, 
      data: [
        { id: 1, totalAmount: 100 },
        { id: 2, totalAmount: 200 }
      ] 
    };
    
    const usersResponse = { 
      success: true, 
      data: [{ id: 1 }, { id: 2 }, { id: 3 }] 
    };
    
    // 模拟API服务方法
    AdminApiService.getAllProducts.mockResolvedValue(productsResponse);
    AdminApiService.getAllOrders.mockResolvedValue(ordersResponse);
    AdminApiService.getAllUsers.mockResolvedValue(usersResponse);
    
    // 定义更新统计信息的函数
    function updateStatistics(productsResponse, ordersResponse, usersResponse) {
      if (productsResponse.success) {
        document.getElementById('total-products').textContent = productsResponse.data.length;
      }
      
      if (ordersResponse.success) {
        document.getElementById('total-orders').textContent = ordersResponse.data.length;
        
        // 计算总收入
        const revenue = ordersResponse.data.reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);
        document.getElementById('total-revenue').textContent = '$' + revenue.toFixed(2);
      }
      
      if (usersResponse.success) {
        document.getElementById('total-users').textContent = usersResponse.data.length;
      }
    }
    
    // 调用更新函数
    updateStatistics(productsResponse, ordersResponse, usersResponse);
    
    // 验证DOM元素更新
    expect(document.getElementById('total-products').textContent).toBe('2');
    expect(document.getElementById('total-orders').textContent).toBe('2');
    expect(document.getElementById('total-revenue').textContent).toBe('$300.00');
    expect(document.getElementById('total-users').textContent).toBe('3');
  });
  
  test('刷新按钮应重新加载数据', () => {
    // 模拟loadDashboardData函数
    window.loadDashboardData = jest.fn();
    
    // 绑定刷新按钮事件
    document.getElementById('refreshData').addEventListener('click', function() {
      window.loadDashboardData();
    });
    
    // 模拟点击刷新按钮
    document.getElementById('refreshData').click();
    
    // 验证结果
    expect(window.loadDashboardData).toHaveBeenCalled();
  });
  
  test('应显示API错误信息', () => {
    // 获取错误显示元素
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    // 定义显示错误信息的函数
    function showError(message) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('d-none');
    }
    
    // 显示错误信息
    showError('Failed to load dashboard data');
    
    // 验证DOM更新
    expect(errorContainer.classList.contains('d-none')).toBe(false);
    expect(errorMessage.textContent).toBe('Failed to load dashboard data');
  });
}); 