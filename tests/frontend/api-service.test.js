/**
 * API Service Tests
 * API服务测试
 */

// 导入ApiService模块
const ApiService = require('../../src/client/js/api-service.js');

describe('ApiService', () => {
  beforeEach(() => {
    // 清除所有模拟调用信息
    jest.clearAllMocks();
    
    // 模拟fetch
    global.fetch = jest.fn();
    
    // 创建Headers模拟
    global.Headers = class Headers {
      constructor(init = {}) {
        this.headers = {...init};
      }
      
      get(name) {
        return this.headers[name.toLowerCase()];
      }
      
      has(name) {
        return name.toLowerCase() in this.headers;
      }
    };
    
    // 模拟FormData
    global.FormData = class FormData {
      constructor() {
        this.data = {};
      }
      
      append(key, value) {
        this.data[key] = value;
      }
      
      get(key) {
        return this.data[key];
      }
      
      getAll() {
        return Object.values(this.data);
      }
    };
    
    // 临时修改API基础URL为空字符串，以简化测试
    ApiService.baseUrl = '';
  });
  
  test('get should make a GET request with correct parameters', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: 'test data' })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    // 调用get方法
    return ApiService.get('/test', { id: 123, name: 'test' })
      .then(response => {
        // 验证fetch调用
        expect(fetch).toHaveBeenCalledWith('/test?id=123&name=test', expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        }));
        expect(response).toEqual({ success: true, data: 'test data' });
      });
  });
  
  test('get should exclude null or undefined parameters', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: 'test data' })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    // 调用get方法，包含null和undefined参数
    return ApiService.get('/test', { id: 123, name: null, desc: undefined, active: true })
      .then(response => {
        // 验证fetch调用 - 应该排除null和undefined参数
        expect(fetch).toHaveBeenCalledWith('/test?id=123&active=true', expect.objectContaining({
          method: 'GET'
        }));
        expect(response).toEqual({ success: true, data: 'test data' });
      });
  });
  
  test('post should make a POST request with JSON body', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: 'test data' })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    const requestData = { name: 'Test', description: 'Test description' };
    
    // 调用post方法
    return ApiService.post('/test', requestData)
      .then(response => {
        // 验证fetch调用
        expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(requestData)
        }));
        expect(response).toEqual({ success: true, data: 'test data' });
      });
  });
  
  test('put should make a PUT request with JSON body', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: 'test data' })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    const requestData = { id: 1, name: 'Updated Test' };
    
    // 调用put方法
    return ApiService.put('/test/1', requestData)
      .then(response => {
        // 验证fetch调用
        expect(fetch).toHaveBeenCalledWith('/test/1', expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(requestData)
        }));
        expect(response).toEqual({ success: true, data: 'test data' });
      });
  });
  
  test('delete should make a DELETE request', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: 'deleted' })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    // 调用delete方法
    return ApiService.delete('/test/1')
      .then(response => {
        // 验证fetch调用
        expect(fetch).toHaveBeenCalledWith('/test/1', expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        }));
        expect(response).toEqual({ success: true, data: 'deleted' });
      });
  });
  
  test('should handle error responses correctly', () => {
    // 创建带有适当headers属性的错误响应对象
    const errorResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: false, error: 'Not found' })
    };
    
    // 模拟错误响应
    global.fetch.mockResolvedValue(errorResponse);
    
    // 调用get方法并处理错误
    return ApiService.get('/test').catch(err => {
      // 验证错误信息
      expect(err.message).toBe('Not found');
      expect(err.status).toBe(404);
    });
  });
  
  test('should handle network errors correctly', () => {
    // 创建网络错误
    const networkError = new Error('Network error');
    
    // 模拟网络错误
    global.fetch.mockRejectedValue(networkError);
    
    // 调用get方法
    return ApiService.get('/test').catch(err => {
      // 验证错误
      expect(err.message).toBe('Network error');
    });
  });
  
  test('register should make a POST request to /register', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: { id: 1, username: 'testuser' } })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    // 调用register方法
    return ApiService.register(userData)
      .then(response => {
        // 验证fetch调用，注意这里应该是 /register 而不是 /api/auth/register
        expect(fetch).toHaveBeenCalledWith('/register', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(userData)
        }));
        expect(response).toEqual({ success: true, data: { id: 1, username: 'testuser' } });
      });
  });
  
  test('login should make a POST request with FormData', () => {
    // 创建带有适当headers属性的响应对象
    const mockResponse = {
      ok: true,
      headers: new Headers({'content-type': 'application/json'}),
      json: () => Promise.resolve({ success: true, data: { id: 1, username: 'testuser' } })
    };
    
    // 模拟成功响应
    global.fetch.mockResolvedValue(mockResponse);
    
    // 调用login方法
    return ApiService.login('testuser', 'password123')
      .then(response => {
        // 验证fetch调用
        expect(fetch).toHaveBeenCalledWith('/login', expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        }));
        expect(response).toEqual({ success: true, data: { id: 1, username: 'testuser' } });
      });
  });
  
  // 恢复API基础URL
  afterAll(() => {
    ApiService.baseUrl = '/api';
  });
}); 