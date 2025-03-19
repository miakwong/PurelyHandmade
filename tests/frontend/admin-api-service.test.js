/**
 * Admin API Service Tests
 * 管理员API服务测试
 */

// 导入AdminApiService模块
const AdminApiService = require('../../src/client/js/admin-api-service.js');
const ApiService = require('../../src/client/js/api-service.js');

// 模拟ApiService的方法
jest.mock('../../src/client/js/api-service.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('AdminApiService', () => {
  beforeEach(() => {
    // 清除所有模拟调用信息
    jest.clearAllMocks();
  });
  
  test('getAllUsers should call ApiService.get with correct URL', () => {
    // 模拟ApiService.get方法返回值
    ApiService.get.mockResolvedValue({ success: true, data: [] });
    
    // 调用getAllUsers方法
    return AdminApiService.getAllUsers().then(response => {
      // 验证ApiService.get被调用
      expect(ApiService.get).toHaveBeenCalledWith('/api/users?all=1');
      expect(response).toEqual({ success: true, data: [] });
    });
  });
  
  test('toggleUserStatus should call ApiService.put with correct URL and data', () => {
    // 模拟ApiService.put方法返回值
    ApiService.put.mockResolvedValue({ success: true });
    
    // 调用toggleUserStatus方法
    return AdminApiService.toggleUserStatus(123, true).then(response => {
      // 验证ApiService.put被调用
      expect(ApiService.put).toHaveBeenCalledWith('/api/users/123/status', {
        isEnabled: true
      });
      expect(response).toEqual({ success: true });
    });
  });
  
  test('getAllProducts should call ApiService.get with correct URL', () => {
    // 模拟ApiService.get方法返回值
    ApiService.get.mockResolvedValue({ success: true, data: [] });
    
    // 调用getAllProducts方法
    return AdminApiService.getAllProducts().then(response => {
      // 验证ApiService.get被调用
      expect(ApiService.get).toHaveBeenCalledWith('/api/products');
      expect(response).toEqual({ success: true, data: [] });
    });
  });
  
  test('addProduct should call ApiService.post with correct URL and data', () => {
    // 模拟产品数据
    const productData = {
      name: 'Test Product',
      price: 99.99,
      description: 'Test description'
    };
    
    // 模拟ApiService.post方法返回值
    ApiService.post.mockResolvedValue({ success: true, data: { id: 1, ...productData } });
    
    // 调用addProduct方法
    return AdminApiService.addProduct(productData).then(response => {
      // 验证ApiService.post被调用
      expect(ApiService.post).toHaveBeenCalledWith('/api/products', productData);
      expect(response).toEqual({ success: true, data: { id: 1, ...productData } });
    });
  });
  
  test('updateProduct should call ApiService.put with correct URL and data', () => {
    // 模拟产品数据
    const productId = '123';
    const productData = {
      name: 'Updated Product',
      price: 129.99
    };
    
    // 模拟ApiService.put方法返回值
    ApiService.put.mockResolvedValue({ success: true });
    
    // 调用updateProduct方法
    return AdminApiService.updateProduct(productId, productData).then(response => {
      // 验证ApiService.put被调用
      expect(ApiService.put).toHaveBeenCalledWith('/api/products/123', productData);
      expect(response).toEqual({ success: true });
    });
  });
  
  test('deleteProduct should call ApiService.delete with correct URL', () => {
    // 模拟产品ID
    const productId = '123';
    
    // 模拟ApiService.delete方法返回值
    ApiService.delete.mockResolvedValue({ success: true });
    
    // 调用deleteProduct方法
    return AdminApiService.deleteProduct(productId).then(response => {
      // 验证ApiService.delete被调用
      expect(ApiService.delete).toHaveBeenCalledWith('/api/products/123');
      expect(response).toEqual({ success: true });
    });
  });
  
  test('getAllCategories should call ApiService.get with correct URL', () => {
    // 模拟ApiService.get方法返回值
    ApiService.get.mockResolvedValue({ success: true, data: [] });
    
    // 调用getAllCategories方法
    return AdminApiService.getAllCategories().then(response => {
      // 验证ApiService.get被调用
      expect(ApiService.get).toHaveBeenCalledWith('/api/categories');
      expect(response).toEqual({ success: true, data: [] });
    });
  });
  
  test('addCategory should call ApiService.post with correct URL and data', () => {
    // 模拟类别数据
    const categoryData = {
      name: 'Test Category',
      description: 'Test description'
    };
    
    // 模拟ApiService.post方法返回值
    ApiService.post.mockResolvedValue({ success: true, data: { id: 1, ...categoryData } });
    
    // 调用addCategory方法
    return AdminApiService.addCategory(categoryData).then(response => {
      // 验证ApiService.post被调用
      expect(ApiService.post).toHaveBeenCalledWith('/api/categories', categoryData);
      expect(response).toEqual({ success: true, data: { id: 1, ...categoryData } });
    });
  });
  
  test('updateCategory should call ApiService.put with correct URL and data', () => {
    // 模拟类别数据
    const categoryId = 123;
    const categoryData = {
      name: 'Updated Category',
      description: 'Updated description'
    };
    
    // 模拟ApiService.put方法返回值
    ApiService.put.mockResolvedValue({ success: true });
    
    // 调用updateCategory方法
    return AdminApiService.updateCategory(categoryId, categoryData).then(response => {
      // 验证ApiService.put被调用
      expect(ApiService.put).toHaveBeenCalledWith('/api/categories/123', categoryData);
      expect(response).toEqual({ success: true });
    });
  });
  
  test('deleteCategory should call ApiService.delete with correct URL', () => {
    // 模拟类别ID
    const categoryId = 123;
    
    // 模拟ApiService.delete方法返回值
    ApiService.delete.mockResolvedValue({ success: true });
    
    // 调用deleteCategory方法
    return AdminApiService.deleteCategory(categoryId).then(response => {
      // 验证ApiService.delete被调用
      expect(ApiService.delete).toHaveBeenCalledWith('/api/categories/123');
      expect(response).toEqual({ success: true });
    });
  });
  
  test('getAllDesigners should call ApiService.get with correct URL', () => {
    // 模拟ApiService.get方法返回值
    ApiService.get.mockResolvedValue({ success: true, data: [] });
    
    // 调用getAllDesigners方法
    return AdminApiService.getAllDesigners().then(response => {
      // 验证ApiService.get被调用
      expect(ApiService.get).toHaveBeenCalledWith('/api/designers');
      expect(response).toEqual({ success: true, data: [] });
    });
  });
  
  test('getSiteStatistics should call ApiService.get with correct URL', () => {
    // 模拟ApiService.get方法返回值
    ApiService.get.mockResolvedValue({ 
      success: true, 
      data: { 
        users: 10, 
        products: 50, 
        orders: 25, 
        revenue: 1500 
      } 
    });
    
    // 调用getSiteStatistics方法
    return AdminApiService.getSiteStatistics().then(response => {
      // 验证ApiService.get被调用
      expect(ApiService.get).toHaveBeenCalledWith('/api/admin/statistics');
      expect(response).toEqual({ 
        success: true, 
        data: { 
          users: 10, 
          products: 50, 
          orders: 25, 
          revenue: 1500 
        } 
      });
    });
  });
}); 