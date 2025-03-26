/**
 * Data Service for Purely Handmade
 * 
 * Provides a unified data access layer for handling client-side data retrieval and management
 */

// API base URL
const API_BASE_URL = CONFIG.getApiPath('');

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
      const result = await response.json();
      console.log(`DataService: apiRequest() - Response data:`, result);
      
      return result;
    } catch (error) {
      console.error(`DataService: apiRequest() - Request failed (${endpoint}):`, error);
      return { success: false, message: 'Internal Server Error' };
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
   * Get featured designers
   * @returns {Promise<Array>} Featured designer list
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
   * Get featured products
   * @returns {Promise<Array>} Featured products list
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
   * Get on sale products
   * @returns {Promise<Array>} On sale products list
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
   * Get products by category
   * @param {number|string} categoryId Category ID
   * @returns {Promise<Array>} Product list
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
   * Get current user information
   * @returns {Object|null} Current user information or null
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
   * Get current user profile from API
   * @returns {Promise<Object|null>} User object or null
   */
  getUserProfile: async function() {
    try {
      const result = await this.apiRequest('/auth/profile', {
        method: 'GET'
      });
      
      if (result.success) {
        // Update local storage user information
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
   * Set current user
   * @param {Object} user User information object
   * @param {string} token JWT token
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
   * Clear current user login status
   */
  clearCurrentUser: function() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  },
  
  /**
   * Get cart data
   * @returns {Promise<Array>} Cart items array
   */
  getCart: async function() {
    try {
      // Check if user is logged in
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('User not logged in');
        return [];
      }
      
      // Call API to get cart data
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
   * Save cart data
   * @param {Array} cartItems Cart items array
   */
  saveCart: function(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems || []));
  },
  
  /**
   * Add product to cart
   * @param {string|number} productId Product ID
   * @param {number} quantity Quantity
   * @returns {Promise<boolean>} Operation success
   */
  addToCart: async function(productId, quantity = 1) {
    try {
      // Check if user is logged in
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // Call API to add product to cart
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
   * Remove product from cart
   * @param {string|number} productId Product ID
   * @returns {Promise<boolean>} Operation success
   */
  removeFromCart: async function(productId) {
    try {
      // Check if user is logged in
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // Call API to remove product from cart
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
   * Update the quantity of an item in the cart
   * @param {string|number} productId Product ID
   * @param {number} quantity New quantity
   * @returns {Promise<boolean>} Operation success
   */
  updateCartItemQuantity: async function(productId, quantity) {
    try {
      if (quantity < 1) return false;
      
      // Check if user is logged in
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return false;
      }
      
      // Call API to update cart item quantity
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
   * Clear cart
   */
  clearCart: function() {
    localStorage.removeItem('cart');
  },
  
  /**
   * Get cart total
   * @returns {number} Total amount
   */
  getCartTotal: function() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  /**
   * Get cart item count
   * @returns {number} Total items
   */
  getCartItemCount: function() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
  
  /**
   * User registration
   * @param {Object} userData User data
   * @returns {Promise<Object>} Registration result
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
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (e) {
      console.error('Error during registration:', e);
      return { success: false, message: 'Registration failed' };
    }
  },
  
  /**
   * User login
   * @param {string} identifier Email or username
   * @param {string} password Password
   * @returns {Promise<Object>} Login result
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
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (e) {
      console.error('Error during login:', e);
      return { success: false, message: 'Login failed' };
    }
  },
  
  /**
   * Get current user's orders
   * @returns {Promise<Array>} Order list
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
   * Get order details
   * @param {number} orderId Order ID
   * @returns {Promise<Object|null>} Order details
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
   * Create order
   * @param {Object} orderData Order data
   * @returns {Promise<Object>} Creation result
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
      return { success: false, message: result.message || 'Order creation failed' };
    } catch (e) {
      console.error('Error creating order:', e);
      return { success: false, message: 'Order creation failed' };
    }
  },
  
  /**
   * Submit product review
   * @param {string} productId Product ID
   * @param {Object} reviewData Review data
   * @returns {Promise<Object>} Submission result
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
      return { success: false, message: result.message || 'Review submission failed' };
    } catch (e) {
      console.error('Error submitting review:', e);
      return { success: false, message: 'Review submission failed' };
    }
  },
  
  /**
   * Get product reviews
   * @param {string} productId Product ID
   * @returns {Promise<Array>} Review list
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
   * Search products by keyword
   * @param {string} keyword Search keyword
   * @param {number} page Page number
   * @param {number} limit Items per page
   * @returns {Promise<Object>} Search results
   */
  searchProducts: async function(keyword, page = 1, limit = 10) {
    try {
      console.log('DataService: searchProducts() - Calling API with keyword:', keyword);
      // Build URL with search parameters
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

// Ensure DataService is registered in the global scope
if (typeof window !== 'undefined') {
  window.DataService = DataService;
  console.log('DataService registered to global scope');
}

// Export DataService (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
} 