/**
 * API Data Loader for Purely Handmade
 * 
 * This script provides API-based data loading functions that replace 
 * the localStorage-based functions in the original codebase.
 */

// Log when this script is loaded
console.log('api-data-loader.js loaded at', new Date().toISOString());

// 确保CONFIG对象已加载
(function ensureConfigLoaded() {
  if (typeof window.CONFIG === 'undefined') {
    console.warn('CONFIG object not found, waiting for it to be defined...');
    // CONFIG未找到，但我们不再尝试加载它，因为这会导致重复定义
    // 它应该由HTML文件中的<script>标签加载
    console.error('Please make sure config.js is loaded before api-data-loader.js');
  } else {
    console.log('CONFIG object detected:', CONFIG.BASE_URL);
  }
})();

// Universal fix to handle port issues - change API base URL if needed
if (typeof window.DataService !== 'undefined') {
  console.log('DataService detected');
} else {
  console.warn('DataService not detected, waiting for it to be defined...');
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
    console.warn('API loadProducts() - containerId is undefined, using default container ID: "products-container"');
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
      const imgSrc = product.image || (product.gallery ? JSON.parse(product.gallery)[0] : null) || `${CONFIG.BASE_URL}/assets/placeholder.jpg`;
      
      // Create product card
      const productHtml = `
        <div class="col-lg-3 col-md-6 col-sm-6 mb-4">
          <div class="product-card">
            <div class="product-img-wrapper">
              <a href="${CONFIG.getViewPath('products/product_detail.html')}?id=${product.id}">
                <img src="${imgSrc}" class="product-img" alt="${product.name || 'Product'}">
                ${product.onSale ? '<div class="product-badge">Sale</div>' : ''}
              </a>
            </div>
            <div class="product-card-body">
              <a href="${CONFIG.getViewPath('products/product_detail.html')}?id=${product.id}" style="text-decoration: none; color: inherit;">
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
  console.log(`API loadCategories() - Starting with parameters:`, { containerId, options });
  
  // 自动修复：如果containerId为undefined，尝试使用默认值
  if (!containerId) {
    console.warn('API loadCategories() - containerId is undefined, using default container ID: "category-cards-container"');
    containerId = 'category-cards-container'; // 使用默认的容器ID
  }
  
  // 检查CONFIG对象是否正确加载
  if (typeof CONFIG === 'undefined') {
    console.error('API loadCategories() - CONFIG is not defined');
    showErrorInContainer(containerId, 'Configuration is not loaded, cannot proceed');
    return;
  }
  
  // 输出CONFIG对象状态以诊断问题
  console.log('API loadCategories() - CONFIG object:', CONFIG);
  console.log('API loadCategories() - CONFIG.getImagePath exists:', typeof CONFIG.getImagePath === 'function');
  
  // 检查DataService可用性
  if (typeof DataService === 'undefined') {
    console.error('API loadCategories() - DataService is not defined');
    showErrorInContainer(containerId, 'DataService is not defined, cannot load data');
    return;
  }
  
  const container = window.getContainerSafely(containerId);
  if (!container) {
    console.error(`API loadCategories() - Unable to find container using ID or alternatives: "${containerId}"`);
    return;
  }
  
  try {
    // 显示加载状态
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading categories...</span>
        </div>
        <p class="mt-2">Loading categories...</p>
      </div>
    `;
    
    // Get category data
    console.log(`API loadCategories() - Fetching categories from API...`);
    let categoryResponse;
    
    try {
      categoryResponse = await DataService.getAllCategories();
      console.log(`API loadCategories() - API response:`, categoryResponse);
    } catch (apiError) {  
      console.error(`API loadCategories() - API call error:`, apiError);
      showErrorInContainer(containerId, `Failed to load categories: ${apiError.message || 'Unknown error'}`);
      return;
    }
    
    // 验证并处理API响应
    let categories = [];
    
    if (!categoryResponse || !categoryResponse.success) {
      const errorMessage = categoryResponse?.message || 'Unknown error';
      console.error(`API loadCategories() - API request failed: ${errorMessage}`);
      showErrorInContainer(containerId, `Load categories failed: ${errorMessage}`);
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
      console.warn(`API loadCategories() - API response format is abnormal, cannot extract category data`);
      categories = [];
    }
    
    console.log(`API loadCategories() - Number of categories before filtering:`, categories.length);
    
    // 应用筛选
    let filteredCategories = [...categories];
    
    // 特色分类筛选
    if (options.featured) {
      console.log(`API loadCategories() - Filtering featured categories`);
      filteredCategories = filteredCategories.filter(category => category.featured);
      console.log(`API loadCategories() - Number of featured categories:`, filteredCategories.length);
    }
    
    // 数量限制
    if (options.limit && filteredCategories.length > options.limit) {
      console.log(`API loadCategories() - Limiting to ${options.limit} categories`);
      filteredCategories = filteredCategories.slice(0, options.limit);
    }
    
    // 检查结果是否为空
    if (filteredCategories.length === 0) {
      console.log(`API loadCategories() - No categories available after filtering`);
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted">No categories available at the moment</p>
        </div>
      `;
      return;
    }
    
    // 渲染分类
    console.log(`API loadCategories() - Rendering ${filteredCategories.length} categories`);
    container.innerHTML = '';
    
    filteredCategories.forEach(category => {
      console.log(`API loadCategories() - Rendering category:`, category.id, category.name);
      
      // 处理图像 - 使用备选方案以避免函数调用错误
      let imgSrc = category.image;
      if (!imgSrc) {
        // 直接使用相对路径，避免使用可能不存在的函数
        imgSrc = `${CONFIG.BASE_URL}/img/category-placeholder.jpg`;
        console.log(`API loadCategories() - Using fallback image path: ${imgSrc}`);
      }
      
      // 创建分类卡片
      const categoryHtml = `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="category-card">
            <a href="${CONFIG.getViewPath(`/products/product-list.html?id=${category.id}`)}" class="category-link">
              <div class="category-img-wrapper">
                <img src="${imgSrc}" class="category-img" alt="${category.name}">
                <div class="category-overlay">
                  <h3 class="category-title">${category.name}</h3>
                  <p class="category-desc">${category.description || ''}</p>
                  <span class="btn-browse">Browse products</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      `;
      
      container.innerHTML += categoryHtml;
    });
    
    console.log(`API loadCategories() - Categories rendered`);
  } catch (error) {
    console.error('API loadCategories() - Error:', error);
    showErrorInContainer(containerId, `Error loading categories: ${error.message || 'Unknown error'}`);
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
    console.warn('API loadDesigners() - containerId is undefined, using default container ID: "designers-container"');
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
      const imgSrc = designer.image || `${CONFIG.BASE_URL}/assets/placeholder.jpg`;
      
      // Truncate bio if too long
      const shortenedBio = designer.bio 
        ? (designer.bio.length > 120 ? designer.bio.substring(0, 120) + '...' : designer.bio)
        : 'No bio available';
      
      const designerHtml = `
        <div class="col-lg-3 col-md-6 mb-4">
          <a href="${CONFIG.getViewPath('designer/designer-page.html')}?id=${designer.id}" class="text-decoration-none text-dark">
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
      // 获取当前用户信息
      const currentUser = DataService.getCurrentUser();
      
      if (!currentUser) {
        // 如果用户未登录，提示登录
        showToast('Please login to add items to cart', 'error');
        setTimeout(() => {
          window.location.href = `${CONFIG.getViewPath('auth/login.html')}?returnUrl=${encodeURIComponent(window.location.href)}`;
        }, 1500);
        return false;
      }
      
      // 显示加载中
      showLoadingOverlay('Adding to cart...');
      
      // 调用API添加商品到购物车
      const response = await fetch(`${CONFIG.getApiPath('cart/add')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DataService.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId,
          quantity: quantity
        })
      });
      
      const result = await response.json();
      hideLoadingOverlay();
      
      if (result.success) {
        // 获取产品信息用于显示消息
        const product = await DataService.getProductById(productId);
        const productName = product ? product.name : 'Product';
        
        // 显示成功消息
        showToast(`${productName} added to your cart!`, 'success');
        
        // 更新购物车数量显示
        if (typeof updateCartCount === 'function') {
          updateCartCount().catch(err => {
            console.error('Error updating cart count:', err);
          });
        }
        
        return true;
      } else {
        showToast(result.message || 'Failed to add item to cart', 'error');
        return false;
      }
    } catch (error) {
      hideLoadingOverlay();
      console.error('Error adding product to cart:', error);
      showToast('Error adding product to cart', 'error');
      return false;
    }
  };
});

// Helper function to ensure all API-related scripts are loaded on any page
window.ensureApiScriptsLoaded = function() {
  const requiredScripts = [
    '/~xzy2020c/PurelyHandmade/js/config.js', // 确保config.js首先加载
    '/~xzy2020c/PurelyHandmade/js/data-service.js',
    '/~xzy2020c/PurelyHandmade/js/api-data-loader.js'
  ];
  
  // Check if scripts are already loaded
  const loadedScripts = Array.from(document.querySelectorAll('script')).map(script => script.src);
  
  // Add any missing scripts in sequence
  let loadPromise = Promise.resolve();
  
  requiredScripts.forEach(scriptSrc => {
    const fullSrc = new URL(scriptSrc, window.location.origin).href;
    if (!loadedScripts.some(loadedSrc => loadedSrc.includes(scriptSrc))) {
      loadPromise = loadPromise.then(() => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = scriptSrc;
          script.onload = resolve;
          script.onerror = resolve; // Continue even if error
          document.head.appendChild(script);
          console.log('Loading script:', scriptSrc);
        });
      });
    }
  });
  
  return loadPromise;
};

/**
 * Show a loading overlay
 * @param {string} message - Message to display
 */
function showLoadingOverlay(message = 'Loading...') {
  // Check if overlay already exists
  let overlay = document.getElementById('loading-overlay');
  if (overlay) {
    // Update message if overlay already exists
    const messageEl = overlay.querySelector('.loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
    return;
  }
  
  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.border = '4px solid #f3f3f3';
  spinner.style.borderTop = '4px solid var(--accent-color, #4CAF50)';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.marginBottom = '15px';
  
  // Create message
  const messageEl = document.createElement('div');
  messageEl.className = 'loading-message';
  messageEl.textContent = message;
  messageEl.style.fontSize = '16px';
  
  // Add elements to overlay
  overlay.appendChild(spinner);
  overlay.appendChild(messageEl);
  
  // Add overlay to body
  document.body.appendChild(overlay);
  
  // Add keyframe animation
  if (!document.getElementById('loading-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Hide the loading overlay
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Auto-initialize when loaded
if (typeof document !== 'undefined' && document.readyState === 'complete') {
  window.ensureApiScriptsLoaded();
} else {
  window.addEventListener('load', window.ensureApiScriptsLoaded);
} 