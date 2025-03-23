/**
 * API Data Loader for Purely Handmade
 * 
 * This script provides API-based data loading functions that replace 
 * the localStorage-based functions in the original codebase.
 */

// Log when this script is loaded
console.log('api-data-loader.js loaded at', new Date().toISOString());

// Universal fix to handle port issues - change API base URL if needed
if (typeof DataService !== 'undefined' && DataService.apiBaseUrl) {
  // If we're on port 8001, update the API base URL
  if (window.location.port === '8001') {
    DataService.apiBaseUrl = '/api';
    console.log('Updated API base URL for port 8001:', DataService.apiBaseUrl);
  }
}

// Universal container ID helper function
window.getContainerSafely = function(containerId) {
  // If container ID is undefined, log an error and return null
  if (!containerId) {
    console.error(`getContainerSafely: Container ID is undefined`);
    return null;
  }
  
  // Get container by ID
  const container = document.getElementById(containerId);
  if (container) {
    return container;
  }
  
  // Try alternative approaches if container not found
  console.error(`getContainerSafely: Container with ID "${containerId}" not found, trying alternatives`);
  
  // Check if containerId is actually a DOM element
  if (containerId instanceof HTMLElement) {
    console.log('getContainerSafely: Container ID is actually a DOM element, using it directly');
    return containerId;
  }
  
  // Last resort - search by class instead of ID
  const containersByClass = document.getElementsByClassName(containerId);
  if (containersByClass.length > 0) {
    console.log(`getContainerSafely: Found container by class "${containerId}"`);
    return containersByClass[0];
  }
  
  return null;
};

// Define API functions globally so they're available immediately
 
/**
 * Load products for homepage or other product listing pages
 * @param {string} containerId - ID of the container element to populate
 * @param {Object} options - Options for filtering products
 * @param {number} options.limit - Maximum number of products to display
 * @param {boolean} options.featured - Whether to show only featured products
 * @param {string} options.category - Category ID to filter by
 * @param {boolean} options.newArrivals - Whether to show only new arrivals
 * @param {boolean} options.onSale - Whether to show only products on sale
 */
