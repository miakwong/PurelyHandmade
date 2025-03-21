/**
 * 产品API测试
 * 测试产品相关的API端点
 */

const request = require('supertest');
const app = require('../../src/server/server');
const db = require('../../src/server/db');
const { createTestUser, cleanupTestUser } = require('./utils/test-helpers');

// 测试产品数据
const testProduct = {
  name: '测试手工产品',
  price: 129.99,
  description: '这是一个测试手工产品的描述',
  category: '陶瓷',
  stock: 15,
  image: 'test-product.jpg'
};

describe('产品API测试', () => {
  let adminUser;
  let regularUser;
  let productId;

  // 在测试前准备数据
  beforeAll(async () => {
    try {
      // 创建一个管理员用户
      adminUser = await createTestUser({
        email: 'admin-product-test@example.com',
        isAdmin: true,
        role: 'admin'
      });

      // 创建一个普通用户
      regularUser = await createTestUser({
        email: 'user-product-test@example.com'
      });
    } catch (error) {
      console.error('设置测试数据出错:', error);
    }
  });

  // 在测试后清理数据
  afterAll(async () => {
    try {
      // 清理测试产品
      if (productId) {
        await db.products.delete(productId);
      }

      // 清理测试用户
      await cleanupTestUser(adminUser?.user?.email);
      await cleanupTestUser(regularUser?.user?.email);
    } catch (error) {
      console.error('清理测试数据出错:', error);
    }
  });

  // 测试产品创建
  describe('POST /api/products - 创建产品', () => {
    it('管理员应该能够创建新产品', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(testProduct)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(testProduct.name);
      
      // 保存产品ID以供后续测试使用
      productId = response.body.data.id;
    });

    it('非管理员用户不应该能够创建产品', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '普通用户测试产品',
          price: 99.99,
          description: '这是普通用户尝试创建的产品',
          category: '木制品',
          stock: 5
        })
        .set('Authorization', `Bearer ${regularUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('拒绝缺少必要字段的产品创建请求', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '缺少字段的产品'
          // 缺少其他必要字段
        })
        .set('Authorization', `Bearer ${adminUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试获取产品列表
  describe('GET /api/products - 获取产品列表', () => {
    it('应该返回所有产品的列表', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 检查测试产品是否在列表中
      const found = response.body.data.some(p => p.id === productId);
      expect(found).toBe(true);
    });

    it('应该支持按类别过滤产品', async () => {
      const response = await request(app)
        .get(`/api/products?category=${testProduct.category}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 所有返回的产品应该属于指定的类别
      const allInCategory = response.body.data.every(p => p.category === testProduct.category);
      expect(allInCategory).toBe(true);
    });

    it('应该支持产品搜索', async () => {
      const searchTerm = testProduct.name.substring(0, 5);
      const response = await request(app)
        .get(`/api/products?search=${searchTerm}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 检查测试产品是否在搜索结果中
      const found = response.body.data.some(p => p.id === productId);
      expect(found).toBe(true);
    });
  });

  // 测试获取单个产品
  describe('GET /api/products/:id - 获取单个产品', () => {
    it('应该返回指定ID的产品', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe(testProduct.name);
    });

    it('不存在的产品ID应该返回404错误', async () => {
      const response = await request(app)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试更新产品
  describe('PUT /api/products/:id - 更新产品', () => {
    it('管理员应该能够更新产品信息', async () => {
      const updatedData = {
        name: '更新后的测试产品',
        price: 149.99,
        description: '这是更新后的产品描述'
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.data.price).toBe(updatedData.price);
      expect(response.body.data.description).toBe(updatedData.description);
    });

    it('非管理员用户不应该能够更新产品', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ name: '尝试更改名称' })
        .set('Authorization', `Bearer ${regularUser.token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('未认证的请求不应该能够更新产品', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ name: '尝试更改名称' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // 测试删除产品
  describe('DELETE /api/products/:id - 删除产品', () => {
    it('非管理员用户不应该能够删除产品', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('管理员应该能够删除产品', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证产品已被删除
      const checkResponse = await request(app)
        .get(`/api/products/${productId}`);
      
      expect(checkResponse.status).toBe(404);
      
      // 清除产品ID，因为已经删除了
      productId = null;
    });
  });
}); 