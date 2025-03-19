/**
 * 订单和支付测试
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

// 订单ID
let orderId;

// 在所有测试前初始化测试环境
beforeAll(async () => {
  testData = await setupTestEnv();
}, 30000);

// 在所有测试后清理测试环境
afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('订单和支付测试', () => {
  test('应能创建新订单', async () => {
    const response = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${global.testUsers.user.token}`)
      .send({
        items: [
          {
            productId: testData.product.id,
            quantity: 2,
            price: testData.product.price
          }
        ],
        totalAmount: testData.product.price * 2,
        shippingInfo: {
          address: '测试地址',
          city: '测试城市',
          postalCode: '123456',
          country: '中国'
        },
        paymentInfo: {
          method: 'credit_card',
          status: 'pending'
        },
        notes: '订单测试'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeTruthy();
    
    // 保存订单ID以供后续测试使用
    orderId = response.body.data.id;
  });
  
  test('订单创建后应减少产品库存', async () => {
    // 获取产品最新状态
    const product = await prisma.product.findUnique({
      where: { id: testData.product.id }
    });
    
    // 验证库存已减少
    expect(product.stock).toBe(testData.product.stock - 2);
  });
  
  test('应能获取用户的所有订单', async () => {
    const response = await request
      .get('/api/orders')
      .set('Authorization', `Bearer ${global.testUsers.user.token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
  
  test('管理员应能获取所有用户的订单', async () => {
    const response = await request
      .get('/api/orders?all=1')
      .set('Authorization', `Bearer ${global.testUsers.admin.token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
  
  test('非管理员不应能获取其他用户的订单', async () => {
    // 创建第二个用户的订单
    const secondUser = await prisma.user.create({
      data: {
        email: 'second-user@example.com',
        password: await require('bcryptjs').hash('password123', 10),
        username: 'seconduser',
        role: 'user',
        isAdmin: false,
        status: 'active'
      }
    });
    
    // 创建第二个用户的订单
    await prisma.order.create({
      data: {
        userId: secondUser.id,
        totalAmount: 100,
        status: 'pending',
        orderItems: {
          create: {
            productId: testData.product.id,
            quantity: 1,
            price: 100
          }
        }
      }
    });
    
    // 第一个用户尝试获取所有订单
    const response = await request
      .get('/api/orders?all=1')
      .set('Authorization', `Bearer ${global.testUsers.user.token}`);
    
    // 验证只能看到自己的订单
    expect(response.body.data.every(order => order.userId === testData.users.user.id)).toBe(true);
  });
  
  // 订单流程测试
  describe('订单流程', () => {
    // 假设这些测试依赖于上述创建的订单
    
    test('管理员应能更新订单状态', async () => {
      // 这里应该是PUT /api/orders/:id/status接口，但示例API中没有实现
      // 这是一个假设的测试
      const updateStatusResponse = await request
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${global.testUsers.admin.token}`)
        .send({ status: 'processing' });
      
      // 假设接口返回更新后的订单
      expect(updateStatusResponse.body.success).toBe(true);
      expect(updateStatusResponse.body.data.status).toBe('processing');
    });
    
    test('普通用户不应能更新订单状态', async () => {
      // 同样是假设的测试
      const updateStatusResponse = await request
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${global.testUsers.user.token}`)
        .send({ status: 'shipped' });
      
      expect(updateStatusResponse.status).toBe(403);
    });
  });
}); 