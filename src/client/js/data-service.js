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
      console.log(`DataService: apiRequest() - Making request to ${url}`);
      const response = await fetch(url, fetchOptions);
      console.log(`DataService: apiRequest() - Response status: ${response.status}`);
      const result = await response.json();
      console.log(`DataService: apiRequest() - Response data:`, result);
      
      return result;
    } catch (error) {
      console.error(`DataService: apiRequest() - Request failed (${endpoint}):`, error);
      return { success: false, message: 'Internal Server Error' };
    }
  },
  
  /**
   * 获取所有产品
   * Get all products
   * @returns {Promise<Array>} 产品列表 Product list
   */
  getAllProducts: async function() {
    try {
      console.log('DataService: getAllProducts() - Calling API...');
      const result = await this.apiRequest('/products');
      console.log('DataService: getAllProducts() - API response:', result);
      
      if (result.success) {
        console.log('DataService: getAllProducts() - Successfully fetched products');
        
        // Return the full response to allow for consistent handling at the API data loader
        return result;
      }
      console.error('DataService: getAllProducts() - API request failed:', result.message);
      return { success: false, message: result.message };
    } catch (e) {
      console.error('DataService: getAllProducts() - Error getting products:', e);
      return { success: false, message: e.message };
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
      console.log('DataService: getAllCategories() - Calling API...');
      const result = await this.apiRequest('/categories');
      console.log('DataService: getAllCategories() - API response:', result);
      
      if (result.success) {
        console.log('DataService: getAllCategories() - Successfully fetched categories');
        
        // 确保正确的响应格式
        return {
          success: true,
          message: result.message || "Success",
          data: {
            categories: result.data?.categories || result.data || result.categories || []
          }
        };
      }
      
      console.error('DataService: getAllCategories() - API request failed:', result.message || 'Unknown error');
      return { 
        success: false, 
        message: result.message || 'API request failed', 
        data: { categories: [] } 
      };
    } catch (e) {
        console.error('DataService: getAllCategories() - Error getting categories:', e.message || e);
      return { 
        success: false, 
        message: e.message || 'An error occurred', 
        data: { categories: [] } 
      };
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
      console.log('DataService: getAllDesigners() - Calling API...');
      const result = await this.apiRequest('/designers');
      console.log('DataService: getAllDesigners() - API response:', result);
      
      if (result.success) {
        console.log('DataService: getAllDesigners() - Successfully fetched designers');
        
        // Return the full response to allow for consistent handling at the API data loader
        return result;
      }
      console.error('DataService: getAllDesigners() - API request failed:', result.message);
      return { success: false, message: result.message };
    } catch (e) {
      console.error('DataService: getAllDesigners() - Error getting designers:', e);
      return { success: false, message: e.message };
    }
  },
  
  /**
   * 获取精选设计师
   * Get featured designers
   * @returns {Promise<Array>} 精选设计师列表 Featured designer list
   */
  getFeaturedDesigners: async function() {
    try {
      console.log('DataService: getFeaturedDesigners() - Calling API...');
      const result = await this.apiRequest('/designers/featured');
      console.log('DataService: getFeaturedDesigners() - API response:', result);
      
      if (result.success) {
        console.log('DataService: getFeaturedDesigners() - Successfully fetched featured designers');
        
        // Return the full response to allow for consistent handling at the API data loader
        return result;
      }
      console.error('DataService: getFeaturedDesigners() - API request failed:', result.message);
      return { success: false, message: result.message };
    } catch (e) {
      console.error('DataService: getFeaturedDesigners() - Error getting featured designers:', e);
      return { success: false, message: e.message };
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
   * 获取当前登录用户信息
   * @returns {Object|null} 当前用户信息或null
   */
  getCurrentUser: function() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing current user:', e);
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
        this.setCurrentUser(result.data, this.getAuthToken());
        return result.data;
      }
      return null;
    } catch (e) {
      console.error('Error getting user profile:', e);
      return null;
    }
  },
  
  /**
   * 设置当前登录用户
   * @param {Object} user 用户信息对象
   * @param {string} token JWT令牌
   */
  setCurrentUser: function(user, token) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    if (token) {
      localStorage.setItem('authToken', token);
    }
  },
  
  /**
   * 清除当前用户登录状态
   */
  clearCurrentUser: function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  },
  
  /**
   * 获取购物车数据
   * @returns {Promise<Array>} 购物车商品数组
   */
  getCart: async function() {
    try {
      // 检查用户是否登录
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('User not logged in');
        return [];
      }
      
      // 调用API获取购物车数据
      const result = await this.apiRequest(`/cart?userId=${currentUser.id}`, {
        method: 'GET'
      });
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },
  
  /**
   * 保存购物车数据
   * @param {Array} cartItems 购物车项目数组
   */
  saveCart: function(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems || []));
  },
  
  /**
   * 添加商品到购物车
   * @param {string|number} productId 产品ID
   * @param {number} quantity 数量
   * @returns {Promise<boolean>} 操作是否成功
   */
  addToCart: async function(productId, quantity = 1) {
    try {
      // 检查用户是否登录
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // 调用API添加商品到购物车
      const result = await this.apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId,
          quantity: quantity
        })
      });
      
      return result.success === true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },
  
  /**
   * 从购物车移除商品
   * @param {string|number} productId 产品ID
   * @returns {Promise<boolean>} 操作是否成功
   */
  removeFromCart: async function(productId) {
    try {
      // 检查用户是否登录
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // 调用API从购物车删除商品
      const result = await this.apiRequest('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId
        })
      });
      
      return result.success === true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  },
  
  /**
   * 更新购物车中商品数量
   * @param {string|number} productId 产品ID
   * @param {number} quantity 新数量
   * @returns {Promise<boolean>} 操作是否成功
   */
  updateCartItemQuantity: async function(productId, quantity) {
    try {
      if (quantity < 1) return false;
      
      // 检查用户是否登录
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // 调用API更新购物车商品数量
      const result = await this.apiRequest('/cart/update', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId,
          quantity: quantity
        })
      });
      
      return result.success === true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  },
  
  /**
   * 清空购物车
   */
  clearCart: function() {
    localStorage.removeItem('cart');
  },
  
  /**
   * 获取购物车总金额
   * @returns {number} 总金额
   */
  getCartTotal: function() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  /**
   * 获取购物车商品总数
   * @returns {number} 商品总数
   */
  getCartItemCount: function() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
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
   * @param {string} identifier 邮箱 Email or username
   * @param {string} password 密码 Password
   * @returns {Promise<Object>} 登录结果 Login result
   */
  login: async function(identifier, password) {
    try {
      const result = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      
      if (result.success) {
        const { user, token } = result.data;
        this.setCurrentUser(user, token);
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
  },
  
  /**
   * 根据关键词搜索产品
   * Search products by keyword
   * @param {string} keyword 搜索关键词 Search keyword
   * @param {number} page 页码 Page number
   * @param {number} limit 每页数量 Items per page
   * @returns {Promise<Object>} 搜索结果 Search results
   */
  searchProducts: async function(keyword, page = 1, limit = 10) {
    try {
      console.log('DataService: searchProducts() - Calling API with keyword:', keyword);
      // 构建带有搜索参数的URL
      const queryParams = new URLSearchParams({
        search: keyword,
        page: page,
        limit: limit
      });
      
      const result = await this.apiRequest(`/products?${queryParams.toString()}`);
      console.log('DataService: searchProducts() - API response:', result);
      
      if (result.success) {
        console.log('DataService: searchProducts() - Successfully fetched search results');
        return result;
      }
      
      console.error('DataService: searchProducts() - API request failed:', result.message);
      return { success: false, message: result.message };
    } catch (e) {
      console.error('DataService: searchProducts() - Error searching products:', e);
      return { success: false, message: e.message };
    }
  }
};

// 导出模块，支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
} else if (typeof window !== 'undefined') {
  window.DataService = DataService;
} 