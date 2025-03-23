/**
 * Data Service for Purely Handmade
 * 
 * 提供统一的数据访问层，处理客户端数据的获取和管理
 * Provides a unified data access layer for handling client-side data retrieval and management
 */

// API 基础 URL
const API_BASE_URL = '/api';

// 定义 DataService 对象
const DataService = {
  /**
   * 获取授权令牌
   * @returns {string|null} 授权令牌
   */
  getAuthToken: function() {
    return localStorage.getItem('authToken');
  },
  
  /**
   * 设置授权令牌
   * @param {string} token 授权令牌
   */
  setAuthToken: function(token) {
    localStorage.setItem('authToken', token);
  },
  
  /**
   * 创建带授权的请求头
   * @returns {Object} 请求头对象
   */
  getAuthHeaders: function() {
    const token = this.getAuthToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  },
  
  /**
   * API 请求基础方法
   * @param {string} endpoint API终端路径
   * @param {Object} options 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async apiRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      // 默认选项
      const defaultOptions = {
        headers: this.getAuthHeaders()
      };
      
      // 合并选项
      const fetchOptions = {...defaultOptions, ...options};
      
      // 执行请求
      const response = await fetch(url, fetchOptions);
      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error(`API请求失败 (${endpoint}):`, error);
      return { success: false, message: '网络错误或服务器无响应' };
    }
  },
  
  /**
   * 获取所有产品
   * Get all products
   * @returns {Promise<Array>} 产品列表 Product list
   */
  getAllProducts: async function() {
    try {
      const result = await this.apiRequest('/products');
      if (result.success) {
        return result.data.products || [];
      }
      console.error('API request failed:', result.message);
      return [];
    } catch (e) {
      console.error('Error getting products:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取产品
   * Get product by ID
   * @param {number|string} id 产品ID Product ID
   * @returns {Promise<Object|null>} 产品对象或null Product object or null
   */
  getProductById: async function(id) {
    try {
      const result = await this.apiRequest(`/products/detail?id=${id}`);
      if (result.success) {
        return result.data;
      }
      console.error('API request failed:', result.message);
      return null;
    } catch (e) {
      console.error('Error getting product by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取所有类别
   * Get all categories
   * @returns {Promise<Array>} 类别列表 Category list
   */
  getAllCategories: async function() {
    try {
      const result = await this.apiRequest('/categories');
      if (result.success) {
        return result.data.categories || [];
      }
      console.error('API request failed:', result.message);
      return [];
    } catch (e) {
      console.error('Error getting categories:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取类别
   * Get category by ID
   * @param {number|string} id 类别ID Category ID
   * @returns {Promise<Object|null>} 类别对象或null Category object or null
   */
  getCategoryById: async function(id) {
    try {
      const result = await this.apiRequest(`/categories/detail?id=${id}`);
      if (result.success) {
        return result.data;
      }
      console.error('API request failed:', result.message);
      return null;
    } catch (e) {
      console.error('Error getting category by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取所有设计师
   * Get all designers
   * @returns {Promise<Array>} 设计师列表 Designer list
   */
  getAllDesigners: async function() {
    try {
      const result = await this.apiRequest('/designers');
      if (result.success) {
        return result.data.designers || [];
      }
      console.error('API request failed:', result.message);
      return [];
    } catch (e) {
      console.error('Error getting designers:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取设计师
   * Get designer by ID
   * @param {number|string} id 设计师ID Designer ID
   * @returns {Promise<Object|null>} 设计师对象或null Designer object or null
   */
  getDesignerById: async function(id) {
    try {
      const result = await this.apiRequest(`/designers/detail?id=${id}`);
      if (result.success) {
        return result.data;
      }
      console.error('API request failed:', result.message);
      return null;
    } catch (e) {
      console.error('Error getting designer by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取新到货产品
   * Get new arrival products
   * @param {number} days 天数 Number of days
   * @returns {Promise<Array>} 新产品列表 New products list
   */
  getNewArrivals: async function(days = 7) {
    try {
      const products = await this.getAllProducts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return products.filter(product => {
        const createdAt = new Date(product.createdAt || product.listingDate);
        return createdAt >= cutoffDate;
      });
    } catch (e) {
      console.error('Error getting new arrivals:', e);
      return [];
    }
  },
  
  /**
   * 获取特色产品
   * Get featured products
   * @returns {Promise<Array>} 特色产品列表 Featured products list
   */
  getFeaturedProducts: async function() {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.featured);
    } catch (e) {
      console.error('Error getting featured products:', e);
      return [];
    }
  },
  
  /**
   * 获取促销产品
   * Get on sale products
   * @returns {Promise<Array>} 促销产品列表 On sale products list
   */
  getOnSaleProducts: async function() {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.onSale);
    } catch (e) {
      console.error('Error getting on sale products:', e);
      return [];
    }
  },
  
  /**
   * 获取按类别分类的产品
   * Get products by category
   * @param {number|string} categoryId 类别ID Category ID
   * @returns {Promise<Array>} 产品列表 Product list
   */
  getProductsByCategory: async function(categoryId) {
    try {
      const products = await this.getAllProducts();
      return products.filter(product => product.categoryId == categoryId);
    } catch (e) {
      console.error('Error getting products by category:', e);
      return [];
    }
  },
  
  /**
   * 获取购物车数据
   * Get cart data
   * @returns {Array} 购物车项目列表 Cart items list
   */
  getCart: function() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      console.error('Error getting cart:', e);
      return [];
    }
  },
  
  /**
   * 更新购物车
   * Update cart
   * @param {Array} cart 购物车数据 Cart data
   * @returns {boolean} 成功状态 Success status
   */
  updateCart: function(cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      return true;
    } catch (e) {
      console.error('Error updating cart:', e);
      return false;
    }
  },
  
  /**
   * 添加产品到购物车
   * Add product to cart
   * @param {string} productId 产品ID Product ID
   * @param {number} quantity 数量 Quantity
   * @returns {boolean} 成功状态 Success status
   */
  addToCart: async function(productId, quantity = 1) {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        console.error('Product not found:', productId);
        return false;
      }
      
      const cart = this.getCart();
      const existingItem = cart.find(item => item.productId == productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId: productId,
          quantity: quantity
        });
      }
      
      return this.updateCart(cart);
    } catch (e) {
      console.error('Error adding to cart:', e);
      return false;
    }
  },
  
  /**
   * 从购物车中移除产品
   * Remove product from cart
   * @param {string} productId 产品ID Product ID
   * @returns {boolean} 成功状态 Success status
   */
  removeFromCart: function(productId) {
    try {
      const cart = this.getCart();
      const updatedCart = cart.filter(item => item.productId != productId);
      return this.updateCart(updatedCart);
    } catch (e) {
      console.error('Error removing from cart:', e);
      return false;
    }
  },
  
  /**
   * 更新购物车中产品数量
   * Update product quantity in cart
   * @param {string} productId 产品ID Product ID
   * @param {number} quantity 新数量 New quantity
   * @returns {boolean} 成功状态 Success status
   */
  updateCartItemQuantity: function(productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      
      const cart = this.getCart();
      const item = cart.find(item => item.productId == productId);
      
      if (item) {
        item.quantity = quantity;
        return this.updateCart(cart);
      }
      
      return false;
    } catch (e) {
      console.error('Error updating cart item quantity:', e);
      return false;
    }
  },
  
  /**
   * 清空购物车
   * Clear cart
   * @returns {boolean} 成功状态 Success status
   */
  clearCart: function() {
    try {
      localStorage.setItem('cart', '[]');
      return true;
    } catch (e) {
      console.error('Error clearing cart:', e);
      return false;
    }
  },
  
  /**
   * 用户注册
   * User registration
   * @param {Object} userData 用户数据 User data
   * @returns {Promise<Object>} 注册结果 Registration result
   */
  register: async function(userData) {
    try {
      const result = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (result.success) {
        return { success: true, user: result.data };
      } else {
        return { success: false, message: result.message || '注册失败' };
      }
    } catch (e) {
      console.error('Error during registration:', e);
      return { success: false, message: '注册时发生错误，请稍后再试' };
    }
  },
  
  /**
   * 用户登录
   * User login
   * @param {string} email 邮箱 Email
   * @param {string} password 密码 Password
   * @returns {Promise<Object>} 登录结果 Login result
   */
  login: async function(email, password) {
    try {
      const result = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (result.success) {
        const { user, token } = result.data;
        this.setCurrentUser(user);
        this.setAuthToken(token);
        return { success: true, user };
      } else {
        return { success: false, message: result.message || '登录失败' };
      }
    } catch (e) {
      console.error('Error during login:', e);
      return { success: false, message: '登录时发生错误，请稍后再试' };
    }
  },
  
  /**
   * 获取当前用户
   * Get current user
   * @returns {Object|null} 用户对象或null User object or null
   */
  getCurrentUser: function() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error getting current user:', e);
      return null;
    }
  },
  
  /**
   * 获取当前用户信息（从API）
   * Get current user profile from API
   * @returns {Promise<Object|null>} 用户对象或null User object or null
   */
  getUserProfile: async function() {
    try {
      const result = await this.apiRequest('/auth/profile', {
        method: 'GET'
      });
      
      if (result.success) {
        // 更新本地存储的用户信息
        this.setCurrentUser(result.data);
        return result.data;
      }
      return null;
    } catch (e) {
      console.error('Error getting user profile:', e);
      return null;
    }
  },
  
  /**
   * 设置当前用户
   * Set current user
   * @param {Object} user 用户对象 User object
   * @returns {boolean} 成功状态 Success status
   */
  setCurrentUser: function(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (e) {
      console.error('Error setting current user:', e);
      return false;
    }
  },
  
  /**
   * 用户登出
   * User logout
   * @returns {boolean} 成功状态 Success status
   */
  logout: function() {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      return true;
    } catch (e) {
      console.error('Error during logout:', e);
      return false;
    }
  },
  
  /**
   * 获取当前用户的订单
   * Get current user's orders
   * @returns {Promise<Array>} 订单列表 Order list
   */
  getUserOrders: async function() {
    try {
      const result = await this.apiRequest('/orders');
      if (result.success) {
        return result.data.orders || [];
      }
      console.error('Failed to get orders:', result.message);
      return [];
    } catch (e) {
      console.error('Error getting user orders:', e);
      return [];
    }
  },
  
  /**
   * 获取订单详情
   * Get order details
   * @param {number} orderId 订单ID
   * @returns {Promise<Object|null>} 订单详情
   */
  getOrderDetails: async function(orderId) {
    try {
      const result = await this.apiRequest(`/orders/detail?id=${orderId}`);
      if (result.success) {
        return result.data;
      }
      console.error('Failed to get order details:', result.message);
      return null;
    } catch (e) {
      console.error('Error getting order details:', e);
      return null;
    }
  },
  
  /**
   * 创建订单
   * Create order
   * @param {Object} orderData 订单数据 Order data
   * @returns {Promise<Object>} 创建结果 Creation result
   */
  createOrder: async function(orderData) {
    try {
      const result = await this.apiRequest('/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      if (result.success) {
        return { success: true, order: result.data };
      }
      return { success: false, message: result.message || '创建订单失败' };
    } catch (e) {
      console.error('Error creating order:', e);
      return { success: false, message: '创建订单时发生错误，请稍后再试' };
    }
  },
  
  /**
   * 提交产品评论
   * Submit product review
   * @param {string} productId 产品ID Product ID
   * @param {Object} reviewData 评论数据 Review data
   * @returns {Promise<Object>} 提交结果 Submission result
   */
  submitReview: async function(productId, reviewData) {
    try {
      const result = await this.apiRequest('/reviews/create', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          ...reviewData
        })
      });
      
      if (result.success) {
        return { success: true, review: result.data };
      }
      return { success: false, message: result.message || '提交评论失败' };
    } catch (e) {
      console.error('Error submitting review:', e);
      return { success: false, message: '提交评论时发生错误，请稍后再试' };
    }
  },
  
  /**
   * 获取产品评论
   * Get product reviews
   * @param {string} productId 产品ID Product ID
   * @returns {Promise<Array>} 评论列表 Review list
   */
  getProductReviews: async function(productId) {
    try {
      const result = await this.apiRequest(`/reviews?productId=${productId}`);
      if (result.success) {
        return result.data.reviews || [];
      }
      console.error('Failed to get reviews:', result.message);
      return [];
    } catch (e) {
      console.error('Error getting product reviews:', e);
      return [];
    }
  }
};

// 导出模块，支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
} else if (typeof window !== 'undefined') {
  window.DataService = DataService;
} 