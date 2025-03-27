/**
 * API Service for Purely Handmade
 * 
 * 提供统一的API访问层，处理所有与服务器的通信
 * Provides a unified API access layer for handling all communication with the server
 */

const ApiService = {
  /**
   * 基础API URL
   * Base API URL
   */
  baseUrl: '/~xzy2020c/PurelyHandmade/api',
  
  /**
   * 处理API响应
   * Handle API response
   * @param {Response} response Fetch API响应
   * @returns {Promise} 处理后的响应数据
   */
  handleResponse: async function(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // 如果状态码不在2xx范围内，抛出错误
    if (!response.ok) {
      let errorData;
      
      try {
        errorData = isJson ? await response.json() : await response.text();
      } catch (error) {
        errorData = 'Failed to parse error response';
      }
      
      const error = new Error(
        isJson && errorData.error 
          ? errorData.error 
          : 'API request failed'
      );
      
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      
      // 特殊处理401未授权错误
      if (response.status === 401) {
        console.warn('Authentication error (401 Unauthorized)');
        // 在控制台中显示详细信息，便于调试
        console.log('URL:', response.url);
        console.log('Status:', response.status, response.statusText);
        console.log('Error data:', errorData);
        
        // 如果是后台管理相关的路径
        if (response.url.includes('/admin/') || 
            window.location.href.includes('/admin/')) {
          console.warn('Admin endpoint unauthorized access detected');
        }
      }
      
      throw error;
    }
    
    // 解析成功响应
    return isJson ? response.json() : response.text();
  },
  
  /**
   * 发送请求
   * Send request
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Promise} 请求结果
   */
  request: async function(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : this.baseUrl + url;
    
    // 默认选项
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    };
    
    // 添加认证令牌到请求头
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // 合并选项
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`, fetchOptions);
      const response = await fetch(fullUrl, fetchOptions);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  /**
   * GET请求
   * GET request
   * @param {string} url 请求URL
   * @param {Object} params 查询参数
   * @returns {Promise} 请求结果
   */
  get: function(url, params = {}) {
    // 构建查询字符串
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request(fullUrl, { method: 'GET' });
  },
  
  /**
   * POST请求
   * POST request
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @returns {Promise} 请求结果
   */
  post: function(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PUT请求
   * PUT request
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @returns {Promise} 请求结果
   */
  put: function(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * DELETE请求
   * DELETE request
   * @param {string} url 请求URL
   * @returns {Promise} 请求结果
   */
  delete: function(url) {
    return this.request(url, { method: 'DELETE' });
  },
  
  /**
   * 用户注册
   * User registration
   * @param {Object} userData 用户数据
   * @returns {Promise} 请求结果
   */
  register: function(userData) {
    return this.post('/register', userData);
  },
  
  /**
   * 检查用户名可用性
   * Check username availability
   * @param {string} username 用户名
   * @returns {Promise} 请求结果
   */
  checkUsername: function(username) {
    return this.post('/check_username', { username });
  },
  
  /**
   * 检查邮箱可用性
   * Check email availability
   * @param {string} email 邮箱
   * @returns {Promise} 请求结果
   */
  checkEmail: function(email) {
    return this.post('/check_email', { email });
  },
  
  /**
   * 用户登录
   * User login
   * @param {string} identifier 用户名或邮箱
   * @param {string} password 密码
   * @returns {Promise} 请求结果
   */
  login: function(identifier, password) {
    const formData = new FormData();
    formData.append('loginIdentifier', identifier);
    formData.append('loginPassword', password);
    
    return this.request('/login', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type为multipart/form-data
    });
  },
  
  /**
   * 获取用户资料
   * Get user profile
   * @returns {Promise} 请求结果
   */
  getProfile: function() {
    return this.get('/profile');
  },
  
  /**
   * 更新用户资料
   * Update user profile
   * @param {Object} profileData 资料数据
   * @returns {Promise} 请求结果
   */
  updateProfile: function(profileData) {
    return this.post('/profile/update', profileData);
  },
  
  /**
   * 获取订单历史
   * Get order history
   * @returns {Promise} 请求结果
   */
  getOrderHistory: function() {
    return this.get('/orders');
  },
  
  /**
   * 获取订单详情
   * Get order details
   * @param {number|string} orderId 订单ID
   * @returns {Promise} 请求结果
   */
  getOrderDetails: function(orderId) {
    return this.get(`/orders/${orderId}`);
  },
  
  /**
   * 提交订单
   * Submit order
   * @param {Object} orderData 订单数据
   * @returns {Promise} 请求结果
   */
  submitOrder: function(orderData) {
    return this.post('/orders', orderData);
  }
};

// 导出模块，支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
} else if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
} 