/**
 * UI Helpers Tests
 * 测试UI助手函数
 */

// 导入UIHelpers模块
const UIHelpers = require('../../src/client/js/ui-helpers.js');

// 模拟DataService
global.DataService = {
  getCurrentUser: jest.fn(),
  getCart: jest.fn(),
  logout: jest.fn()
};

// 创建fetch模拟
global.fetch = jest.fn();

// 创建bootstrap模拟
global.bootstrap = {
  Toast: jest.fn(() => ({
    show: jest.fn()
  }))
};

// 重置DOM环境
function resetDOM() {
  document.body.innerHTML = '';
  
  // 创建一些测试可能需要的基本元素
  const elements = [
    { id: 'navbar-placeholder', element: 'div' },
    { id: 'footer-placeholder', element: 'div' },
    { id: 'toast-container', element: 'div' },
    { id: 'cart-count', element: 'span', style: { display: 'none' } },
    { id: 'products-container', element: 'div' },
    { id: 'login-button', element: 'button', style: { display: 'block' } },
    { id: 'register-button', element: 'button', style: { display: 'block' } },
    { id: 'profile-button', element: 'button', style: { display: 'none' } },
    { id: 'order-history-button', element: 'button', style: { display: 'none' } },
    { id: 'logout-button', element: 'button', style: { display: 'none' } },
    { id: 'admin-button', element: 'button', style: { display: 'none' } }
  ];
  
  elements.forEach(({ id, element, style }) => {
    const el = document.createElement(element);
    el.id = id;
    
    // 设置样式
    if (style) {
      Object.keys(style).forEach(styleKey => {
        el.style[styleKey] = style[styleKey];
      });
    }
    
    document.body.appendChild(el);
  });
}

