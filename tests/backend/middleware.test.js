/**
 * 中间件测试
 * 测试身份验证和权限验证中间件
 */

const request = require('supertest');
const express = require('express');
const app = express();

// 从api.js提取中间件进行测试
const api = require('../../src/server/api');

// 模拟jwt库
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid-admin-token') {
      return { userId: 1, isAdmin: true };
    } else if (token === 'valid-user-token') {
      return { userId: 2, isAdmin: false };
    } else {
      throw new Error('Invalid token');
    }
  }),
  sign: jest.fn().mockReturnValue('new-token')
}));

// 提取中间件（注意：这需要api.js导出这些中间件才能工作）
const authenticateUser = api.authenticateUser;
const requireAdmin = api.requireAdmin;

// 创建测试路由
app.get('/protected', authenticateUser, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/admin-only', authenticateUser, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'You are an admin' });
});

describe('身份验证中间件测试', () => {
  describe('authenticateUser 中间件', () => {
    it('应该允许有效令牌访问受保护的路由', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-admin-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('应该拒绝无效令牌访问受保护的路由', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝缺少令牌的请求', async () => {
      const response = await request(app)
        .get('/protected');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('requireAdmin 中间件', () => {
    it('应该允许管理员访问管理员专用路由', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer valid-admin-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('You are an admin');
    });

    it('应该拒绝非管理员访问管理员专用路由', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer valid-user-token');
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});

// 非测试环境下的调试模式测试
describe('调试模式下的中间件测试', () => {
  let originalNodeEnv;
  
  // 在这些测试前保存并修改环境变量
  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // 不再是test
    process.env.DEBUG = 'true';
  });

  // 在这些测试后恢复环境变量
  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DEBUG = 'false';
  });

  it('在调试模式下应该跳过身份验证检查', async () => {
    const response = await request(app)
      .get('/protected')
      // 不提供任何身份验证令牌
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    // 在调试模式下，应该假设用户是管理员
    expect(response.body.user.isAdmin).toBe(true);
  });

  it('在调试模式下甚至不需要令牌就可以访问管理员路由', async () => {
    const response = await request(app)
      .get('/admin-only')
      // 不提供任何身份验证令牌
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('You are an admin');
  });
}); 