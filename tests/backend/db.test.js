/**
 * 数据库功能测试
 * 测试数据库连接和基本CRUD操作
 */

const db = require('../../src/server/db');

// 测试数据
const testProduct = {
  name: '测试产品',
  price: 99.99,
  description: '这是一个测试产品',
  category: '测试类别',
  stock: 10,
  image: 'test.jpg'
};

const testUser = {
  email: 'dbtest@example.com',
  password: 'hashedpassword123',
  firstName: 'DB',
  lastName: 'Test',
  username: 'dbtest',
  role: 'user',
  isAdmin: false,
  status: 'active'
};

// 在所有测试前清理数据库
beforeAll(async () => {
  try {
    // 删除测试数据（如果存在）
    await db.users.deleteByEmail(testUser.email);
    const existingProduct = await db.products.getByName(testProduct.name);
    if (existingProduct) {
      await db.products.delete(existingProduct.id);
    }
  } catch (error) {
    console.error('清理数据库出错:', error);
  }
});

// 在所有测试后清理数据库
afterAll(async () => {
  try {
    // 删除测试数据
    await db.users.deleteByEmail(testUser.email);
    const existingProduct = await db.products.getByName(testProduct.name);
    if (existingProduct) {
      await db.products.delete(existingProduct.id);
    }
  } catch (error) {
    console.error('清理数据库出错:', error);
  }
});

describe('数据库功能测试', () => {
  // 测试数据库连接
  describe('数据库连接', () => {
    it('应该能够连接到数据库', async () => {
      // 简单的查询来测试连接
      const result = await db.query('SELECT 1 as result');
      expect(result[0].result).toBe(1);
    });
  });

  // 测试用户相关数据库操作
  describe('用户数据库操作', () => {
    let userId;

    it('应该能够创建新用户', async () => {
      const user = await db.users.create(testUser);
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testUser.email);
      
      // 保存用户ID以便后续测试使用
      userId = user.id;
    });

    it('应该能够通过ID查找用户', async () => {
      const user = await db.users.getById(userId);
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(testUser.email);
    });

    it('应该能够通过电子邮件查找用户', async () => {
      const user = await db.users.getByEmail(testUser.email);
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(testUser.email);
    });

    it('应该能够更新用户信息', async () => {
      const updatedUser = await db.users.update(userId, {
        firstName: '已更新',
        lastName: '名字'
      });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(userId);
      expect(updatedUser.firstName).toBe('已更新');
      expect(updatedUser.lastName).toBe('名字');
    });

    it('应该能够删除用户', async () => {
      await db.users.delete(userId);
      const user = await db.users.getById(userId);
      expect(user).toBeNull();
    });
  });

  // 测试产品相关数据库操作
  describe('产品数据库操作', () => {
    let productId;

    it('应该能够创建新产品', async () => {
      const product = await db.products.create(testProduct);
      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.name).toBe(testProduct.name);
      
      // 保存产品ID以便后续测试使用
      productId = product.id;
    });

    it('应该能够通过ID查找产品', async () => {
      const product = await db.products.getById(productId);
      expect(product).toBeDefined();
      expect(product.id).toBe(productId);
      expect(product.name).toBe(testProduct.name);
    });

    it('应该能够查找所有产品', async () => {
      const products = await db.products.getAll();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      
      // 检查我们的测试产品是否在列表中
      const found = products.some(p => p.id === productId);
      expect(found).toBe(true);
    });

    it('应该能够更新产品信息', async () => {
      const updatedProduct = await db.products.update(productId, {
        name: '已更新的测试产品',
        price: 199.99
      });
      
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.id).toBe(productId);
      expect(updatedProduct.name).toBe('已更新的测试产品');
      expect(updatedProduct.price).toBe(199.99);
    });

    it('应该能够删除产品', async () => {
      await db.products.delete(productId);
      const product = await db.products.getById(productId);
      expect(product).toBeNull();
    });
  });

  // 测试订单相关数据库操作
  describe('订单数据库操作', () => {
    let userId, productId, orderId;

    // 在测试前准备数据
    beforeAll(async () => {
      // 创建测试用户
      const user = await db.users.create(testUser);
      userId = user.id;
      
      // 创建测试产品
      const product = await db.products.create(testProduct);
      productId = product.id;
    });

    it('应该能够创建新订单', async () => {
      const orderData = {
        userId,
        status: 'pending',
        total: testProduct.price,
        items: [
          {
            productId,
            quantity: 1,
            price: testProduct.price
          }
        ]
      };
      
      const order = await db.orders.create(orderData);
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.userId).toBe(userId);
      
      // 保存订单ID以便后续测试使用
      orderId = order.id;
    });

    it('应该能够通过ID查找订单', async () => {
      const order = await db.orders.getById(orderId);
      expect(order).toBeDefined();
      expect(order.id).toBe(orderId);
      expect(order.userId).toBe(userId);
    });

    it('应该能够查找用户的所有订单', async () => {
      const orders = await db.orders.getByUserId(userId);
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      
      // 检查我们的测试订单是否在列表中
      const found = orders.some(o => o.id === orderId);
      expect(found).toBe(true);
    });

    it('应该能够更新订单状态', async () => {
      const updatedOrder = await db.orders.update(orderId, {
        status: 'completed'
      });
      
      expect(updatedOrder).toBeDefined();
      expect(updatedOrder.id).toBe(orderId);
      expect(updatedOrder.status).toBe('completed');
    });

    it('应该能够删除订单', async () => {
      await db.orders.delete(orderId);
      const order = await db.orders.getById(orderId);
      expect(order).toBeNull();
    });
  });
}); 