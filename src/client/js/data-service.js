/**
 * Data Service for Purely Handmade
 * 
 * Provides a unified data access layer for handling client-side data retrieval and management
 */


// 检查CONFIG对象是否已加载
if (typeof CONFIG !== 'undefined' && CONFIG.getApiPath) {
  try {
    API_BASE_URL = CONFIG.getApiPath('');
    console.log('Data Service: Using CONFIG API path:', API_BASE_URL);
  } catch (e) {
    console.warn('Data Service: Error using CONFIG.getApiPath, falling back to default path', e);
  }
}

// 检查DataService是否已存在，如果不存在才定义
if (typeof window.DataService === 'undefined') {
  console.log('Initializing DataService...');
  
  // Define DataService object
  const DataService = {
    /**
     * Get authorization token
     * @returns {string|null} Authorization token
     */
    getAuthToken: function() {
      return localStorage.getItem('authToken');
    },
    
    /**
     * Set authorization token
     * @param {string} token Authorization token
     */
    setAuthToken: function(token) {
      localStorage.setItem('authToken', token);
    },
    
    /**
     * Get current logged in user
     * @returns {Object|null} Current user object or null if not logged in
     */
    getCurrentUser: function() {
      try {
        const userDataStr = localStorage.getItem('currentUser');
        if (!userDataStr) return null;
        
        const userData = JSON.parse(userDataStr);
        if (!userData) return null;
        
        return userData;
      } catch (error) {
        console.error('DataService: getCurrentUser() - Error getting current user:', error);
        return null;
      }
    },
    
    /**
     * Set current user data in local storage
     * @param {Object} userData User data object
     */
    setCurrentUser: function(userData) {
      if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        localStorage.removeItem('currentUser');
      }
    },
    
    /**
     * Log user out
     */
    logout: function() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      console.log('DataService: logout() - User logged out');
    },
    
    /**
     * User login
     * @param {string} identifier Username or email
     * @param {string} password User password
     * @returns {Promise<Object>} Login result with user data if successful
     */
    login: async function(identifier, password) {
      try {
        console.log('DataService: login() - Attempting login for:', identifier);
        
        const result = await this.apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password })
        });
        
        console.log('DataService: login() - API response:', result);
        
        // Check for success and parse response data based on API structure
        if (result && result.success === true) {
          // 从data字段或直接从result中获取token和user信息
          const token = result.data?.token || result.token;
          const user = result.data?.user || result.user;
          
          // 如果有token，表示登录成功
          if (token) {
            // 保存身份验证令牌
            this.setAuthToken(token);
            
            // 保存用户数据
            if (user) {
              this.setCurrentUser(user);
              console.log('DataService: login() - User logged in successfully:', user.username || user.email);
            } else {
              console.warn('DataService: login() - No user data received with token');
              // 获取用户数据
              await this.fetchUserProfile();
            }
            
            return {
              success: true,
              message: 'Login successful',
              user: user || this.getCurrentUser(),
              token: token
            };
          }
        }
        
        // 登录失败，可能是凭据错误或服务器问题
        const errorMessage = result?.message || 'Unknown error';
        console.error('DataService: login() - Login failed:', errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      } catch (error) {
        console.error('DataService: login() - Error during login:', error);
        return {
          success: false,
          message: error.message || 'An error occurred during login'
        };
      }
    },
    
    /**
     * Fetch current user profile data
     * @returns {Promise<Object>} User profile data
     */
    fetchUserProfile: async function() {
      try {
        if (!this.getAuthToken()) {
          console.warn('DataService: fetchUserProfile() - No auth token available');
          return null;
        }
        
        const result = await this.apiRequest('/user/profile');
        
        if (result.success && result.data) {
          // 保存用户资料
          this.setCurrentUser(result.data);
          return result.data;
        }
        
        console.error('DataService: fetchUserProfile() - Failed to fetch profile:', result.message);
        return null;
      } catch (error) {
        console.error('DataService: fetchUserProfile() - Error fetching profile:', error);
        return null;
      }
    },
    
    /**
     * 获取用户资料 - 为兼容admin-auth.js添加
     * Get user profile for compatibility with admin-auth.js
     * @returns {Promise<Object>} User profile data
     */
    getUserProfile: async function() {
      console.log('DataService: getUserProfile() - Called, using fetchUserProfile()');
      return this.fetchUserProfile();
    },
    
    /**
     * Create a request header with authorization
     * @returns {Object} Request header object
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
     * API request base method
     * @param {string} endpoint API endpoint path
     * @param {Object} options Request options
     * @returns {Promise<Object>} Response data
     */
    async apiRequest(endpoint, options = {}) {
      try {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Default options
        const defaultOptions = {
          headers: this.getAuthHeaders()
        };
        
        // Merge options
        const fetchOptions = {...defaultOptions, ...options};
        
        // Execute request
        console.log(`DataService: apiRequest() - Making request to ${url}`);
        const response = await fetch(url, fetchOptions);
        console.log(`DataService: apiRequest() - Response status: ${response.status}`);
        
        // 处理非JSON响应情况
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`DataService: apiRequest() - Non-JSON response received (${contentType})`);
          
          // 尝试先读取响应内容
          const text = await response.text();
          const firstChars = text.substring(0, 20).trim();
          
          // 尝试判断是否可能是JSON
          if (firstChars.startsWith('{') || firstChars.startsWith('[')) {
            try {
              const result = JSON.parse(text);
              return result;
            } catch (e) {
              console.error('DataService: apiRequest() - Failed to parse response as JSON:', e);
            }
          }
          
          // 服务器返回了非JSON结果，可能是HTML或其他内容
          return { 
            success: false, 
            message: `Server returned non-JSON response: ${response.status} - ${response.statusText}`,
            mock: true // 标记这是模拟响应
          };
        }
        
        // 正常的JSON响应处理
        const result = await response.json();
        console.log(`DataService: apiRequest() - Response data:`, result);
        
        return result;
      } catch (error) {
        console.error(`DataService: apiRequest() - Request failed (${endpoint}):`, error);
        return { 
          success: false, 
          message: error.message || 'Internal Server Error',
          mock: true // 标记这是模拟响应 
        };
      }
    },
    
    /**
     * Get all products
     * @returns {Promise<Array>} Product list
     */
    getAllProducts: async function() {
      try {
        console.log('DataService: getAllProducts() - Calling API...');
        const result = await this.apiRequest('/products');
        console.log('DataService: getAllProducts() - API response:', result);
        
        if (result.success) {
          console.log('DataService: getAllProducts() - Successfully fetched products');
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
     * Get product by ID
     * @param {number|string} id Product ID
     * @returns {Promise<Object|null>} Product object or null
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
     * Get all categories
     * @returns {Promise<Array>} Category list
     */
    getAllCategories: async function() {
      try {
        console.log('DataService: getAllCategories() - Calling API...');
        const result = await this.apiRequest('/categories');
        console.log('DataService: getAllCategories() - API response:', result);
        
        if (result.success) {
          console.log('DataService: getAllCategories() - Successfully fetched categories');
          
          // Ensure correct response format
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
     * Get category by ID
     * @param {number|string} id Category ID
     * @returns {Promise<Object|null>} Category object or null
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
     * Get all designers
     * @returns {Promise<Array>} Designer list
     */
    getAllDesigners: async function() {
      try {
        console.log("DataService: getAllDesigners() - Making request...");
        const result = await this.apiRequest('/designers');
    
        if (result.success) {
          console.log("DataService: getAllDesigners() - Successfully fetched designers");
          return result;
        } else {
          console.error("DataService: getAllDesigners() - API request failed: ", result.message);
          return { success: false, message: result.message };
        }
      } catch (error) {
        console.error("DataService: getAllDesigners() - Error in API request: ", error);
        return { success: false, message: error.message };
      }
    },
    
    /**
     * Get featured designers
     * @returns {Promise<Array>} Featured designer list
     */
    getFeaturedDesigners: async function() {
      try {
        console.log('DataService: getFeaturedDesigners() - Calling API...');
        const result = await this.apiRequest('/designers/featured');
        
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
     * Get designer by ID
     * @param {number|string} id Designer ID
     * @returns {Promise<Object|null>} Designer object or null
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
     * Get new arrival products
     * @param {number} days Number of days
     * @returns {Promise<Array>} New products list
     */
    getNewArrivals: async function(days = 30) {
      try {
        console.log('DataService: getNewArrivals() - Calling API...');
        const result = await this.apiRequest(`/products/new-arrivals?days=${days}`);
        
        if (result.success) {
          console.log('DataService: getNewArrivals() - Successfully fetched new arrivals');
          return result;
        }
        console.error('DataService: getNewArrivals() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: getNewArrivals() - Error getting new arrivals:', e);
        return { success: false, message: e.message };
      }
    },
    
    /**
     * Get on sale products
     * @returns {Promise<Array>} On sale products list
     */
    getOnSaleProducts: async function() {
      try {
        console.log('DataService: getOnSaleProducts() - Calling API...');
        const result = await this.apiRequest('/products/on-sale');
        
        if (result.success) {
          console.log('DataService: getOnSaleProducts() - Successfully fetched on sale products');
          return result;
        }
        console.error('DataService: getOnSaleProducts() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: getOnSaleProducts() - Error getting on sale products:', e);
        return { success: false, message: e.message };
      }
    },
    
    /**
     * Get featured products
     * @returns {Promise<Array>} Featured products list
     */
    getFeaturedProducts: async function() {
      try {
        console.log('DataService: getFeaturedProducts() - Calling API...');
        const result = await this.apiRequest('/products/featured');
        
        if (result.success) {
          console.log('DataService: getFeaturedProducts() - Successfully fetched featured products');
          return result;
        }
        console.error('DataService: getFeaturedProducts() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: getFeaturedProducts() - Error getting featured products:', e);
        return { success: false, message: e.message };
      }
    },
    
    /**
     * Add product to cart
     * @param {number|string} productId Product ID
     * @param {number} quantity Quantity
     * @returns {Promise<Object>} Result
     */
    addToCart: async function(productId, quantity = 1) {
      try {
        console.log(`DataService: addToCart() - Adding product ${productId} to cart`);
        const payload = { product_id: productId, quantity };
        const result = await this.apiRequest('/cart/add', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        if (result.success) {
          console.log('DataService: addToCart() - Successfully added to cart');
          return result;
        }
        console.error('DataService: addToCart() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: addToCart() - Error adding to cart:', e);
        return { success: false, message: e.message };
      }
    },
    
    /**
     * Get cart contents
     * @returns {Promise<Array>} Cart items array
     */
    getCart: async function() {
      try {
        console.log('DataService: getCart() - Calling API...');
        
        // 检查用户是否登录
        if (!this.getAuthToken()) {
          console.warn('DataService: getCart() - User not logged in, returning empty cart');
          return [];
        }
        
        const result = await this.apiRequest('/cart');
        
        if (result.success) {
          console.log('DataService: getCart() - Successfully fetched cart');
          
          // 确保返回的是数组格式
          let cartItems = [];
          
          if (result.data && Array.isArray(result.data.items)) {
            cartItems = result.data.items;
          } else if (result.data && result.data.cart && Array.isArray(result.data.cart.items)) {
            cartItems = result.data.cart.items;
          } else if (Array.isArray(result.data)) {
            cartItems = result.data;
          } else if (Array.isArray(result.items)) {
            cartItems = result.items;
          } else if (Array.isArray(result.cart)) {
            cartItems = result.cart;
          }
          
          console.log('DataService: getCart() - Formatted cart items:', cartItems);
          return cartItems;
        }
        
        console.error('DataService: getCart() - API request failed:', result.message);
        return [];
      } catch (e) {
        console.error('DataService: getCart() - Error getting cart:', e);
        return [];
      }
    },
    
    /**
     * Remove item from cart
     * @param {number|string} itemId Cart item ID
     * @returns {Promise<Object>} Result
     */
    removeFromCart: async function(itemId) {
      try {
        console.log(`DataService: removeFromCart() - Removing item ${itemId} from cart`);
        const result = await this.apiRequest(`/cart/remove?item_id=${itemId}`, {
          method: 'DELETE'
        });
        
        if (result.success) {
          console.log('DataService: removeFromCart() - Successfully removed from cart');
          return result;
        }
        console.error('DataService: removeFromCart() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: removeFromCart() - Error removing from cart:', e);
        return { success: false, message: e.message };
      }
    },
    
    /**
     * Update cart item quantity
     * @param {number|string} itemId Cart item ID
     * @param {number} quantity New quantity
     * @returns {Promise<Object>} Result
     */
    updateCartItemQuantity: async function(itemId, quantity) {
      try {
        console.log(`DataService: updateCartItemQuantity() - Updating item ${itemId} quantity to ${quantity}`);
        const payload = { item_id: itemId, quantity };
        const result = await this.apiRequest('/cart/update', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        
        if (result.success) {
          console.log('DataService: updateCartItemQuantity() - Successfully updated cart item quantity');
          return result;
        }
        console.error('DataService: updateCartItemQuantity() - API request failed:', result.message);
        return { success: false, message: result.message };
      } catch (e) {
        console.error('DataService: updateCartItemQuantity() - Error updating cart item quantity:', e);
        return { success: false, message: e.message };
      }
    }
  };

  // 将DataService暴露为全局变量
  window.DataService = DataService;
  console.log('DataService initialized');
} else {
  console.log('DataService already defined, skipping initialization');
} 