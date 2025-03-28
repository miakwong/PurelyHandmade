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
    console.log('DataService: Setting authorization token');
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

  // Other methods remain unchanged...

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