window.loadProducts = async function(containerId, options = {}) {
  console.log(`API loadProducts() - Starting with parameters:`, { containerId, options });
  
  // 自动修复：如果containerId为undefined，尝试使用默认值
  if (!containerId) {
    console.warn('API loadProducts() - containerId参数未定义，使用默认容器ID："products-container"');
    containerId = 'products-container'; // 使用默认的容器ID
  }
  
  if (!DataService) {
    console.error('API loadProducts() - DataService is not defined');
    return;
  }
  
  // Get the container element using the safe helper
  const container = window.getContainerSafely(containerId);
  if (!container) {
    console.error(`API loadProducts() - Unable to find container using ID or alternatives: "${containerId}"`);
    return;
  }
  
  try {
    // Show loading state
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading products...</span>
        </div>
        <p class="mt-2">Loading products...</p>
      </div>
    `;
    
    console.log(`API loadProducts() - Fetching products from API...`);
    // Fetch products from API
    const products = await DataService.getAllProducts();
    console.log(`API loadProducts() - API response:`, products);
    
    // Apply filters if specified in options
    let filteredProducts = products.products || [];
    // Check if response is wrapped in data property
    if (products.data && products.data.products) {
      filteredProducts = products.data.products;
      console.log(`API loadProducts() - Products from data.products:`, filteredProducts.length);
    }
    console.log(`API loadProducts() - Total products before filtering:`, filteredProducts.length);
    
    if (options.featured) {
      console.log(`API loadProducts() - Filtering for featured products`);
      filteredProducts = filteredProducts.filter(product => product.featured);
      console.log(`API loadProducts() - Featured products count:`, filteredProducts.length);
    }
    
    if (options.newArrivals) {
      console.log(`API loadProducts() - Filtering for new arrivals`);
      // Get products created in the last 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      filteredProducts = filteredProducts.filter(product => {
        const createdAt = new Date(product.createdAt);
        const isNewArrival = createdAt >= cutoffDate;
        console.log(`API loadProducts() - Product ${product.id} created at ${product.createdAt}, is new: ${isNewArrival}`);
        return isNewArrival;
      });
      console.log(`API loadProducts() - New arrivals count:`, filteredProducts.length);
    }
    
    if (options.limit && filteredProducts.length > options.limit) {
      console.log(`API loadProducts() - Limiting to ${options.limit} products`);
      filteredProducts = filteredProducts.slice(0, options.limit);
    }
    
    if (filteredProducts.length === 0) {
      console.log(`API loadProducts() - No products available after filtering`);
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted">No products available at the moment</p>
        </div>
      `;
      return;
    }
    
    // Render products
    console.log(`API loadProducts() - Rendering ${filteredProducts.length} products`);
    container.innerHTML = '';
    
    filteredProducts.forEach(product => {
      console.log(`API loadProducts() - Rendering product:`, product.id, product.name);
      // Generate stars based on rating if available
      const rating = product.rating || 0;
      const starsHtml = `<div class="product-rating">
        ${Array(5).fill().map((_, i) => 
          `<i class="bi ${i < rating ? 'bi-star-fill' : 'bi-star'}"></i>`
        ).join('')}
      </div>`;
      
      // Price display
      let priceHtml = '';
      if (product.onSale && product.salePrice) {
        priceHtml = `
          <div class="product-price-wrapper">
            <span class="product-price">$${product.salePrice.toFixed(2)}</span>
            <span class="product-price-discount">$${product.price.toFixed(2)}</span>
          </div>
        `;
      } else {
        priceHtml = `<div class="product-price-wrapper"><span class="product-price">$${product.price.toFixed(2)}</span></div>`;
      }
      
      // Product image
      const imgSrc = product.image || (product.gallery ? JSON.parse(product.gallery)[0] : null) || '/src/client/assets/placeholder.jpg';
      
      // Create product card
      const productHtml = `
        <div class="col-lg-3 col-md-6 col-sm-6 mb-4">
          <div class="product-card">
            <div class="product-img-wrapper">
              <a href="/src/client/views/product/product_detail.html?id=${product.id}">
                <img src="${imgSrc}" class="product-img" alt="${product.name || 'Product'}">
                ${product.onSale ? '<div class="product-badge">Sale</div>' : ''}
              </a>
            </div>
            <div class="product-card-body">
              <a href="/src/client/views/product/product_detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <h2 class="product-title">${product.name}</h2>
              </a>
              ${priceHtml}
              ${starsHtml}
              <p class="product-desc">${product.description ? product.description.substring(0, 80) + '...' : 'No description available'}</p>
              <button class="add-to-cart-btn" data-product-id="${product.id}" onclick="addToCart('${product.id}', 1); return false;">
                <i class="bi bi-cart-plus me-2"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      
      container.innerHTML += productHtml;
    });
    
    console.log(`API loadProducts() - Finished rendering products for ${containerId}`);
  } catch (error) {
    console.error('API loadProducts() - Error loading products:', error);
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <p class="text-danger">Error loading products</p>
      </div>
    `;
  }
};

/**
 * Load categories for the homepage or category browsing pages
 * @param {string} containerId - ID of the container element to populate
 * @param {Object} options - Options for filtering categories
 * @param {number} options.limit - Maximum number of categories to display
 * @param {boolean} options.featured - Whether to show only featured categories
 */
window.loadCategories = async function(containerId, options = {}) {
  console.log(`API loadCategories() - 开始加载，参数:`, { containerId, options });
  
  // 自动修复：如果containerId为undefined，尝试使用默认值
  if (!containerId) {
    console.warn('API loadCategories() - containerId参数未定义，使用默认容器ID："category-cards-container"');
    containerId = 'category-cards-container'; // 使用默认的容器ID
  }
  
  // 检查DataService可用性
  if (typeof DataService === 'undefined') {
    console.error('API loadCategories() - DataService未定义');
    showErrorInContainer(containerId, 'DataService未定义，无法加载数据');
    return;
  }
  
  const container = window.getContainerSafely(containerId);
  if (!container) {
    console.error(`API loadCategories() - 找不到容器: "${containerId}"`);
    return;
  }
  
  try {
    // 显示加载状态
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading categories...</span>
        </div>
        <p class="mt-2">加载分类中...</p>
      </div>
    `;
    
    // 获取分类数据
    console.log(`API loadCategories() - 从API获取分类数据...`);
    let categoryResponse;
    
    try {
      categoryResponse = await DataService.getAllCategories();
      console.log(`API loadCategories() - API响应:`, categoryResponse);
    } catch (apiError) {
      console.error(`API loadCategories() - API调用错误:`, apiError);
      showErrorInContainer(containerId, `加载分类失败: ${apiError.message || '未知错误'}`);
      return;
    }
    
    // 验证并处理API响应
    let categories = [];
    
    if (!categoryResponse || !categoryResponse.success) {
      const errorMessage = categoryResponse?.message || '未知错误';
      console.error(`API loadCategories() - API请求失败: ${errorMessage}`);
      showErrorInContainer(containerId, `加载分类失败: ${errorMessage}`);
      return;
    }
    
    // 提取分类数据
    if (categoryResponse.data && Array.isArray(categoryResponse.data.categories)) {
      categories = categoryResponse.data.categories;
    } else if (categoryResponse.data && typeof categoryResponse.data === 'object') {
      categories = Object.values(categoryResponse.data);
    } else if (Array.isArray(categoryResponse.categories)) {
      categories = categoryResponse.categories;
    } else {
      console.warn(`API loadCategories() - API响应格式异常，无法提取分类数据`);
      categories = [];
    }
    
    console.log(`API loadCategories() - 筛选前的分类数量:`, categories.length);
    
    // 应用筛选
    let filteredCategories = [...categories];
    
    // 特色分类筛选
    if (options.featured) {
      console.log(`API loadCategories() - 筛选特色分类`);
      filteredCategories = filteredCategories.filter(category => category.featured);
      console.log(`API loadCategories() - 特色分类数量:`, filteredCategories.length);
    }
    
    // 数量限制
    if (options.limit && filteredCategories.length > options.limit) {
      console.log(`API loadCategories() - 限制显示数量: ${options.limit}`);
      filteredCategories = filteredCategories.slice(0, options.limit);
    }
    
    // 检查结果是否为空
    if (filteredCategories.length === 0) {
      console.log(`API loadCategories() - 筛选后无分类数据`);
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted">当前没有可用分类</p>
        </div>
      `;
      return;
    }
    
    // 渲染分类
    console.log(`API loadCategories() - 渲染${filteredCategories.length}个分类`);
    container.innerHTML = '';
    
    filteredCategories.forEach(category => {
      console.log(`API loadCategories() - 渲染分类:`, category.id, category.name);
      
      // 处理图像
      const imgSrc = category.image || '/src/client/assets/category-placeholder.jpg';
      
      // 创建分类卡片
      const categoryHtml = `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="category-card">
            <a href="/src/client/views/product/product-list.html?id=${category.id}" class="category-link">
              <div class="category-img-wrapper">
                <img src="${imgSrc}" class="category-img" alt="${category.name}">
                <div class="category-overlay">
                  <h3 class="category-title">${category.name}</h3>
                  <p class="category-desc">${category.description || ''}</p>
                  <span class="btn-browse">浏览产品</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      `;
      
      container.innerHTML += categoryHtml;
    });
    
    console.log(`API loadCategories() - 分类渲染完成`);
  } catch (error) {
    console.error('API loadCategories() - 错误:', error);
    showErrorInContainer(containerId, `加载分类时发生错误: ${error.message || '未知错误'}`);
  }
};

