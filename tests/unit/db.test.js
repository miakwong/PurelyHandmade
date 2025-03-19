/**
 * 数据库服务单元测试
 */
const { 
  prisma, 
  clearDatabase, 
  createTestUsers, 
  createTestCategories, 
  createTestDesigner, 
  createTestProduct 
} = require('../utils/test-utils');
const db = require('../../src/server/db');

// 运行测试前清空数据库
beforeAll(async () => {
  await clearDatabase();
});

// 运行测试后清空数据库
afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('数据库服务', () => {
  describe('用户相关方法', () => {
    let testUser;
    
    beforeAll(async () => {
      const users = await createTestUsers();
      testUser = users.user;
    });
    
    test('getAll应返回所有用户', async () => {
      const users = await db.users.getAll();
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
    });
    
    test('getById应返回正确的用户', async () => {
      const user = await db.users.getById(testUser.id);
      expect(user).toBeTruthy();
      expect(user.email).toBe(testUser.email);
    });
    
    test('getByEmail应返回正确的用户', async () => {
      const user = await db.users.getByEmail(testUser.email);
      expect(user).toBeTruthy();
      expect(user.id).toBe(testUser.id);
    });
    
    test('create应创建新用户', async () => {
      const newUser = await db.users.create({
        email: 'test-create@example.com',
        password: 'password123',
        username: 'testcreate',
        firstName: 'Test',
        lastName: 'Create',
        role: 'user',
        isAdmin: false,
        status: 'active'
      });
      
      expect(newUser).toBeTruthy();
      expect(newUser.email).toBe('test-create@example.com');
      
      // 验证用户是否真的被创建
      const foundUser = await db.users.getByEmail('test-create@example.com');
      expect(foundUser).toBeTruthy();
    });
    
    test('update应更新用户数据', async () => {
      const updatedUser = await db.users.update(testUser.id, {
        firstName: 'Updated',
        lastName: 'Name'
      });
      
      expect(updatedUser).toBeTruthy();
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      
      // 验证用户是否真的被更新
      const foundUser = await db.users.getById(testUser.id);
      expect(foundUser.firstName).toBe('Updated');
    });
  });
  
  describe('类别相关方法', () => {
    let testCategory;
    
    beforeAll(async () => {
      testCategory = await createTestCategories();
    });
    
    test('getAll应返回所有类别', async () => {
      const categories = await db.categories.getAll();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });
    
    test('getById应返回正确的类别', async () => {
      const category = await db.categories.getById(testCategory.id);
      expect(category).toBeTruthy();
      expect(category.name).toBe(testCategory.name);
    });
    
    test('create应创建新类别', async () => {
      const newCategory = await db.categories.create({
        name: '测试创建类别',
        slug: 'test-create-category',
        description: '测试用创建类别'
      });
      
      expect(newCategory).toBeTruthy();
      expect(newCategory.name).toBe('测试创建类别');
      
      // 验证类别是否真的被创建
      const foundCategory = await db.categories.getById(newCategory.id);
      expect(foundCategory).toBeTruthy();
    });
    
    test('update应更新类别数据', async () => {
      const updatedCategory = await db.categories.update(testCategory.id, {
        name: '更新后的类别',
        description: '已更新的测试类别'
      });
      
      expect(updatedCategory).toBeTruthy();
      expect(updatedCategory.name).toBe('更新后的类别');
      
      // 验证类别是否真的被更新
      const foundCategory = await db.categories.getById(testCategory.id);
      expect(foundCategory.name).toBe('更新后的类别');
    });
  });
  
  describe('产品相关方法', () => {
    let testCategory, testDesigner, testProduct;
    
    beforeAll(async () => {
      testCategory = await createTestCategories();
      testDesigner = await createTestDesigner();
      testProduct = await createTestProduct(testCategory.id, testDesigner.id);
    });
    
    test('getAll应返回所有产品', async () => {
      const products = await db.products.getAll();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
    });
    
    test('getById应返回正确的产品', async () => {
      const product = await db.products.getById(testProduct.id);
      expect(product).toBeTruthy();
      expect(product.name).toBe(testProduct.name);
      expect(product.category).toBeTruthy();
      expect(product.designer).toBeTruthy();
    });
    
    test('getFeatured应返回特色产品', async () => {
      const products = await db.products.getFeatured();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].featured).toBe(true);
    });
    
    test('create应创建新产品', async () => {
      const newProduct = await db.products.create({
        name: '测试创建产品',
        slug: 'test-create-product',
        sku: 'TEST002',
        price: 299.99,
        stock: 5,
        description: '测试用创建产品',
        categoryId: testCategory.id,
        designerId: testDesigner.id
      });
      
      expect(newProduct).toBeTruthy();
      expect(newProduct.name).toBe('测试创建产品');
      
      // 验证产品是否真的被创建
      const foundProduct = await db.products.getById(newProduct.id);
      expect(foundProduct).toBeTruthy();
    });
    
    test('update应更新产品数据', async () => {
      const updatedProduct = await db.products.update(testProduct.id, {
        name: '更新后的产品',
        price: 399.99
      });
      
      expect(updatedProduct).toBeTruthy();
      expect(updatedProduct.name).toBe('更新后的产品');
      expect(updatedProduct.price).toBe(399.99);
      
      // 验证产品是否真的被更新
      const foundProduct = await db.products.getById(testProduct.id);
      expect(foundProduct.name).toBe('更新后的产品');
    });
  });
}); 