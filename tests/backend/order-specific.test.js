/**
 * 订单API特定场景测试
 * 测试与错误相关的订单API端点
 */

const request = require('supertest');
const app = require('../../src/server/server');
const db = require('../../src/server/db');
const jwt = require('jsonwebtoken');

// 测试用的有效令牌
const testAdminToken = 'valid-admin-token';
const testUserToken = 'valid-user-token';

describe('订单特定场景API测试', () => {
  // 测试数据
  let orderId = 1;
  
  beforeAll(async () => {
    // 在数据库中添加测试订单数据
    await db.orders.create({
      id: orderId,
      userId: 2, // 普通用户ID
      status: 'pending',
      totalAmount: 299.98,
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 149.99
        }
      ],
      shippingInfo: JSON.stringify({
        addressLine1: '测试地址1',
        city: '测试城市',
        state: '测试省份',
        zipCode: '123456',
        country: '中国'
      })
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await db.orders.delete(orderId);
  });

  // 测试订单加载 - orders.html:522 错误场景
  describe('GET /api/orders - 订单加载测试', () => {
    it('应该能成功加载用户订单列表', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('应该能加载特定订单详情', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
    });
  });

  // 测试订单处理响应 - handleResponse orders.html:296 错误场景
  describe('POST /api/orders/handle - 订单处理测试', () => {
    it('应该能成功处理订单响应', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/handle`)
        .send({ action: 'process' })
        .set('Authorization', `Bearer ${testAdminToken}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('processing');
    });

    it('普通用户不应该能处理订单', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/handle`)
        .send({ action: 'process' })
        .set('Authorization', `Bearer ${testUserToken}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试订单状态更新 - 可能与orders.html:352相关
  describe('PUT /api/orders/:id - 订单状态更新测试', () => {
    it('管理员应该能更新订单状态', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'shipped' })
        .set('Authorization', `Bearer ${testAdminToken}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('shipped');
    });
  });

  // 测试订单列表分页功能 - 可能与匿名函数orders.html:310相关
  describe('GET /api/orders/page/:page - 订单分页测试', () => {
    it('应该支持订单分页加载', async () => {
      const response = await request(app)
        .get('/api/orders/page/1?limit=10')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });
  });
}); 