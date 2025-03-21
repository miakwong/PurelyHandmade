/**
 * 身份验证API测试
 * 测试登录、注册及令牌验证等功能
 */

const request = require('supertest');
const app = require('../../src/server/server');
const db = require('../../src/server/db');
const bcrypt = require('bcryptjs');

// 测试用户数据
const testUser = {
  email: 'auth-test@example.com',
  password: 'securePassword123',
  firstName: 'Auth',
  lastName: 'Test',
  username: 'authtest'
};

describe('身份验证API测试', () => {
  // 在测试前清理数据库
  beforeAll(async () => {
    try {
      // 删除测试用户（如果存在）
      await db.users.deleteByEmail(testUser.email);
    } catch (error) {
      console.error('清理数据库出错:', error);
    }
  });

  // 在测试后清理数据库
  afterAll(async () => {
    try {
      // 删除测试用户
      await db.users.deleteByEmail(testUser.email);
    } catch (error) {
      console.error('清理数据库出错:', error);
    }
  });

  // 测试用户注册
  describe('POST /api/auth/register - 用户注册', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // 密码不应该返回
    });

    it('应该拒绝已存在的电子邮件', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toMatch(/已被注册/);
    });

    it('应该拒绝缺少必填字段的请求', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com'
          // 缺少密码
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝不安全的密码', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'different@example.com',
          password: '123' // 太短/简单
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toMatch(/密码太短/);
    });
  });

  // 测试用户登录
  describe('POST /api/auth/login - 用户登录', () => {
    it('应该成功登录并返回令牌', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toMatch(/密码不正确/);
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toMatch(/用户不存在/);
    });
  });

  // 测试验证令牌
  describe('GET /api/auth/verify - 验证令牌', () => {
    let authToken;

    // 获取令牌以便后续测试
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = response.body.data.token;
    });

    it('应该成功验证有效的令牌', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('应该拒绝无效的令牌', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝缺少令牌的请求', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试密码重置
  describe('密码重置功能', () => {
    let resetToken;

    // 测试请求密码重置
    describe('POST /api/auth/forgot-password - 请求密码重置', () => {
      it('应该发送重置密码邮件给已注册用户', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: testUser.email })
          .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // 在真实环境中会发送邮件，在测试中我们可以直接获取令牌
        const user = await db.users.getByEmail(testUser.email);
        resetToken = user.resetToken;
        expect(resetToken).toBeDefined();
      });

      it('应该在用户不存在时仍返回成功（防止用户枚举）', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'nonexistent@example.com' })
          .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    // 测试重置密码
    describe('POST /api/auth/reset-password - 重置密码', () => {
      const newPassword = 'newSecurePassword456';

      it('应该成功重置密码', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            password: newPassword
          })
          .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('应该能够使用新密码登录', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: newPassword
          })
          .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      it('不应该能够使用旧密码登录', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('应该拒绝无效的重置令牌', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            password: 'someNewPassword789'
          })
          .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // 测试登出
  describe('POST /api/auth/logout - 登出', () => {
    let authToken;

    // 获取令牌以便测试
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'newSecurePassword456' // 使用重置后的密码
        });

      authToken = response.body.data.token;
    });

    it('应该成功登出用户', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('登出后令牌应该无效', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 