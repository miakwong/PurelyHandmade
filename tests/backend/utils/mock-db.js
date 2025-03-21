/**
 * 模拟数据库服务
 * 用于测试而不依赖真实数据库
 */

// 使用内存数据结构存储测试数据
const db = {
  users: [],
  products: [],
  orders: [],
  categories: [],
  designers: [],
  reviews: []
};

// 用户服务
const users = {
  // 获取所有用户
  getAll: async () => {
    return [...db.users];
  },
  
  // 通过ID获取用户
  getById: async (id) => {
    const user = db.users.find(u => u.id === Number(id));
    return user ? { ...user } : null;
  },
  
  // 通过电子邮件获取用户
  getByEmail: async (email) => {
    const user = db.users.find(u => u.email === email);
    return user ? { ...user } : null;
  },
  
  // 创建用户
  create: async (userData) => {
    const newUser = {
      id: db.users.length + 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    return { ...newUser };
  },
  
  // 更新用户
  update: async (id, userData) => {
    const index = db.users.findIndex(u => u.id === Number(id));
    if (index === -1) return null;
    
    db.users[index] = {
      ...db.users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    return { ...db.users[index] };
  },
  
  // 删除用户
  delete: async (id) => {
    const index = db.users.findIndex(u => u.id === Number(id));
    if (index === -1) return null;
    
    const deletedUser = db.users[index];
    db.users.splice(index, 1);
    return { ...deletedUser };
  },
  
  // 通过电子邮件删除用户
  deleteByEmail: async (email) => {
    const index = db.users.findIndex(u => u.email === email);
    if (index === -1) return null;
    
    const deletedUser = db.users[index];
    db.users.splice(index, 1);
    return { ...deletedUser };
  }
};

// 产品服务
const products = {
  // 获取所有产品
  getAll: async () => {
    return [...db.products];
  },
  
  // 通过ID获取产品
  getById: async (id) => {
    const product = db.products.find(p => p.id === Number(id));
    return product ? { ...product } : null;
  },
  
  // 通过名称获取产品
  getByName: async (name) => {
    const product = db.products.find(p => p.name === name);
    return product ? { ...product } : null;
  },
  
  // 创建产品
  create: async (productData) => {
    const newProduct = {
      id: db.products.length + 1,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.products.push(newProduct);
    return { ...newProduct };
  },
  
  // 更新产品
  update: async (id, productData) => {
    const index = db.products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    
    db.products[index] = {
      ...db.products[index],
      ...productData,
      updatedAt: new Date()
    };
    
    return { ...db.products[index] };
  },
  
  // 删除产品
  delete: async (id) => {
    const index = db.products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    
    const deletedProduct = db.products[index];
    db.products.splice(index, 1);
    return { ...deletedProduct };
  }
};

// 订单服务
const orders = {
  // 获取所有订单
  getAll: async () => {
    return [...db.orders];
  },
  
  // 通过ID获取订单
  getById: async (id) => {
    const order = db.orders.find(o => o.id === Number(id));
    return order ? { ...order } : null;
  },
  
  // 获取用户的所有订单
  getByUserId: async (userId) => {
    return db.orders.filter(o => o.userId === Number(userId)).map(o => ({ ...o }));
  },
  
  // 创建订单
  create: async (orderData) => {
    const newOrder = {
      id: orderData.id || db.orders.length + 1,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.orders.push(newOrder);
    return { ...newOrder };
  },
  
  // 更新订单
  update: async (id, orderData) => {
    const index = db.orders.findIndex(o => o.id === Number(id));
    if (index === -1) return null;
    
    db.orders[index] = {
      ...db.orders[index],
      ...orderData,
      updatedAt: new Date()
    };
    
    return { ...db.orders[index] };
  },
  
  // 更新订单状态
  updateStatus: async (id, status) => {
    const index = db.orders.findIndex(o => o.id === Number(id));
    if (index === -1) return null;
    
    db.orders[index].status = status;
    db.orders[index].updatedAt = new Date();
    
    return { ...db.orders[index] };
  },
  
  // 删除订单
  delete: async (id) => {
    const index = db.orders.findIndex(o => o.id === Number(id));
    if (index === -1) return null;
    
    const deletedOrder = db.orders[index];
    db.orders.splice(index, 1);
    return { ...deletedOrder };
  },
  
  // 获取订单总数
  getCount: async () => {
    return db.orders.length;
  },
  
  // 获取用户订单总数
  getCountByUserId: async (userId) => {
    return db.orders.filter(o => o.userId === Number(userId)).length;
  },
  
  // 分页获取订单
  getPaginated: async (skip, limit) => {
    return db.orders.slice(skip, skip + limit).map(o => ({ ...o }));
  },
  
  // 分页获取用户订单
  getPaginatedByUserId: async (userId, skip, limit) => {
    return db.orders
      .filter(o => o.userId === Number(userId))
      .slice(skip, skip + limit)
      .map(o => ({ ...o }));
  }
};

// 通用查询函数
const query = async (sql) => {
  // 简单的SQL查询模拟，只处理最简单的SELECT查询
  if (sql.includes('SELECT 1')) {
    return [{ result: 1 }];
  }
  return [];
};

// 清理所有测试数据
const clearAll = () => {
  db.users = [];
  db.products = [];
  db.orders = [];
  db.categories = [];
  db.designers = [];
  db.reviews = [];
};

// 导出数据库服务
module.exports = {
  users,
  products,
  orders,
  query,
  clearAll
}; 