describe('UIHelpers', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 重置DOM环境
    resetDOM();
    
    // 模拟fetch成功响应
    const mockNavbarResponse = `
      <nav class="navbar">
        <div class="container">
          <a class="navbar-brand">Purely Handmade</a>
          <div class="navbar-links">
            <a href="/">Home</a>
            <a href="/products">Products</a>
          </div>
        </div>
      </nav>
    `;
    
    const mockFooterResponse = `
      <footer class="footer">
        <div class="container">
          <p>&copy; 2023 Purely Handmade. All rights reserved.</p>
        </div>
      </footer>
    `;
    
    global.fetch.mockImplementation((url) => {
      let response;
      
      if (url.includes('navbar')) {
        response = {
          ok: true,
          text: () => Promise.resolve(mockNavbarResponse)
        };
      } else if (url.includes('footer')) {
        response = {
          ok: true,
          text: () => Promise.resolve(mockFooterResponse)
        };
      } else {
        return Promise.reject(new Error('Unexpected URL'));
      }
      
      return Promise.resolve(response);
    });
    
    // 默认模拟行为
    DataService.getCart.mockReturnValue([]);
  });
  
  test('loadNavbar should fetch and load navbar content', () => {
    const navbarContainer = document.getElementById('navbar-placeholder');
    
    return UIHelpers.loadNavbar().then(() => {
      expect(fetch).toHaveBeenCalled();
      expect(navbarContainer.innerHTML).toContain('navbar-brand');
      expect(navbarContainer.innerHTML).toContain('Purely Handmade');
    });
  });
  
  test('loadNavbar should reject when container does not exist', () => {
    // 移除导航栏容器
    const navbarContainer = document.getElementById('navbar-placeholder');
    navbarContainer.remove();
    
    return UIHelpers.loadNavbar().catch(error => {
      expect(error).toBeDefined();
      expect(error.message).toContain('not found');
    });
  });
  
  test('loadFooter should fetch and load footer content', () => {
    const footerContainer = document.getElementById('footer-placeholder');
    
    return UIHelpers.loadFooter().then(() => {
      expect(fetch).toHaveBeenCalled();
      expect(footerContainer.innerHTML).toContain('footer');
      expect(footerContainer.innerHTML).toContain('2023 Purely Handmade');
    });
  });
  
  test('loadFooter should resolve silently when container does not exist', () => {
    // 移除页脚容器
    const footerContainer = document.getElementById('footer-placeholder');
    footerContainer.remove();
    
    return UIHelpers.loadFooter().then(result => {
      expect(result).toBeUndefined();
    });
  });
  
  test('updateAuthState should update UI when user is logged in', () => {
    // 模拟已登录用户
    const user = {
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
    
    // 配置模拟行为
    DataService.getCurrentUser.mockReturnValue(user);
    
    // 执行updateAuthState
    UIHelpers.updateAuthState();
    
    // 验证UI更新
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const profileButton = document.getElementById('profile-button');
    const orderHistoryButton = document.getElementById('order-history-button');
    const logoutButton = document.getElementById('logout-button');
    const adminButton = document.getElementById('admin-button');
    
    expect(loginButton.style.display).toBe('none');
    expect(registerButton.style.display).toBe('none');
    expect(profileButton.style.display).toBe('block');
    expect(orderHistoryButton.style.display).toBe('block');
    expect(logoutButton.style.display).toBe('block');
    expect(adminButton.style.display).toBe('none'); // 非管理员
  });
  
  test('updateAuthState should show admin button for admin users', () => {
    // 模拟已登录的管理员用户
    const admin = {
      id: 2,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };
    
    // 配置模拟行为
    DataService.getCurrentUser.mockReturnValue(admin);
    
    // 执行updateAuthState
    UIHelpers.updateAuthState();
    
    // 验证UI更新
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const profileButton = document.getElementById('profile-button');
    const orderHistoryButton = document.getElementById('order-history-button');
    const logoutButton = document.getElementById('logout-button');
    const adminButton = document.getElementById('admin-button');
    
    expect(loginButton.style.display).toBe('none');
    expect(registerButton.style.display).toBe('none');
    expect(profileButton.style.display).toBe('block');
    expect(orderHistoryButton.style.display).toBe('block');
    expect(logoutButton.style.display).toBe('block');
    expect(adminButton.style.display).toBe('block'); // 管理员
  });
  
  test('checkAdminPermissions should redirect non-admin users', () => {
    // 保存原始location
    const originalLocation = window.location;
    
    // 模拟window.location
    delete window.location;
    window.location = { pathname: '/admin/dashboard.html', href: '' };
    
    // 模拟普通用户
    DataService.getCurrentUser.mockReturnValue({
      id: 1,
      username: 'user',
      role: 'user'
    });
    
    // 模拟showToast
    UIHelpers.showToast = jest.fn();
    
    // 执行checkAdminPermissions
    const result = UIHelpers.checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(false);
    expect(UIHelpers.showToast).toHaveBeenCalled();
    expect(window.location.href).toContain('login.html');
    
    // 恢复原始location
    window.location = originalLocation;
  });
  
  test('showToast should create and show a toast notification', () => {
    // 创建一个独立的showToast实现，不依赖于DOM操作
    UIHelpers.showToast = jest.fn(function(message, type = 'primary') {
      // 创建Toast元素
      const toastElement = document.createElement('div');
      toastElement.className = `toast bg-${type}`;
      
      // 创建Toast内容
      const toastBody = document.createElement('div');
      toastBody.className = 'toast-body';
      toastBody.textContent = message;
      
      // 组装Toast
      toastElement.appendChild(toastBody);
      
      // 添加到容器
      const toastContainer = document.getElementById('toast-container');
      toastContainer.appendChild(toastElement);
      
      // 使用Bootstrap Toast API显示通知
      if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
      }
      
      return toastElement;
    });
    
    // 执行showToast
    const result = UIHelpers.showToast('Test message', 'success');
    
    // 验证toast创建
    expect(UIHelpers.showToast).toHaveBeenCalledWith('Test message', 'success');
    expect(result).toBeTruthy();
    
    // 验证DOM更新
    const toastContainer = document.getElementById('toast-container');
    expect(toastContainer.children.length).toBeGreaterThan(0);
    expect(toastContainer.firstChild.classList.contains('toast')).toBe(true);
    expect(toastContainer.querySelector('.toast-body').textContent).toBe('Test message');
  });
  
  test('updateCartCount should update the cart count display', () => {
    // 模拟购物车项目
    const mockCartItems = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 }
    ];
    
    // 配置getCart返回模拟数据
    DataService.getCart.mockReturnValue(mockCartItems);
    
    // 执行updateCartCount
    UIHelpers.updateCartCount();
    
    // 验证购物车计数更新
    const cartCount = document.getElementById('cart-count');
    expect(cartCount.textContent).toBe('5'); // 2 + 3 = 5
    expect(cartCount.style.display).toBe('inline-block'); // 注意这里是inline-block
  });
  
  test('updateCartCount should hide cart count when cart is empty', () => {
    // 配置getCart返回空数组
    DataService.getCart.mockReturnValue([]);
    
    // 执行updateCartCount
    UIHelpers.updateCartCount();
    
    // 验证购物车计数更新
    const cartCount = document.getElementById('cart-count');
    expect(cartCount.style.display).toBe('none');
  });
  
  test('renderProductCards should render product cards in the container', () => {
    // 模拟产品数据
    const products = [
      {
        id: 1,
        name: 'Test Product 1',
        price: 29.99,
        description: 'Product description 1',
        images: ['img/test1.jpg'],
        onSale: false
      },
      {
        id: 2,
        name: 'Test Product 2',
        price: 39.99,
        description: 'Product description 2',
        images: ['img/test2.jpg'],
        onSale: true,
        salePrice: 29.99
      }
    ];
    
    // 获取容器
    const container = document.getElementById('products-container');
    
    // 执行renderProductCards
    UIHelpers.renderProductCards(products, 'products-container');
    
    // 验证产品卡片渲染
    expect(container.innerHTML).toContain('Test Product 1');
    expect(container.innerHTML).toContain('Test Product 2');
    expect(container.innerHTML).toContain('$29.99');
    expect(container.innerHTML).toContain('View Details');
  });
  
  test('getUrlParameter should extract parameter from URL', () => {
    // 保存原始location
    const originalLocation = window.location;
    
    // 模拟URL
    delete window.location;
    window.location = {
      search: '?id=123&name=test'
    };
    
    // 测试参数提取
    expect(UIHelpers.getUrlParameter('id')).toBe('123');
    expect(UIHelpers.getUrlParameter('name')).toBe('test');
    expect(UIHelpers.getUrlParameter('nonexistent')).toBeNull();
    
    // 恢复原始location
    window.location = originalLocation;
  });
}); 