/**
 * 数据库访问层 
 * 使用MySQL2直接连接数据库
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

// 尝试不同的MySQL socket路径
const potentialSocketPaths = [
  '/opt/homebrew/var/mysql/mysql.sock',  // Homebrew ARM Mac默认路径
  '/tmp/mysql.sock',                     // 传统路径
  '/var/run/mysqld/mysqld.sock'          // Linux通用路径
];

// 找到第一个存在的socket路径
let socketPath = null;
for (const path of potentialSocketPaths) {
  if (fs.existsSync(path)) {
    socketPath = path;
    console.log(`找到MySQL socket: ${path}`);
    break;
  }
}

if (!socketPath) {
  console.warn('未找到MySQL socket文件，将尝试通过TCP/IP连接');
}

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'no15438',
  password: process.env.DB_PASSWORD || '158795',
  database: process.env.DB_NAME || 'purely_handmade',
  socketPath: socketPath,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 启用详细日志
  debug: ['ComQueryPacket', 'RowDataPacket']
});

// 测试连接
async function testConnection() {
  let connection;
  try {
    console.log('正在尝试连接到MySQL...');
    console.log(`使用配置: 主机=${process.env.DB_HOST || 'localhost'}, 用户=${process.env.DB_USER || 'no15438'}, 数据库=${process.env.DB_NAME || 'purely_handmade'}`);
    
    if (socketPath) {
      console.log(`通过socket连接: ${socketPath}`);
    } else {
      console.log('通过TCP/IP连接');
    }
    
    connection = await pool.getConnection();
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 AS test');
    
    console.log(`数据库连接成功! 测试查询结果: ${JSON.stringify(rows)}`);
    return true;
  } catch (error) {
    console.error('数据库连接失败详情:');
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
    console.error('错误号:', error.errno);
    console.error('SQL状态:', error.sqlState);
    
    // 尝试提供更多错误上下文
    console.error('堆栈跟踪:', error.stack);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('数据库不存在，尝试创建...');
      await createDatabase();
    }
    
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// 创建数据库
async function createDatabase() {
  try {
    // 创建不指定数据库的连接
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'no15438',
      password: process.env.DB_PASSWORD || '158795',
      socketPath: socketPath,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    const connection = await tempPool.getConnection();
    
    try {
      // 创建数据库
      const dbName = process.env.DB_NAME || 'purely_handmade';
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`数据库 ${dbName} 创建成功!`);
      
      // 创建示例表
      await connection.execute(`USE ${dbName}`);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS User (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(191) NOT NULL UNIQUE,
          username VARCHAR(191) UNIQUE,
          password VARCHAR(191) NOT NULL,
          firstName VARCHAR(191),
          lastName VARCHAR(191),
          phone VARCHAR(191),
          address VARCHAR(191),
          birthday DATETIME(3),
          gender VARCHAR(191),
          avatar VARCHAR(191),
          role VARCHAR(191) NOT NULL DEFAULT 'user',
          isAdmin BOOLEAN NOT NULL DEFAULT 0,
          status VARCHAR(191) NOT NULL DEFAULT 'active',
          bio TEXT,
          canOrder BOOLEAN NOT NULL DEFAULT 1,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          lastLogin DATETIME(3)
        )
      `);
      
      console.log('用户表创建成功!');
      
      // 检查是否有示例用户
      const [users] = await connection.execute('SELECT COUNT(*) AS count FROM User');
      
      if (users[0].count === 0) {
        // 创建管理员用户
        await connection.execute(`
          INSERT INTO User (email, username, password, firstName, lastName, role, isAdmin, status, updatedAt)
          VALUES ('admin@example.com', 'admin', 'password123', 'Admin', 'User', 'admin', 1, 'active', NOW())
        `);
        console.log('管理员用户创建成功!');
      }
      
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('创建数据库失败:', error);
    return false;
  }
}

// 尝试测试连接
testConnection();

// 创建备用数据 - 在数据库连接失败时使用
const mockData = {
  users: [
    {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      username: "admin",
      password: "password123",
      role: "admin",
      isAdmin: true,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      username: "testuser",
      password: "password123",
      role: "user",
      isAdmin: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  products: [],
  categories: [],
  designers: [],
  orders: [],
  reviews: [
    {
      id: 1,
      productId: 1,
      userId: 2,
      rating: 5,
      title: "Great product!",
      content: "This product exceeded my expectations. Highly recommended!",
      status: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      productId: 1, 
      userId: 2,
      rating: 4,
      title: "Pretty good",
      content: "Good quality, but a bit pricey.",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// 通用查询函数 - 包含错误处理和回退到模拟数据
async function query(sql, params = [], mockResult = []) {
  try {
    console.log(`执行SQL查询: ${sql}`);
    console.log(`参数: ${JSON.stringify(params)}`);
    
    const [rows] = await pool.execute(sql, params);
    console.log(`查询成功, 返回 ${rows.length} 行数据`);
    return rows;
  } catch (error) {
    console.error('SQL查询错误:', error.message);
    console.error('错误代码:', error.code);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    console.log('返回模拟数据');
    return mockResult;
  }
}

// 数据库服务对象，提供各种数据访问方法
const DatabaseService = {
  // 用户相关方法
  users: {
    // 获取所有用户
    getAll: async () => {
      return await query(
        'SELECT * FROM User ORDER BY createdAt DESC',
        [],
        mockData.users
      );
    },
    
    // 通过ID获取用户
    getById: async (id) => {
      const users = await query(
        'SELECT * FROM User WHERE id = ?',
        [id],
        mockData.users.filter(u => u.id == id)
      );
      return users[0] || null;
    },
    
    // 通过邮箱获取用户
    getByEmail: async (email) => {
      const users = await query(
        'SELECT * FROM User WHERE email = ?',
        [email],
        mockData.users.filter(u => u.email === email)
      );
      return users[0] || null;
    },
    
    // 创建用户
    create: async (userData) => {
      const { firstName, lastName, email, username, password, role, status } = userData;
      const result = await query(
        'INSERT INTO User (firstName, lastName, email, username, password, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [firstName, lastName, email, username, password, role || 'user', status || 'active'],
        { insertId: mockData.users.length + 1 }
      );
      
      return { id: result.insertId, ...userData };
    },
    
    // 更新用户
    update: async (id, userData) => {
      const { firstName, lastName, email, username, password, role, status } = userData;
      
      // 构建动态更新查询
      let updateFields = [];
      let params = [];
      
      if (firstName !== undefined) {
        updateFields.push('firstName = ?');
        params.push(firstName);
      }
      
      if (lastName !== undefined) {
        updateFields.push('lastName = ?');
        params.push(lastName);
      }
      
      if (email !== undefined) {
        updateFields.push('email = ?');
        params.push(email);
      }
      
      if (username !== undefined) {
        updateFields.push('username = ?');
        params.push(username);
      }
      
      if (password !== undefined) {
        updateFields.push('password = ?');
        params.push(password);
      }
      
      if (role !== undefined) {
        updateFields.push('role = ?');
        params.push(role);
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }
      
      updateFields.push('updatedAt = NOW()');
      
      // 添加ID作为WHERE条件参数
      params.push(id);
      
      if (updateFields.length === 0) {
        return await this.getById(id);
      }
      
      await query(
        `UPDATE User SET ${updateFields.join(', ')} WHERE id = ?`,
        params,
        { affectedRows: 1 }
      );
      
      return await this.getById(id);
    },
    
    // 删除用户
    delete: async (id) => {
      const user = await this.getById(id);
      if (!user) return null;
      
      await query(
        'DELETE FROM User WHERE id = ?',
        [id],
        { affectedRows: 1 }
      );
      
      return user;
    }
  },
  
  // 产品相关方法
  products: {
    // 获取所有产品
    getAll: async () => {
      return await query(
        `SELECT p.*, c.name as categoryName, d.name as designerName
         FROM Product p
         LEFT JOIN Category c ON p.categoryId = c.id
         LEFT JOIN Designer d ON p.designerId = d.id
         ORDER BY p.createdAt DESC`,
        [],
        mockData.products
      );
    },
    
    // 通过ID获取产品
    getById: async (id) => {
      const products = await query(
        `SELECT p.*, c.name as categoryName, d.name as designerName
         FROM Product p
         LEFT JOIN Category c ON p.categoryId = c.id
         LEFT JOIN Designer d ON p.designerId = d.id
         WHERE p.id = ?`,
        [id],
        mockData.products.filter(p => p.id == id)
      );
      
      if (!products[0]) return null;
      
      // 获取产品评论
      const reviews = await query(
        `SELECT r.*, u.firstName, u.lastName, u.username
         FROM Review r
         LEFT JOIN User u ON r.userId = u.id
         WHERE r.productId = ?`,
        [id],
        []
      );
      
      return {
        ...products[0],
        reviews
      };
    },
    
    // 获取特色产品
    getFeatured: async () => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 创建产品
    create: async (productData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 更新产品
    update: async (id, productData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 删除产品
    delete: async (id) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    }
  },
  
  // 类别相关方法
  categories: {
    // 获取所有类别
    getAll: async () => {
      return await query(
        'SELECT * FROM Category',
        [],
        mockData.categories
      );
    },
    
    // 通过ID获取类别
    getById: async (id) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 创建类别
    create: async (categoryData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 更新类别
    update: async (id, categoryData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 删除类别
    delete: async (id) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    }
  },
  
  // 设计师相关方法
  designers: {
    // 获取所有设计师
    getAll: async () => {
      return await query(
        'SELECT * FROM Designer',
        [],
        mockData.designers
      );
    },
    
    // 通过ID获取设计师
    getById: async (id) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 创建设计师
    create: async (designerData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 更新设计师
    update: async (id, designerData) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    },
    
    // 删除设计师
    delete: async (id) => {
      // This method is not provided in the original code or the new implementation
      // It's assumed to exist as it's called in the original code
      throw new Error("Method not implemented");
    }
  },
  
  // 订单相关方法
  orders: {
    // 获取所有订单
    getAll: async () => {
      const orders = await query(
        `SELECT o.*, u.firstName, u.lastName, u.email
         FROM \`Order\` o
         LEFT JOIN \`User\` u ON o.userId = u.id
         ORDER BY o.createdAt DESC`,
        [],
        mockData.orders
      );
      
      // 获取订单项
      for (const order of orders) {
        order.orderItems = await query(
          `SELECT oi.*, p.name as productName, p.price, p.image
           FROM \`OrderItem\` oi
           LEFT JOIN \`Product\` p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id],
          []
        );
      }
      
      return orders;
    },
    
    // 通过ID获取订单
    getById: async (id) => {
      const orders = await query(
        `SELECT o.*, u.firstName, u.lastName, u.email
         FROM \`Order\` o
         LEFT JOIN \`User\` u ON o.userId = u.id
         WHERE o.id = ?`,
        [id],
        mockData.orders.filter(o => o.id == id)
      );
      
      if (!orders[0]) return null;
      
      // 获取订单项
      orders[0].orderItems = await query(
        `SELECT oi.*, p.name as productName, p.price, p.image
         FROM \`OrderItem\` oi
         LEFT JOIN \`Product\` p ON oi.productId = p.id
         WHERE oi.orderId = ?`,
        [id],
        []
      );
      
      return orders[0];
    },
    
    // 获取用户订单
    getByUserId: async (userId) => {
      const orders = await query(
        `SELECT o.*
         FROM \`Order\` o
         WHERE o.userId = ?
         ORDER BY o.createdAt DESC`,
        [userId],
        mockData.orders.filter(o => o.userId == userId)
      );
      
      // 获取每个订单的订单项
      for (const order of orders) {
        order.orderItems = await query(
          `SELECT oi.*, p.name as productName, p.price, p.image
           FROM \`OrderItem\` oi
           LEFT JOIN \`Product\` p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id],
          []
        );
      }
      
      return orders;
    },
    
    // 创建订单
    create: async (orderData) => {
      const { userId, status, totalAmount, shippingInfo, paymentInfo, notes, items } = orderData;
      
      // 插入订单
      const result = await query(
        `INSERT INTO \`Order\` (userId, status, totalAmount, shippingInfo, paymentInfo, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, status || 'pending', totalAmount, 
         JSON.stringify(shippingInfo), 
         JSON.stringify(paymentInfo), 
         notes],
        { insertId: mockData.orders.length + 1 }
      );
      
      const orderId = result.insertId;
      
      // 如果有订单项，插入订单项
      if (items && items.length > 0) {
        for (const item of items) {
          await query(
            `INSERT INTO \`OrderItem\` (orderId, productId, quantity, price)
             VALUES (?, ?, ?, ?)`,
            [orderId, item.productId, item.quantity, item.price],
            { insertId: 1 }
          );
          
          // 更新产品库存
          await query(
            `UPDATE \`Product\` SET stock = stock - ?, updatedAt = NOW()
             WHERE id = ?`,
            [item.quantity, item.productId],
            { affectedRows: 1 }
          );
        }
      }
      
      return { id: orderId, ...orderData };
    },
    
    // 更新订单状态
    updateStatus: async (id, status) => {
      await query(
        `UPDATE \`Order\` SET status = ?, updatedAt = NOW()
         WHERE id = ?`,
        [status, id],
        { affectedRows: 1 }
      );
      
      return await module.exports.orders.getById(id);
    },
    
    // 删除订单
    delete: async (id) => {
      // 先删除相关的订单项
      await query(
        `DELETE FROM \`OrderItem\` WHERE orderId = ?`,
        [id],
        { affectedRows: 1 }
      );
      
      // 删除订单
      await query(
        `DELETE FROM \`Order\` WHERE id = ?`,
        [id],
        { affectedRows: 1 }
      );
      
      return { id };
    },
    
    // 获取订单数量
    getCount: async () => {
      const result = await query(
        `SELECT COUNT(*) as count FROM \`Order\``,
        [],
        [{ count: mockData.orders.length }]
      );
      
      return result[0].count;
    },
    
    // 获取用户订单数量
    getCountByUserId: async (userId) => {
      const result = await query(
        `SELECT COUNT(*) as count FROM \`Order\` WHERE userId = ?`,
        [userId],
        [{ count: mockData.orders.filter(o => o.userId == userId).length }]
      );
      
      return result[0].count;
    },
    
    // 分页获取订单
    getPaginated: async (skip, limit) => {
      const orders = await query(
        `SELECT o.*, u.firstName, u.lastName, u.email
         FROM \`Order\` o
         LEFT JOIN \`User\` u ON o.userId = u.id
         ORDER BY o.createdAt DESC
         LIMIT ?, ?`,
        [skip, limit],
        mockData.orders.slice(skip, skip + limit)
      );
      
      // 获取订单项
      for (const order of orders) {
        order.orderItems = await query(
          `SELECT oi.*, p.name as productName, p.price, p.image
           FROM \`OrderItem\` oi
           LEFT JOIN \`Product\` p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id],
          []
        );
      }
      
      return orders;
    },
    
    // 分页获取用户订单
    getPaginatedByUserId: async (userId, skip, limit) => {
      const orders = await query(
        `SELECT o.*
         FROM \`Order\` o
         WHERE o.userId = ?
         ORDER BY o.createdAt DESC
         LIMIT ?, ?`,
        [userId, skip, limit],
        mockData.orders.filter(o => o.userId == userId).slice(skip, skip + limit)
      );
      
      // 获取订单项
      for (const order of orders) {
        order.orderItems = await query(
          `SELECT oi.*, p.name as productName, p.price, p.image
           FROM \`OrderItem\` oi
           LEFT JOIN \`Product\` p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id],
          []
        );
      }
      
      return orders;
    }
  },
  
  // 评论相关方法
  reviews: {
    // 获取所有评论
    getAll: async () => {
      return await query(
        `SELECT r.*, u.firstName, u.lastName, u.username, p.name as productName
         FROM \`Review\` r
         LEFT JOIN \`User\` u ON r.userId = u.id
         LEFT JOIN \`Product\` p ON r.productId = p.id
         ORDER BY r.createdAt DESC`,
        [],
        mockData.reviews
      );
    },
    
    // 通过ID获取评论
    getById: async (id) => {
      const reviews = await query(
        `SELECT r.*, u.firstName, u.lastName, u.username, p.name as productName
         FROM \`Review\` r
         LEFT JOIN \`User\` u ON r.userId = u.id
         LEFT JOIN \`Product\` p ON r.productId = p.id
         WHERE r.id = ?`,
        [id],
        mockData.reviews.filter(r => r.id == id)
      );
      
      return reviews[0] || null;
    },
    
    // 获取产品评论
    getByProductId: async (productId) => {
      return await query(
        `SELECT r.*, u.firstName, u.lastName, u.username
         FROM \`Review\` r
         LEFT JOIN \`User\` u ON r.userId = u.id
         WHERE r.productId = ? AND r.status = 'approved'
         ORDER BY r.createdAt DESC`,
        [productId],
        mockData.reviews.filter(r => r.productId == productId && r.status === 'approved')
      );
    },
    
    // 创建评论
    create: async (reviewData) => {
      const { productId, userId, rating, title, content, status } = reviewData;
      
      const result = await query(
        `INSERT INTO \`Review\` (productId, userId, rating, title, content, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [productId, userId, rating, title, content, status || 'pending'],
        { insertId: mockData.reviews.length + 1 }
      );
      
      return { id: result.insertId, ...reviewData };
    },
    
    // 更新评论状态
    updateStatus: async (id, status) => {
      await query(
        `UPDATE \`Review\` SET status = ?, updatedAt = NOW()
         WHERE id = ?`,
        [status, id],
        { affectedRows: 1 }
      );
      
      return await module.exports.reviews.getById(id);
    },
    
    // 添加管理员回复
    addReply: async (id, reply) => {
      await query(
        `UPDATE \`Review\` SET adminReply = ?, updatedAt = NOW()
         WHERE id = ?`,
        [reply, id],
        { affectedRows: 1 }
      );
      
      return await module.exports.reviews.getById(id);
    },
    
    // 删除评论
    delete: async (id) => {
      await query(
        `DELETE FROM \`Review\` WHERE id = ?`,
        [id],
        { affectedRows: 1 }
      );
      
      return { id };
    }
  }
};

module.exports = DatabaseService; 