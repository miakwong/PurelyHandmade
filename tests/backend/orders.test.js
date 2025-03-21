/**
 * 订单API测试
 * 测试订单相关的API端点
 */

const request = require('supertest');
const app = require('../../src/server/server');
const db = require('../../src/server/db');
const { 
  createTestUser, 
  cleanupTestUser, 
  createTestProduct, 
  cleanupTestProduct 
} = require('./utils/test-helpers');

describe('订单API测试', () => {
  let adminUser, regularUser;
  let testProduct;
  let orderId;

  // 测试前准备数据
  beforeAll(async () => {
    try {
      // 创建管理员用户
      adminUser = await createTestUser({
        email: 'admin-order-test@example.com',
        isAdmin: true,
        role: 'admin'
      });

      // 创建普通用户
      regularUser = await createTestUser({
        email: 'user-order-test@example.com'
      });

      // 创建测试产品
      const productData = {
        name: '订单测试产品',
        price: 149.99,
        description: '这是用于订单测试的产品',
        category: '手工皂',
        stock: 20,
        image: 'test-order-product.jpg'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .set('Accept', 'application/json');

      testProduct = response.body.data;
    } catch (error) {
      console.error('设置测试数据出错:', error);
    }
  });

  // 测试后清理数据
  afterAll(async () => {
    try {
      // 清理测试订单
      if (orderId) {
        await db.orders.delete(orderId);
      }

      // 清理测试产品
      if (testProduct) {
        await cleanupTestProduct(testProduct.id, adminUser.token);
      }

      // 清理测试用户
      await cleanupTestUser(adminUser?.user?.email);
      await cleanupTestUser(regularUser?.user?.email);
    } catch (error) {
      console.error('清理测试数据出错:', error);
    }
  });

  // 测试创建订单
  describe('POST /api/orders - 创建订单', () => {
    it('用户应该能够创建新订单', async () => {
      const orderData = {
        items: [
          {
            productId: testProduct.id,
            quantity: 2,
            price: testProduct.price
          }
        ],
        shippingAddress: {
          addressLine1: '测试地址1',
          addressLine2: '测试地址2',
          city: '测试城市',
          state: '测试省份',
          zipCode: '123456',
          country: '中国'
        },
        paymentMethod: 'creditCard',
        paymentDetails: {
          cardNumber: '************1234',
          expiryDate: '12/25'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .set('Authorization', `Bearer ${regularUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.userId).toBe(regularUser.user.id);
      
      // 保存订单ID以供后续测试使用
      orderId = response.body.data.id;
    });

    it('应该拒绝缺少必要信息的订单', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          // 缺少items数组
          shippingAddress: {
            addressLine1: '测试地址1',
            city: '测试城市',
            state: '测试省份',
            zipCode: '123456',
            country: '中国'
          }
        })
        .set('Authorization', `Bearer ${regularUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('未认证的请求不应该能够创建订单', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              productId: testProduct.id,
              quantity: 1,
              price: testProduct.price
            }
          ]
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试获取用户订单
  describe('GET /api/orders - 获取用户订单', () => {
    it('用户应该能够获取自己的订单列表', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 检查测试订单是否在列表中
      const found = response.body.data.some(o => o.id === orderId);
      expect(found).toBe(true);
    });

    it('管理员应该能够查看所有订单', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('未认证的请求不应该能够获取订单列表', async () => {
      const response = await request(app)
        .get('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试获取单个订单
  describe('GET /api/orders/:id - 获取单个订单', () => {
    it('用户应该能够获取自己的订单详情', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.userId).toBe(regularUser.user.id);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('用户不应该能够查看其他用户的订单', async () => {
      // 创建另一个用户并让他尝试访问第一个用户的订单
      const anotherUser = await createTestUser({
        email: 'another-user-order-test@example.com'
      });

      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // 清理另一个用户
      await cleanupTestUser(anotherUser.user.email);
    });

    it('管理员应该能够查看任何订单', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
    });
  });

  // 测试更新订单状态
  describe('PUT /api/orders/:id - 更新订单状态', () => {
    it('管理员应该能够更新订单状态', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'processing' })
        .set('Authorization', `Bearer ${adminUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('processing');
    });

    it('普通用户不应该能够更新订单状态', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'cancelled' })
        .set('Authorization', `Bearer ${regularUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试取消订单
  describe('POST /api/orders/:id/cancel - 取消订单', () => {
    it('用户应该能够取消自己的未处理订单', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('用户不应该能够取消已发货的订单', async () => {
      // 先将订单状态更新为已发货
      await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'shipped' })
        .set('Authorization', `Bearer ${adminUser.token}`);
      
      // 尝试取消
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 