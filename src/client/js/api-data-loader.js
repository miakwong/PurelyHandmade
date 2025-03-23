/**
 * API Data Loader for Purely Handmade
 * 
 * This script provides API-based data loading functions that replace 
 * the localStorage-based functions in the original codebase.
 */

// Wait until DataService is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Ensure DataService exists
  if (typeof DataService === 'undefined') {
    console.error('DataService is not defined. API data loader cannot function.');
    return;
  }
  
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
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
      
      // Fetch products from API
      const products = await DataService.getAllProducts();
      
      // Apply filters if specified in options
      let filteredProducts = products.products || [];
      
      if (options.limit && filteredProducts.length > options.limit) {
        filteredProducts = filteredProducts.slice(0, options.limit);
      }
      
      if (filteredProducts.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-4">
            <p class="text-muted">No products available at the moment</p>
          </div>
        `;
        return;
      }
      
      // Render products
      container.innerHTML = '';
      
      filteredProducts.forEach(product => {
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
    } catch (error) {
      console.error('Error loading products:', error);
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
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // Show loading state
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading categories...</span>
          </div>
          <p class="mt-2">Loading categories...</p>
        </div>
      `;
      
      // Fetch categories from API
      const categoriesData = await DataService.getAllCategories();
      
      let categories = categoriesData || [];
      
      if (options.featured) {
        categories = categories.filter(cat => cat.featured);
      }
      
      if (options.limit && categories.length > options.limit) {
        categories = categories.slice(0, options.limit);
      }
      
      if (categories.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-4">
            <p class="text-muted">No categories available at the moment</p>
          </div>
        `;
        return;
      }
      
      // Render categories
      container.innerHTML = '';
      
      categories.forEach(category => {
        const imgSrc = category.image || '/src/client/assets/placeholder.jpg';
        
        const categoryHtml = `
          <div class="col-lg-4 col-md-6 mb-4">
            <a href="/src/client/views/product/products.html?category=${category.id}" class="category-card">
              <div class="category-img-overlay"></div>
              <img src="${imgSrc}" alt="${category.name}" class="category-img">
              <div class="category-title">
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
              </div>
            </a>
          </div>
        `;
        
        container.innerHTML += categoryHtml;
      });
    } catch (error) {
      console.error('Error loading categories:', error);
      container.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-danger">Error loading categories</p>
        </div>
      `;
    }
  };
  
  /**
   * Load designers/artisans for homepage or designer browsing pages
   * @param {string} containerId - ID of the container element to populate
   * @param {Object} options - Options for filtering designers
   * @param {number} options.limit - Maximum number of designers to display
   * @param {boolean} options.featured - Whether to show only featured designers
   */
  window.loadDesigners = async function(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
      
      // Fetch designers from API
      const designersData = await DataService.getAllDesigners();
      
      let designers = designersData || [];
      
      if (options.featured) {
        designers = designers.filter(designer => designer.featured);
      }
      
      if (options.limit && designers.length > options.limit) {
        designers = designers.slice(0, options.limit);
      }
      
      if (designers.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-4">
            <p class="text-muted">No artisans available at the moment</p>
          </div>
        `;
        return;
      }
      
      // Render designers
      container.innerHTML = '';
      
      designers.forEach(designer => {
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