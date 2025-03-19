/**
 * 测试工具函数
 */
const { PrismaClient } = require('@prisma/client');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/server/server');

// 创建一个独立的Prisma客户端用于测试
const prisma = new PrismaClient();
const request = supertest(app);

/**
 * 清空测试数据库表
 */
async function clearDatabase() {
  try {
    // 按照依赖关系顺序删除数据
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.designer.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error('清空数据库失败:', error);
    throw error;
  }
}

/**
 * 创建测试用户
 */
async function createTestUsers() {
  try {
    // 创建测试管理员
    const adminPassword = await bcrypt.hash(global.testUsers.admin.password, 10);
    const admin = await prisma.user.create({
      data: {
        email: global.testUsers.admin.email,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Test',
        username: 'admintest',
        role: 'admin',
        isAdmin: true,
        status: 'active'
      }
    });
    
    // 创建测试普通用户
    const userPassword = await bcrypt.hash(global.testUsers.user.password, 10);
    const user = await prisma.user.create({
      data: {
        email: global.testUsers.user.email,
        password: userPassword,
        firstName: 'User',
        lastName: 'Test',
        username: 'usertest',
        role: 'user',
        isAdmin: false,
        status: 'active'
      }
    });
    
    return { admin, user };
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
}

/**
 * 创建测试类别
 */
async function createTestCategories() {
  try {
    return await prisma.category.create({
      data: {
        name: '测试类别',
        slug: 'test-category',
        description: '测试用类别',
        featured: true
      }
    });
  } catch (error) {
    console.error('创建测试类别失败:', error);
    throw error;
  }
}

/**
 * 创建测试设计师
 */
async function createTestDesigner() {
  try {
    return await prisma.designer.create({
      data: {
        name: '测试设计师',
        slug: 'test-designer',
        bio: '测试用设计师',
        featured: true
      }
    });
  } catch (error) {
    console.error('创建测试设计师失败:', error);
    throw error;
  }
}

/**
 * 创建测试产品
 */
async function createTestProduct(categoryId, designerId) {
  try {
    return await prisma.product.create({
      data: {
        name: '测试产品',
        slug: 'test-product',
        sku: 'TEST001',
        price: 199.99,
        stock: 10,
        description: '测试用产品',
        featured: true,
        active: true,
        categoryId,
        designerId
      }
    });
  } catch (error) {
    console.error('创建测试产品失败:', error);
    throw error;
  }
}

/**
 * 登录并获取令牌
 */
async function loginUser(email, password) {
  const response = await request
    .post('/api/auth/login')
    .send({ email, password });
  
  if (!response.body.success) {
    throw new Error(`登录失败: ${response.body.data}`);
  }
  
  return response.body.data.token;
}

/**
 * 初始化完整的测试环境
 */
async function setupTestEnv() {
  await clearDatabase();
  const { admin, user } = await createTestUsers();
  const category = await createTestCategories();
  const designer = await createTestDesigner();
  const product = await createTestProduct(category.id, designer.id);
  
  // 登录并获取令牌
  try {
    global.testUsers.admin.token = await loginUser(global.testUsers.admin.email, global.testUsers.admin.password);
    global.testUsers.user.token = await loginUser(global.testUsers.user.email, global.testUsers.user.password);
  } catch (error) {
    console.error('获取测试令牌失败:', error);
  }
  
  return {
    users: { admin, user },
    category,
    designer,
    product
  };
}

module.exports = {
  prisma,
  request,
  clearDatabase,
  createTestUsers,
  createTestCategories,
  createTestDesigner,
  createTestProduct,
  loginUser,
  setupTestEnv
}; 