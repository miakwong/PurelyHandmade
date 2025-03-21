/**
 * 测试辅助工具
 * 提供共享的测试功能
 */

const request = require('supertest');
const app = require('../../../src/server/server');
const db = require('../../../src/server/db');

/**
 * 创建测试用户并返回用户数据和认证令牌
 */
async function createTestUser(userData = {}) {
  // 默认用户数据
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Date.now()}`
  };

  // 合并提供的数据和默认数据
  const testUser = { ...defaultUser, ...userData };

  try {
    // 确保测试用户不存在
    await db.users.deleteByEmail(testUser.email);

    // 创建测试用户
    const response = await request(app)
      .post('/api/users')
      .send(testUser)
      .set('Accept', 'application/json');

    if (!response.body.success) {
      throw new Error(`创建测试用户失败: ${response.body.data}`);
    }

    // 登录以获取令牌
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .set('Accept', 'application/json');

    if (!loginResponse.body.success) {
      throw new Error(`测试用户登录失败: ${loginResponse.body.data}`);
    }

    return {
      user: response.body.data,
      token: loginResponse.body.data.token
    };
  } catch (error) {
    console.error('创建测试用户出错:', error);
    throw error;
  }
}

/**
 * 清理测试用户
 */
async function cleanupTestUser(email) {
  try {
    await db.users.deleteByEmail(email);
  } catch (error) {
    console.error('清理测试用户出错:', error);
  }
}

/**
 * 创建测试产品并返回产品数据
 */
async function createTestProduct(productData = {}, authToken) {
  // 默认产品数据
  const defaultProduct = {
    name: `测试产品${Date.now()}`,
    price: 99.99,
    description: '这是一个测试产品',
    category: '测试类别',
    stock: 10,
    image: 'test.jpg'
  };

  // 合并提供的数据和默认数据
  const testProduct = { ...defaultProduct, ...productData };

  try {
    // 创建测试产品（需要管理员权限）
    const response = await request(app)
      .post('/api/products')
      .send(testProduct)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    if (!response.body.success) {
      throw new Error(`创建测试产品失败: ${response.body.data}`);
    }

    return response.body.data;
  } catch (error) {
    console.error('创建测试产品出错:', error);
    throw error;
  }
}

/**
 * 清理测试产品
 */
async function cleanupTestProduct(productId, authToken) {
  try {
    await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
  } catch (error) {
    console.error('清理测试产品出错:', error);
  }
}

/**
 * 创建测试订单并返回订单数据
 */
async function createTestOrder(orderData, authToken) {
  try {
    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Accept', 'application/json');

    if (!response.body.success) {
      throw new Error(`创建测试订单失败: ${response.body.data}`);
    }

    return response.body.data;
  } catch (error) {
    console.error('创建测试订单出错:', error);
    throw error;
  }
}

/**
 * 设置测试环境
 * 创建所有测试资源并返回
 */
async function setupTestEnvironment() {
  // 创建管理员用户
  const admin = await createTestUser({
    email: `admin${Date.now()}@example.com`,
    isAdmin: true,
    role: 'admin'
  });

  // 创建普通用户
  const user = await createTestUser({
    email: `user${Date.now()}@example.com`
  });

  // 创建测试产品
  const product = await createTestProduct({}, admin.token);

  return {
    admin,
    user,
    product
  };
}

/**
 * 清理测试环境
 * 删除所有测试资源
 */
async function cleanupTestEnvironment(testEnv) {
  if (testEnv.product) {
    await cleanupTestProduct(testEnv.product.id, testEnv.admin.token);
  }

  if (testEnv.admin) {
    await cleanupTestUser(testEnv.admin.user.email);
  }

  if (testEnv.user) {
    await cleanupTestUser(testEnv.user.user.email);
  }
}

module.exports = {
  createTestUser,
  cleanupTestUser,
  createTestProduct,
  cleanupTestProduct,
  createTestOrder,
  setupTestEnvironment,
  cleanupTestEnvironment
}; 