/**
 * Admin API Service for Purely Handmade
 * 
 * 提供管理员API访问层，处理与服务器的管理功能通信
 * Provides admin API access layer for handling admin functions with the server
 */

// For Node.js environment (for testing purposes)
if (typeof require !== 'undefined' && typeof ApiService === 'undefined') {
  ApiService = require('./api-service.js');
}

const AdminApiService = {
  /**
   * 获取所有用户
   * @returns {Promise} 请求结果
   */
  getAllUsers: function() {
    return ApiService.get('/users?all=1');
  },
  
  /**
   * 获取用户详情
   * @param {number} userId 用户ID
   * @returns {Promise} 请求结果
   */
  getUserById: function(userId) {
    return ApiService.get(`/admin/users/detail?id=${userId}`);
  },
  
  /**
   * 删除用户
   * @param {number} userId 用户ID
   * @returns {Promise} 请求结果
   */
  deleteUser: function(userId) {
    return ApiService.delete(`/admin/users?id=${userId}`);
  },
  
  /**
   * 禁用/启用用户
   * @param {number} userId 用户ID
   * @param {boolean} isEnabled 是否启用
   * @returns {Promise} 请求结果
   */
  toggleUserStatus: function(userId, isEnabled) {
    return ApiService.put(`/users/${userId}/status`, {
      isEnabled: isEnabled
    });
  },
  
  /**
   * 获取所有产品
   * @returns {Promise} 请求结果
   */
  getAllProducts: function() {
    return ApiService.get('/products');
  },
  
  /**
   * 添加新产品
   * @param {Object} productData 产品数据
   * @returns {Promise} 请求结果
   */
  addProduct: function(productData) {
    return ApiService.post('/products', productData);
  },
  
  /**
   * 更新产品
   * @param {string} productId 产品ID
   * @param {Object} productData 产品数据
   * @returns {Promise} 请求结果
   */
  updateProduct: function(productId, productData) {
    return ApiService.put(`/products/${productId}`, productData);
  },
  
  /**
   * 删除产品
   * @param {string} productId 产品ID
   * @returns {Promise} 请求结果
   */
  deleteProduct: function(productId) {
    return ApiService.delete(`/products/${productId}`);
  },
  
  /**
   * 获取所有类别
   * @returns {Promise} 请求结果
   */
  getAllCategories: function() {
    return ApiService.get('/categories');
  },
  
  /**
   * 添加新类别
   * @param {Object} categoryData 类别数据
   * @returns {Promise} 请求结果
   */
  addCategory: function(categoryData) {
    return ApiService.post('/categories', categoryData);
  },
  
  /**
   * 更新类别
   * @param {number} categoryId 类别ID
   * @param {Object} categoryData 类别数据
   * @returns {Promise} 请求结果
   */
  updateCategory: function(categoryId, categoryData) {
    return ApiService.put(`/categories/${categoryId}`, categoryData);
  },
  
  /**
   * 删除类别
   * @param {number} categoryId 类别ID
   * @returns {Promise} 请求结果
   */
  deleteCategory: function(categoryId) {
    return ApiService.delete(`/categories/${categoryId}`);
  },
  
  /**
   * 获取所有设计师
   * @returns {Promise} 请求结果
   */
  getAllDesigners: function() {
    return ApiService.get('/designers');
  },
  
  /**
   * 添加新设计师
   * @param {Object} designerData 设计师数据
   * @returns {Promise} 请求结果
   */
  addDesigner: function(designerData) {
    return ApiService.post('/designers', designerData);
  },
  
  /**
   * 更新设计师
   * @param {string} designerId 设计师ID
   * @param {Object} designerData 设计师数据
   * @returns {Promise} 请求结果
   */
  updateDesigner: function(designerId, designerData) {
    return ApiService.put(`/designers/${designerId}`, designerData);
  },
  
  /**
   * 删除设计师
   * @param {string} designerId 设计师ID
   * @returns {Promise} 请求结果
   */
  deleteDesigner: function(designerId) {
    return ApiService.delete(`/designers/${designerId}`);
  },
  
  /**
   * 获取所有订单
   * @returns {Promise} 请求结果
   */
  getAllOrders: function() {
    return ApiService.get('/orders?all=1');
  },
  
  /**
   * 更新订单状态
   * @param {number} orderId 订单ID
   * @param {string} status 状态
   * @returns {Promise} 请求结果
   */
  updateOrderStatus: function(orderId, status) {
    return ApiService.put(`/orders/${orderId}/status`, {
      status: status
    });
  },
  
  /**
   * 获取所有评论
   * @returns {Promise} 请求结果
   */
  getAllReviews: function() {
    // 假设有一个获取所有评论的API
    return ApiService.get('/reviews');
  },
  
  /**
   * 删除评论
   * @param {number} reviewId 评论ID
   * @returns {Promise} 请求结果
   */
  deleteReview: function(reviewId) {
    return ApiService.delete(`/reviews/${reviewId}`);
  },
  
  /**
   * 获取网站统计数据
   * @returns {Promise} 请求结果
   */
  getSiteStatistics: function() {
    return ApiService.get('/admin/statistics');
  }
};

// 导出模块，支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminApiService;
} else if (typeof window !== 'undefined') {
  window.AdminApiService = AdminApiService;
} 