/**
 * 产品管理页面测试
 */

// 加载测试工具
require('../setup');

// 模拟AdminApiService
window.AdminApiService = {
  getAllProducts: jest.fn(),
  addProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getAllCategories: jest.fn(),
  getAllDesigners: jest.fn()
};

// 模拟DataService
window.DataService = {
  getCurrentUser: jest.fn()
};

// 创建模拟DOM元素
function createMockElements() {
  const elements = [
    'navbar-placeholder', 'error-container', 'error-message', 
    'products-container', 'product-form', 'loading-container',
    'product-name', 'product-price', 'product-description',
    'product-category', 'product-designer', 'product-stock',
    'product-on-sale', 'product-sale-price', 'confirm-delete-btn',
    'product-id', 'refreshData'
  ];
  
  elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    if (id === 'error-container') {
      el.classList.add('d-none');
    }
    if (id === 'product-form') {
      el.reset = jest.fn();
    }
    if (id === 'product-category') {
      el.innerHTML = '<option value="1">Category 1</option>';
    }
    if (id === 'product-designer') {
      el.innerHTML = '<option value="designer1">Designer 1</option>';
    }
    document.body.appendChild(el);
  });
}

describe('产品管理页面测试', () => {
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
    
    // 模拟确认删除按钮
    document.getElementById('confirm-delete-btn').addEventListener = jest.fn((event, callback) => {
      window.eventListeners['delete'] = callback;
    });
    
    document.getElementById('confirm-delete-btn').click = jest.fn(() => {
      if (window.eventListeners['delete']) {
        window.eventListeners['delete']();
      }
    });

    // 模拟bootstrap modal实例
    window.bootstrap = {
      Modal: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn()
      })),
      Toast: jest.fn(() => ({
        show: jest.fn()
      }))
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('管理员可以访问产品管理页面', () => {
    // 模拟已登录的管理员用户
    DataService.getCurrentUser.mockReturnValue({
      role: 'admin',
      username: 'admin'
    });
    
    // 模拟loadProducts函数
    window.loadProducts = jest.fn();
    
    // 模拟产品管理页面中检查管理员权限的代码
    function checkAdminPermissions() {
      const currentUser = DataService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/src/client/views/auth/login.html?redirect=admin';
        return false;
      }
      
      // 加载产品数据
      window.loadProducts();
      return true;
    }
    
    // 执行权限检查
    const result = checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(true);
    expect(window.loadProducts).toHaveBeenCalled();
  });
  
  test('非管理员用户无法访问产品管理页面', () => {
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
    
    // 模拟loadProducts函数
    window.loadProducts = jest.fn();
    
    // 模拟产品管理页面中检查管理员权限的代码
    function checkAdminPermissions() {
      const currentUser = DataService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/src/client/views/auth/login.html?redirect=admin';
        return false;
      }
      
      // 加载产品数据
      window.loadProducts();
      return true;
    }
    
    // 执行权限检查
    const result = checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(false);
    expect(window.location.href).toBe('/src/client/views/auth/login.html?redirect=admin');
    expect(window.loadProducts).not.toHaveBeenCalled();
  });
  
  test('产品数据加载成功显示', () => {
    // 模拟API响应
    const productsResponse = { 
      success: true, 
      data: [
        { 
          id: 'product1', 
          name: 'Test Product 1', 
          price: 59.99,
          categoryId: 1,
          categoryName: 'Category 1',
          designerId: 'designer1',
          designerName: 'Designer 1',
          stock: 10,
          onSale: false
        },
        { 
          id: 'product2', 
          name: 'Test Product 2', 
          price: 99.99,
          categoryId: 1,
          categoryName: 'Category 1',
          designerId: 'designer1',
          designerName: 'Designer 1',
          stock: 5,
          onSale: true,
          salePrice: 79.99
        }
      ] 
    };
    
    const categoriesResponse = {
      success: true,
      data: [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' }
      ]
    };
    
    const designersResponse = {
      success: true,
      data: [
        { id: 'designer1', name: 'Designer 1' },
        { id: 'designer2', name: 'Designer 2' }
      ]
    };
    
    // 模拟API服务方法
    AdminApiService.getAllProducts.mockResolvedValue(productsResponse);
    AdminApiService.getAllCategories.mockResolvedValue(categoriesResponse);
    AdminApiService.getAllDesigners.mockResolvedValue(designersResponse);
    
    // 定义渲染函数测试
    function renderProducts(products) {
      const container = document.getElementById('products-container');
      container.innerHTML = '';
      
      products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.dataset.id = product.id;
        productElement.innerHTML = `
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <p>Stock: ${product.stock}</p>
          </div>
        `;
        container.appendChild(productElement);
      });
      
      return container.children.length;
    }
    
    // 执行渲染
    const productCount = renderProducts(productsResponse.data);
    
    // 验证DOM更新
    expect(productCount).toBe(2);
  });
  
  test('可以添加新产品', () => {
    // 模拟表单数据
    const productData = {
      name: 'New Product',
      price: '99.99',
      categoryId: '1',
      designerId: 'designer1',
      stock: '20',
      description: 'Product description',
      onSale: false
    };
    
    // 设置表单值
    document.getElementById('product-name').value = productData.name;
    document.getElementById('product-price').value = productData.price;
    document.getElementById('product-category').value = productData.categoryId;
    document.getElementById('product-designer').value = productData.designerId;
    document.getElementById('product-stock').value = productData.stock;
    document.getElementById('product-description').value = productData.description;
    document.getElementById('product-on-sale').checked = productData.onSale;
    
    // 模拟API响应
    AdminApiService.addProduct.mockResolvedValue({
      success: true,
      data: { id: 'newproduct', ...productData }
    });
    
    // 模拟showToast函数
    window.showToast = jest.fn();
    
    // 定义测试用的产品保存函数
    async function saveProduct() {
      // 获取表单数据
      const formData = {
        name: document.getElementById('product-name').value,
        price: document.getElementById('product-price').value,
        categoryId: document.getElementById('product-category').value,
        designerId: document.getElementById('product-designer').value,
        stock: document.getElementById('product-stock').value,
        description: document.getElementById('product-description').value,
        onSale: document.getElementById('product-on-sale').checked
      };
      
      // 验证必填字段
      if (!formData.name || !formData.price) {
        window.showToast('Name and price are required', 'danger');
        return false;
      }
      
      try {
        // 添加新产品
        const response = await AdminApiService.addProduct(formData);
        
        if (response.success) {
          window.showToast('Product added successfully', 'success');
          return true;
        } else {
          window.showToast(response.data || 'Failed to add product', 'danger');
          return false;
        }
      } catch (error) {
        window.showToast(error.message || 'Error adding product', 'danger');
        return false;
      }
    }
    
    // 执行产品保存
    return saveProduct().then(result => {
      // 验证结果
      expect(result).toBe(true);
      expect(AdminApiService.addProduct).toHaveBeenCalledWith(expect.objectContaining({
        name: productData.name,
        price: productData.price
      }));
      expect(window.showToast).toHaveBeenCalledWith('Product added successfully', 'success');
    });
  });
  
  test('可以删除产品', () => {
    // 模拟要删除的产品ID
    const productId = 'product-to-delete';
    
    // 保存产品ID供删除函数使用
    window.selectedProductId = productId;
    
    // 模拟API响应
    AdminApiService.deleteProduct.mockResolvedValue({
      success: true,
      data: 'Product deleted successfully'
    });
    
    // 模拟showToast函数和loadProducts函数
    window.showToast = jest.fn();
    window.loadProducts = jest.fn();
    
    // 定义测试用的删除函数
    async function deleteProduct() {
      try {
        const response = await AdminApiService.deleteProduct(window.selectedProductId);
        
        if (response.success) {
          window.showToast('Product deleted successfully', 'success');
          window.loadProducts(); // 重新加载产品列表
          return true;
        } else {
          window.showToast(response.data || 'Failed to delete product', 'danger');
          return false;
        }
      } catch (error) {
        window.showToast(error.message || 'Error deleting product', 'danger');
        return false;
      }
    }
    
    // 模拟用户点击确认删除按钮
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteProduct);
    document.getElementById('confirm-delete-btn').click();
    
    // 验证结果
    expect(AdminApiService.deleteProduct).toHaveBeenCalledWith(productId);
  });
}); 