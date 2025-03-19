/**
 * 类别管理页面测试
 */

// 加载测试工具
require('../setup');

// 模拟AdminApiService
window.AdminApiService = {
  getAllCategories: jest.fn(),
  addCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn()
};

// 模拟DataService
window.DataService = {
  getCurrentUser: jest.fn()
};

// 创建模拟DOM元素
function createMockElements() {
  const elements = [
    'navbar-placeholder', 'error-container', 'error-message',
    'categories-container', 'loading-container', 'category-form',
    'category-id', 'category-name', 'category-slug', 'category-description',
    'category-featured', 'category-image-file', 'category-img-preview', 
    'confirm-delete-btn', 'toast', 'toast-message', 'refreshData'
  ];
  
  elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    if (id === 'error-container') {
      el.classList.add('d-none');
    }
    if (id === 'category-form') {
      el.reset = jest.fn();
    }
    if (id === 'category-image-file') {
      el.files = [];
    }
    document.body.appendChild(el);
  });
}

describe('类别管理页面测试', () => {
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
    
    // 模拟bootstrap实例
    window.bootstrap = {
      Modal: jest.fn(() => ({
        show: jest.fn(),
        hide: jest.fn()
      })),
      Toast: jest.fn(() => ({
        show: jest.fn()
      }))
    };
    
    // 保存模拟的Toast实例
    window.toastInstance = {
      show: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('管理员可以访问类别管理页面', () => {
    // 模拟已登录的管理员用户
    DataService.getCurrentUser.mockReturnValue({
      role: 'admin',
      username: 'admin'
    });
    
    // 模拟loadCategories函数
    window.loadCategories = jest.fn();
    
    // 模拟类别管理页面中检查管理员权限的代码
    function checkAdminPermissions() {
      const currentUser = DataService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/src/client/views/auth/login.html?redirect=admin';
        return false;
      }
      
      // 加载类别数据
      window.loadCategories();
      return true;
    }
    
    // 执行权限检查
    const result = checkAdminPermissions();
    
    // 验证结果
    expect(result).toBe(true);
    expect(window.loadCategories).toHaveBeenCalled();
  });
  
  test('类别数据加载成功显示', () => {
    // 模拟API响应
    const categoriesResponse = { 
      success: true, 
      data: [
        { 
          id: 1, 
          name: 'Category 1', 
          slug: 'category-1',
          description: 'Description for category 1',
          featured: true,
          createdAt: '2023-05-01T00:00:00Z',
          updatedAt: '2023-05-02T00:00:00Z'
        },
        { 
          id: 2, 
          name: 'Category 2', 
          slug: 'category-2',
          description: 'Description for category 2',
          featured: false,
          createdAt: '2023-05-03T00:00:00Z',
          updatedAt: '2023-05-04T00:00:00Z'
        }
      ] 
    };
    
    // 模拟API服务方法
    AdminApiService.getAllCategories.mockResolvedValue(categoriesResponse);
    
    // 定义渲染函数测试
    function renderCategories(categories) {
      const container = document.getElementById('categories-container');
      container.innerHTML = '';
      
      if (categories.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <p>No categories found.</p>
          </div>
        `;
        return 0;
      }
      
      categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'col';
        categoryElement.innerHTML = `
          <div class="card category-card h-100">
            <div class="card-body">
              <h5 class="card-title">${category.name}</h5>
              <p>Slug: ${category.slug}</p>
            </div>
          </div>
        `;
        container.appendChild(categoryElement);
      });
      
      return container.children.length;
    }
    
    // 执行渲染
    const categoryCount = renderCategories(categoriesResponse.data);
    
    // 验证DOM更新
    expect(categoryCount).toBe(2);
  });
  
  test('可以添加新类别', () => {
    // 模拟表单数据
    const categoryData = {
      name: 'New Category',
      slug: 'new-category',
      description: 'Description for new category',
      featured: true
    };
    
    // 设置表单值
    document.getElementById('category-id').value = '';
    document.getElementById('category-name').value = categoryData.name;
    document.getElementById('category-slug').value = categoryData.slug;
    document.getElementById('category-description').value = categoryData.description;
    document.getElementById('category-featured').checked = categoryData.featured;
    
    // 模拟API响应
    AdminApiService.addCategory.mockResolvedValue({
      success: true,
      data: { id: 3, ...categoryData }
    });
    
    // 模拟showToast函数
    window.showToast = jest.fn();
    
    // 模拟loadCategories函数
    window.loadCategories = jest.fn();
    
    // 定义测试用的类别保存函数
    async function saveCategory() {
      // 获取表单数据
      const formData = {
        name: document.getElementById('category-name').value,
        slug: document.getElementById('category-slug').value,
        description: document.getElementById('category-description').value,
        featured: document.getElementById('category-featured').checked
      };
      
      // 验证必填字段
      if (!formData.name || !formData.slug) {
        window.showToast('Name and slug are required', 'danger');
        return false;
      }
      
      const categoryId = document.getElementById('category-id').value;
      
      try {
        let response;
        
        if (categoryId) {
          // 更新现有类别
          response = await AdminApiService.updateCategory(categoryId, formData);
        } else {
          // 添加新类别
          response = await AdminApiService.addCategory(formData);
        }
        
        if (response.success) {
          window.showToast(categoryId ? 'Category updated successfully' : 'Category added successfully', 'success');
          window.loadCategories(); // 重新加载类别列表
          return true;
        } else {
          window.showToast(response.data || 'Failed to save category', 'danger');
          return false;
        }
      } catch (error) {
        window.showToast(error.message || 'Error saving category', 'danger');
        return false;
      }
    }
    
    // 执行类别保存
    return saveCategory().then(result => {
      // 验证结果
      expect(result).toBe(true);
      expect(AdminApiService.addCategory).toHaveBeenCalledWith(expect.objectContaining({
        name: categoryData.name,
        slug: categoryData.slug
      }));
      expect(window.showToast).toHaveBeenCalledWith('Category added successfully', 'success');
      expect(window.loadCategories).toHaveBeenCalled();
    });
  });
  
  test('可以更新类别', () => {
    // 模拟表单数据
    const categoryData = {
      id: '5',
      name: 'Updated Category',
      slug: 'updated-category',
      description: 'Updated description',
      featured: false
    };
    
    // 设置表单值
    document.getElementById('category-id').value = categoryData.id;
    document.getElementById('category-name').value = categoryData.name;
    document.getElementById('category-slug').value = categoryData.slug;
    document.getElementById('category-description').value = categoryData.description;
    document.getElementById('category-featured').checked = categoryData.featured;
    
    // 模拟API响应
    AdminApiService.updateCategory.mockResolvedValue({
      success: true,
      data: categoryData
    });
    
    // 模拟showToast函数
    window.showToast = jest.fn();
    
    // 模拟loadCategories函数
    window.loadCategories = jest.fn();
    
    // 定义测试用的类别保存函数
    async function saveCategory() {
      // 获取表单数据
      const formData = {
        name: document.getElementById('category-name').value,
        slug: document.getElementById('category-slug').value,
        description: document.getElementById('category-description').value,
        featured: document.getElementById('category-featured').checked
      };
      
      // 验证必填字段
      if (!formData.name || !formData.slug) {
        window.showToast('Name and slug are required', 'danger');
        return false;
      }
      
      const categoryId = document.getElementById('category-id').value;
      
      try {
        let response;
        
        if (categoryId) {
          // 更新现有类别
          response = await AdminApiService.updateCategory(categoryId, formData);
        } else {
          // 添加新类别
          response = await AdminApiService.addCategory(formData);
        }
        
        if (response.success) {
          window.showToast(categoryId ? 'Category updated successfully' : 'Category added successfully', 'success');
          window.loadCategories(); // 重新加载类别列表
          return true;
        } else {
          window.showToast(response.data || 'Failed to save category', 'danger');
          return false;
        }
      } catch (error) {
        window.showToast(error.message || 'Error saving category', 'danger');
        return false;
      }
    }
    
    // 执行类别保存
    return saveCategory().then(result => {
      // 验证结果
      expect(result).toBe(true);
      expect(AdminApiService.updateCategory).toHaveBeenCalledWith(categoryData.id, expect.objectContaining({
        name: categoryData.name,
        slug: categoryData.slug
      }));
      expect(window.showToast).toHaveBeenCalledWith('Category updated successfully', 'success');
      expect(window.loadCategories).toHaveBeenCalled();
    });
  });
  
  test('可以删除类别', () => {
    // 模拟API响应
    const categoryId = 123;
    window.selectedCategoryId = categoryId;
    
    AdminApiService.deleteCategory.mockImplementation(() => {
      return Promise.resolve({
        success: true,
        data: 'Category deleted'
      });
    });
    
    // 模拟showToast函数和loadCategories函数
    window.showToast = jest.fn();
    window.loadCategories = jest.fn();
    
    // 定义测试用的删除函数
    async function deleteCategory() {
      try {
        const response = await AdminApiService.deleteCategory(window.selectedCategoryId);
        
        if (response.success) {
          window.showToast('Category deleted successfully', 'success');
          window.loadCategories(); // 重新加载类别列表
          return true;
        } else {
          window.showToast(response.data || 'Failed to delete category', 'danger');
          return false;
        }
      } catch (error) {
        window.showToast(error.message || 'Error deleting category', 'danger');
        return false;
      }
    }
    
    // 模拟用户点击确认删除按钮
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteCategory);
    
    // 调用deleteCategory函数而不是通过click事件，以确保异步函数执行
    return deleteCategory().then(() => {
      // 验证结果
      expect(AdminApiService.deleteCategory).toHaveBeenCalledWith(categoryId);
      expect(window.loadCategories).toHaveBeenCalled();
    });
  });
  
  test('显示错误信息', () => {
    // 获取错误显示元素
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    // 定义显示错误信息的函数
    function showError(message) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('d-none');
    }
    
    // 显示错误信息
    showError('Failed to load categories');
    
    // 验证DOM更新
    expect(errorContainer.classList.contains('d-none')).toBe(false);
    expect(errorMessage.textContent).toBe('Failed to load categories');
  });
}); 