// 辅助函数：在容器中显示错误
function showErrorInContainer(containerId, errorMessage) {
  const container = window.getContainerSafely(containerId);
  if (container) {
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>${errorMessage}
        </div>
      </div>
    `;
  }
}

/**
 * Load designers/artisans for homepage or designer browsing pages
 * @param {string} containerId - ID of the container element to populate
 * @param {Object} options - Options for filtering designers
 * @param {number} options.limit - Maximum number of designers to display
 * @param {boolean} options.featured - Whether to show only featured designers
 */
window.loadDesigners = async function(containerId, options = {}) {
  console.log(`API loadDesigners() - Starting with parameters:`, { containerId, options });
  
  // 自动修复：如果containerId为undefined，尝试使用默认值
  if (!containerId) {
    console.warn('API loadDesigners() - containerId参数未定义，使用默认容器ID："designers-container"');
    containerId = 'designers-container'; // 使用默认的容器ID
  }
  
  if (!DataService) {
    console.error('API loadDesigners() - DataService is not defined');
    return;
  }
  
  // Get the container element using the safe helper
  const container = window.getContainerSafely(containerId);
  if (!container) {
    console.error(`API loadDesigners() - Unable to find container using ID or alternatives: "${containerId}"`);
    return;
  }
  
  try {
    // Show loading state
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading artisans...</span>
        </div>
        <p class="mt-2">Loading artisans...</p>
      </div>
    `;
    
    console.log(`API loadDesigners() - Fetching designers from API...`);
    
    // Use the appropriate API endpoint based on options
    let designersData;
    if (options.featured) {
      console.log(`API loadDesigners() - Using featured designers endpoint`);
      designersData = await DataService.getFeaturedDesigners();
    } else {
      console.log(`API loadDesigners() - Using all designers endpoint`);
      designersData = await DataService.getAllDesigners();
    }
    
    console.log(`API loadDesigners() - API response:`, designersData);
    
    // Initialize designers array
    let designers = [];
    
    // Handle different possible response formats
    if (designersData && designersData.success === true) {
      // Format 1: { success: true, data: { designers: [...] } }
      if (designersData.data && Array.isArray(designersData.data.designers)) {
        designers = designersData.data.designers;
        console.log(`API loadDesigners() - Found designers in data.designers:`, designers.length);
      } 
      // Format 2: { success: true, designers: [...] }
      else if (designersData.designers && Array.isArray(designersData.designers)) {
        designers = designersData.designers;
        console.log(`API loadDesigners() - Found designers in designers property:`, designers.length);
      }
      // Format 3: { success: true, data: [...] }
      else if (designersData.data && Array.isArray(designersData.data)) {
        designers = designersData.data;
        console.log(`API loadDesigners() - Found designers in data array:`, designers.length);
      }
    } else if (Array.isArray(designersData)) {
      // Format 4: Direct array response
      designers = designersData;
      console.log(`API loadDesigners() - Response is direct array:`, designers.length);
    }
    
    console.log(`API loadDesigners() - Final designers array:`, designers);
    
    if (options.limit && designers.length > options.limit) {
      console.log(`API loadDesigners() - Limiting to ${options.limit} designers`);
      designers = designers.slice(0, options.limit);
    }
    
    if (designers.length === 0) {
      console.log(`API loadDesigners() - No designers available after filtering`);
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted">No artisans available at the moment</p>
        </div>
      `;
      return;
    }
    
    // Render designers
    console.log(`API loadDesigners() - Rendering ${designers.length} designers`);
    container.innerHTML = '';
    
    designers.forEach(designer => {
      console.log(`API loadDesigners() - Rendering designer:`, designer.id, designer.name);
      const imgSrc = designer.image || '/src/client/assets/placeholder.jpg';
      
      // Truncate bio if too long
      const shortenedBio = designer.bio 
        ? (designer.bio.length > 120 ? designer.bio.substring(0, 120) + '...' : designer.bio)
        : 'No bio available';
      
      const designerHtml = `
        <div class="col-lg-3 col-md-6 mb-4">
          <a href="/src/client/views/designer/designer-page.html?id=${designer.id}" class="text-decoration-none text-dark">
            <div class="card designer-card h-100 shadow-sm">
              <div class="text-center pt-4">
                <img src="${imgSrc}" alt="${designer.name}" class="rounded-circle designer-card-img" style="width: 120px; height: 120px; object-fit: cover;">
              </div>
              <div class="card-body text-center">
                <h5 class="card-title">${designer.name}</h5>
                <p class="text-primary mb-2">${designer.specialty || 'Artisan'}</p>
                <p class="card-text small">${shortenedBio}</p>
              </div>
            </div>
          </a>
        </div>
      `;
      
      container.innerHTML += designerHtml;
    });
  } catch (error) {
    console.error('Error loading designers:', error);
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <p class="text-danger">Error loading artisans</p>
      </div>
    `;
  }
};

// Wait until DataService is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Ensure DataService exists
  if (typeof DataService === 'undefined') {
    console.error('DataService is not defined. API data loader cannot function.');
    return;
  }
  
  console.log('API Data Loader: Ready and initialized');
  
  /**
   * Add product to cart
   * @param {string|number} productId - ID of the product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {boolean} - Whether the operation was successful
   */
  window.addToCart = async function(productId, quantity = 1) {
    try {
      const product = await DataService.getProductById(productId);
      
      if (!product) {
        console.error('Product not found with ID:', productId);
        showToast('Product not found', 'error');
        return false;
      }
      
      // Get existing cart
      let cart = [];
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        try {
          cart = JSON.parse(cartData);
        } catch (e) {
          console.error('Error parsing cart data:', e);
          showToast('Error loading cart data', 'error');
          return false;
        }
      }
      
      // Check if product is already in cart
      const existingItem = cart.find(item => String(item.id) === String(productId));
      
      if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 0) + quantity;
      } else {
        // Create cart item from product data
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '/src/client/assets/placeholder.jpg',
          quantity: quantity,
          description: product.description ? 
            (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description) : 
            'No description available',
          categoryId: product.categoryId
        });
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Show success message
      showToast(`${product.name} added to your cart!`, 'success');
      
      // Update cart count in UI
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
      
      return true;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showToast('Error adding product to cart', 'error');
      return false;
    }
  };
});

