/**
 * Data Service for Purely Handmade
 * 
 * 提供统一的数据访问层，处理客户端数据的获取和管理
 * Provides a unified data access layer for handling client-side data retrieval and management
 */

const DataService = {
  /**
   * 初始化本地存储数据
   * Initialize local storage data
   */
  initData: function() {
    if (typeof window !== 'undefined' && typeof window.initializeData === 'function') {
      window.initializeData();
    }
  },
  
  /**
   * 获取所有产品
   * Get all products
   * @returns {Array} 产品列表 Product list
   */
  getAllProducts: function() {
    try {
      const products = JSON.parse(localStorage.getItem('products')) || [];
      return products;
    } catch (e) {
      console.error('Error getting products:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取产品
   * Get product by ID
   * @param {number|string} id 产品ID Product ID
   * @returns {Object|null} 产品对象或null Product object or null
   */
  getProductById: function(id) {
    try {
      const products = this.getAllProducts();
      return products.find(p => p.id == id) || null;
    } catch (e) {
      console.error('Error getting product by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取所有类别
   * Get all categories
   * @returns {Array} 类别列表 Category list
   */
  getAllCategories: function() {
    try {
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      return categories;
    } catch (e) {
      console.error('Error getting categories:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取类别
   * Get category by ID
   * @param {number|string} id 类别ID Category ID
   * @returns {Object|null} 类别对象或null Category object or null
   */
  getCategoryById: function(id) {
    try {
      const categories = this.getAllCategories();
      return categories.find(c => c.id == id) || null;
    } catch (e) {
      console.error('Error getting category by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取所有设计师
   * Get all designers
   * @returns {Array} 设计师列表 Designer list
   */
  getAllDesigners: function() {
    try {
      const designers = JSON.parse(localStorage.getItem('designers')) || [];
      return designers;
    } catch (e) {
      console.error('Error getting designers:', e);
      return [];
    }
  },
  
  /**
   * 按ID获取设计师
   * Get designer by ID
   * @param {number|string} id 设计师ID Designer ID
   * @returns {Object|null} 设计师对象或null Designer object or null
   */
  getDesignerById: function(id) {
    try {
      const designers = this.getAllDesigners();
      return designers.find(d => d.id == id) || null;
    } catch (e) {
      console.error('Error getting designer by ID:', e);
      return null;
    }
  },
  
  /**
   * 获取新到货产品
   * Get new arrival products
   * @param {number} days 天数 Number of days
   * @returns {Array} 新产品列表 New products list
   */
  getNewArrivals: function(days = 7) {
    try {
      const products = this.getAllProducts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return products.filter(product => {
        const listingDate = new Date(product.listingDate);
        return listingDate >= cutoffDate;
      });
    } catch (e) {
      console.error('Error getting new arrivals:', e);
      return [];
    }
  },
  
  /**
   * 获取促销产品
   * Get on sale products
   * @returns {Array} 促销产品列表 On sale products list
   */
  getOnSaleProducts: function() {
    try {
      const products = this.getAllProducts();
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
   * @returns {Array} 产品列表 Product list
   */
  getProductsByCategory: function(categoryId) {
    try {
      const products = this.getAllProducts();
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
   * @param {Object} product 产品对象 Product object
   * @param {number} quantity 数量 Quantity
   * @returns {boolean} 成功状态 Success status
   */
  addToCart: function(product, quantity = 1) {
    try {
      const cart = this.getCart();
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.onSale ? product.salePrice : product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
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
      return true;
    } catch (e) {
      console.error('Error during logout:', e);
      return false;
    }
  }
};

// 确保数据初始化
// Ensure data is initialized
document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('products')) {
    DataService.initData();
  }
});

// 导出模块，支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
} else if (typeof window !== 'undefined') {
  window.DataService = DataService;
} 