/**
 * API集成测试
 */
const { 
  prisma, 
  request, 
  clearDatabase, 
  setupTestEnv 
} = require('../utils/test-utils');

// 测试数据
let testData = {
  users: {},
  category: null,
  designer: null,
  product: null
};

// 在所有测试前初始化测试环境
beforeAll(async () => {
  testData = await setupTestEnv();
}, 30000);

// 在所有测试后清理测试环境
afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('API集成测试', () => {
  describe('认证API', () => {
    test('POST /api/auth/login 应成功登录用户', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({ 
          email: global.testUsers.user.email, 
          password: global.testUsers.user.password 
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.token).toBeTruthy();
    });
    
    test('POST /api/auth/login 应返回错误状态码，当密码错误时', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({ 
          email: global.testUsers.user.email, 
          password: 'wrongpassword' 
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('用户API', () => {
    test('GET /api/users 应返回所有用户，仅限管理员', async () => {
      const response = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${global.testUsers.admin.token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    test('GET /api/users 应返回错误状态码，当非管理员访问时', async () => {
      const response = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${global.testUsers.user.token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    test('GET /api/users/:id 应返回特定用户', async () => {
      const userId = testData.users.user.id;
      
      const response = await request
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${global.testUsers.user.token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
    });
    
    test('POST /api/users 应创建新用户', async () => {
      const response = await request
        .post('/api/users')
        .send({
          email: 'integration-test@example.com',
          password: 'password123',
          firstName: 'Integration',
          lastName: 'Test',
          username: 'integrationtest'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('integration-test@example.com');
    });
  });
  
  describe('产品API', () => {
    test('GET /api/products 应返回所有产品', async () => {
      const response = await request.get('/api/products');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    test('GET /api/products/:id 应返回特定产品', async () => {
      const productId = testData.product.id;
      
      const response = await request.get(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
    });
    
    test('POST /api/products 应创建新产品，仅限管理员', async () => {
      const response = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${global.testUsers.admin.token}`)
        .send({
          name: '集成测试产品',
          slug: 'integration-test-product',
          sku: 'TEST003',
          price: 499.99,
          stock: 15,
          description: '集成测试用产品',
          categoryId: testData.category.id,
          designerId: testData.designer.id
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('集成测试产品');
    });
    
    test('POST /api/products 应返回错误状态码，当非管理员创建产品时', async () => {
      const response = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${global.testUsers.user.token}`)
        .send({
          name: '无权限测试产品',
          slug: 'no-permission-test-product',
          sku: 'TEST004',
          price: 599.99,
          stock: 20,
          description: '无权限测试用产品',
          categoryId: testData.category.id,
          designerId: testData.designer.id
        });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('类别API', () => {
    test('GET /api/categories 应返回所有类别', async () => {
      const response = await request.get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
}); 