// Helper function to ensure all API-related scripts are loaded on any page
window.ensureApiScriptsLoaded = function() {
  const requiredScripts = [
    '/src/client/js/data-service.js',
    '/src/client/js/api-data-loader.js'
  ];
  
  // Check if scripts are already loaded
  const loadedScripts = Array.from(document.querySelectorAll('script')).map(script => script.src);
  
  // Add any missing scripts
  requiredScripts.forEach(scriptSrc => {
    const fullSrc = new URL(scriptSrc, window.location.origin).href;
    if (!loadedScripts.some(src => src === fullSrc)) {
      console.log(`Adding missing script: ${scriptSrc}`);
      const script = document.createElement('script');
      script.src = scriptSrc;
      document.head.appendChild(script);
    }
  });
  
  // Check if DataService is available
  if (typeof DataService === 'undefined') {
    console.warn('DataService is not defined yet, waiting for scripts to load...');
    // Try again after a short delay
    setTimeout(() => {
      if (typeof DataService !== 'undefined') {
        console.log('DataService is now available');
      } else {
        console.error('DataService still not available after waiting');
      }
    }, 500);
  } else {
    console.log('DataService is available');
  }
  
  return typeof DataService !== 'undefined';
};

// Auto-initialize when loaded
if (typeof document !== 'undefined' && document.readyState === 'complete') {
  window.ensureApiScriptsLoaded();
} else {
  window.addEventListener('load', window.ensureApiScriptsLoaded);
} 