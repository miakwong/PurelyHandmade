/**
 * API路由处理器
 * 处理来自前端的API请求并与数据库交互
 */
require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs'); // 用于密码加密

// 获取JWT相关环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// 身份验证中间件
const authenticateUser = (req, res, next) => {
  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ success: false, data: '未提供身份验证令牌' });
  }
  
  try {
    // 在实际应用中，这里应该验证JWT令牌
    // 简单起见，我们只检查localStorage中的authToken
    // 在生产环境中，使用适当的JWT验证
    req.user = { id: 1, isAdmin: true }; // 假设用户已验证
    next();
  } catch (error) {
    return res.status(401).json({ success: false, data: '无效的令牌' });
  }
};

// 管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ success: false, data: '需要管理员权限' });
  }
  next();
};

// 用户API路由
// GET /api/users - 获取所有用户（仅限管理员）
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await db.users.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// GET /api/users/:id - 获取特定用户
router.get('/users/:id', authenticateUser, async (req, res) => {
  try {
    const user = await db.users.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, data: '用户不存在' });
    }
    
    // 确保用户只能访问自己的数据，除非是管理员
    if (req.user.id !== user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, data: '没有权限' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// POST /api/users - 创建新用户
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    
    // 检查必填字段
    if (!email || !password) {
      return res.status(400).json({ success: false, data: '邮箱和密码为必填项' });
    }
    
    // 检查邮箱是否已存在
    const existingUser = await db.users.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, data: '此邮箱已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const newUser = await db.users.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username: username || email.split('@')[0],
      role: 'user',
      isAdmin: false,
      status: 'active'
    });
    
    // 移除密码后返回用户数据
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('创建用户出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// PUT /api/users/:id - 更新用户
router.put('/users/:id', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    // 确保用户只能更新自己的数据，除非是管理员
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, data: '没有权限' });
    }
    
    // 获取要更新的字段
    const { 
      firstName, lastName, phone, address, 
      birthday, gender, avatar, bio 
    } = req.body;
    
    // 仅管理员可更新的字段
    let adminFields = {};
    if (req.user.isAdmin) {
      const { role, isAdmin, status, canOrder } = req.body;
      adminFields = { role, isAdmin, status, canOrder };
    }
    
    // 更新用户
    const updatedUser = await db.users.update(userId, {
      firstName,
      lastName,
      phone,
      address,
      birthday,
      gender,
      avatar,
      bio,
      ...adminFields
    });
    
    // 移除密码后返回更新后的用户数据
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('更新用户出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 认证路由
// POST /api/auth/login - 用户登录
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 检查必填字段
    if (!email || !password) {
      return res.status(400).json({ success: false, data: '邮箱和密码为必填项' });
    }
    
    // 查找用户
    const user = await db.users.getByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, data: '邮箱或密码不正确' });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, data: '此账号已被禁用' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, data: '邮箱或密码不正确' });
    }
    
    // 更新最后登录时间
    await db.users.update(user.id, { lastLogin: new Date() });
    
    // 生成认证令牌（在实际应用中，使用JWT）
    // 简单起见，这里返回一个假的令牌
    const authToken = 'fake-jwt-token';
    
    // 移除密码后返回用户数据和令牌
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: authToken
      }
    });
  } catch (error) {
    console.error('登录出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 产品API路由
// GET /api/products - 获取所有产品
router.get('/products', async (req, res) => {
  try {
    const products = await db.products.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('获取产品出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// GET /api/products/:id - 获取特定产品
router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.products.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, data: '产品不存在' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('获取产品出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// POST /api/products - 创建新产品（仅限管理员）
router.post('/products', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      name, slug, sku, price, stock, description,
      image, gallery, featured, active, categoryId, designerId
    } = req.body;
    
    // 检查必填字段
    if (!name || !slug || !sku || price === undefined) {
      return res.status(400).json({ success: false, data: '名称、Slug、SKU和价格为必填项' });
    }
    
    // 创建产品
    const newProduct = await db.products.create({
      name,
      slug,
      sku,
      price: parseFloat(price),
      stock: stock !== undefined ? Number(stock) : 0,
      description,
      image,
      gallery,
      featured: !!featured,
      active: active !== undefined ? !!active : true,
      categoryId: categoryId ? Number(categoryId) : null,
      designerId: designerId ? Number(designerId) : null
    });
    
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('创建产品出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// PUT /api/products/:id - 更新产品（仅限管理员）
router.put('/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const {
      name, slug, sku, price, stock, description,
      image, gallery, featured, active, categoryId, designerId
    } = req.body;
    
    // 更新产品
    const updatedProduct = await db.products.update(productId, {
      name,
      slug,
      sku,
      price: price !== undefined ? parseFloat(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      description,
      image,
      gallery,
      featured: featured !== undefined ? !!featured : undefined,
      active: active !== undefined ? !!active : undefined,
      categoryId: categoryId ? Number(categoryId) : null,
      designerId: designerId ? Number(designerId) : null
    });
    
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('更新产品出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 删除产品（仅限管理员）
router.delete('/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    await db.products.delete(productId);
    res.json({ success: true, data: '产品已删除' });
  } catch (error) {
    console.error('删除产品出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 类别API路由
// GET /api/categories - 获取所有类别
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.categories.getAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取类别出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 订单API路由
// GET /api/orders - 获取所有订单（仅限管理员）或当前用户的订单
router.get('/orders', authenticateUser, async (req, res) => {
  try {
    // 检查是否请求所有订单
    const getAllOrders = req.query.all === '1' && req.user.isAdmin;
    
    if (getAllOrders) {
      // 管理员可以获取所有订单
      const orders = await db.orders.getAll();
      return res.json({ success: true, data: orders });
    } else {
      // 普通用户只能获取自己的订单
      const orders = await db.orders.getByUserId(req.user.id);
      return res.json({ success: true, data: orders });
    }
  } catch (error) {
    console.error('获取订单出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// POST /api/orders - 创建新订单
router.post('/orders', authenticateUser, async (req, res) => {
  try {
    const {
      items, totalAmount, shippingInfo, paymentInfo, notes
    } = req.body;
    
    // 检查必填字段
    if (!items || !items.length || totalAmount === undefined) {
      return res.status(400).json({ success: false, data: '订单项和总金额为必填项' });
    }
    
    // 创建订单
    const newOrder = await db.orders.create({
      userId: req.user.id,
      totalAmount: parseFloat(totalAmount),
      shippingInfo,
      paymentInfo,
      notes,
      items
    });
    
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('创建订单出错:', error);
    res.status(500).json({ success: false, data: '服务器错误' });
  }
});

// 添加更多API路由...
// 例如设计师、评论等

module.exports = router; 