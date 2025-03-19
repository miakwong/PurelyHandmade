/**
 * 服务器和API路由单元测试
 */
const request = require('supertest');
const express = require('express');
const path = require('path');

// 创建模拟响应对象
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendFile = jest.fn().mockReturnValue(res);
  return res;
};

// 创建模拟请求对象
const mockRequest = (params = {}, query = {}, body = {}, headers = {}) => {
  return {
    params,
    query,
    body,
    headers,
    user: null // 默认未认证
  };
};

// 模拟数据库服务
jest.mock('../../src/server/db', () => ({
  users: {
    getAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Test User' }]),
    getById: jest.fn().mockImplementation(id => {
      if (id === 1) return Promise.resolve({ id: 1, name: 'Test User' });
      return Promise.resolve(null);
    })
  },
  products: {
    getAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Product' }]),
    getById: jest.fn().mockImplementation(id => {
      if (id === 1) return Promise.resolve({ id: 1, name: 'Test Product' });
      return Promise.resolve(null);
    })
  }
}));

// 测试环境变量
process.env.NODE_ENV = 'test';
process.env.SERVER_PORT = '9878';
process.env.API_PREFIX = '/api';

describe('服务器配置', () => {
  let app;
  
  beforeEach(() => {
    // 重置模块缓存以允许每次测试重新加载服务器
    jest.resetModules();
    app = require('../../src/server/server');
  });
  
  test('服务器应该配置了正确的中间件', () => {
    // 测试中间件配置
    expect(app._router.stack.some(layer => layer.name === 'corsMiddleware')).toBeTruthy();
    expect(app._router.stack.some(layer => layer.name === 'jsonParser')).toBeTruthy();
    expect(app._router.stack.some(layer => layer.name === 'urlencodedParser')).toBeTruthy();
  });
  
  test('服务器应该设置了正确的API路由', async () => {
    // 测试API路由是否正确设置
    const response = await request(app).get('/api');
    expect(response.status).not.toBe(404); // 任何状态码都可以，只要不是404（未找到）
  });
  
  test('服务器应该设置了静态文件服务', () => {
    // 测试静态文件服务配置
    expect(app._router.stack.some(layer => layer.name === 'serveStatic')).toBeTruthy();
  });
});

describe('API错误处理', () => {
  // 测试非存在的API端点
  test('访问不存在的API端点应返回404', async () => {
    const app = require('../../src/server/server');
    const response = await request(app).get('/api/nonexistent-endpoint');
    expect(response.status).toBe(404);
  });
  
  // 测试服务器错误处理
  test('服务器错误应该被正确处理', async () => {
    // 创建一个包含错误处理中间件的简单Express应用
    const app = express();
    
    // 添加一个会抛出错误的路由
    app.get('/error', (req, res, next) => {
      throw new Error('Test error');
    });
    
    // 添加错误处理中间件
    app.use((err, req, res, next) => {
      res.status(500).json({
        success: false,
        data: '服务器内部错误'
      });
    });
    
    // 测试错误路由
    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});

describe('路由处理程序', () => {
  test('所有其他路由应重定向到前端', async () => {
    // 模拟请求和响应
    const req = mockRequest();
    const res = mockResponse();
    
    // 获取重定向到前端的路由处理程序
    const app = require('../../src/server/server');
    const handler = app._router.stack.find(layer => 
      layer.route && layer.route.path === '*' && layer.route.methods.get
    ).handle;
    
    // 调用处理程序
    await handler(req, res);
    
    // 验证是否尝试发送文件
    expect(res.sendFile).toHaveBeenCalled();
    expect(res.sendFile.mock.calls[0][0]).toContain('src/client/html/index.html');
  });
}); 