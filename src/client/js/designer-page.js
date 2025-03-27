// Display toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
  
    if (!toastContainer) return;
  
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `modern-toast ${type}`;
  
    // Add content
    toast.innerHTML = `
      <div style="flex: 1; padding-right: 10px;">
        <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
            ${message}
      </div>
      <div style="cursor: pointer; font-size: 16px; color: #999;">&times;</div>
    `;
  
    // Append to container
    toastContainer.appendChild(toast);
  
    // Add close button event
    const closeBtn = toast.querySelector('div:last-child');
    closeBtn.addEventListener('click', function () {
      toast.remove();
    });
  
    // Automatically remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  // Parse query string to get designer id
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // Add product to cart
  async function addToCart(productId, quantity) {
    console.log('addToCart called with productId:', productId, 'type:', typeof productId);
  
    // Retrieve product information
    const productsData = localStorage.getItem('products');
    if (!productsData) {
      console.error('No products data found in localStorage');
      showToast('Product data not available', 'error');
      return;
    }
  
    const products = JSON.parse(productsData);
  
    // Try to match by both string and number comparisons
    let product = products.find(p => p.id === productId);
  
    // If not found, try parsing as integer
    if (!product && !isNaN(parseInt(productId))) {
      const numericId = parseInt(productId);
      console.log('Trying numeric ID:', numericId);
      product = products.find(p => p.id === numericId);
    }
  
    // If still not found, try string comparison
    if (!product) {
      const stringId = String(productId);
      console.log('Trying string ID:', stringId);
      product = products.find(p => String(p.id) === stringId);
    }
  
    if (!product) {
      console.error('Product not found with ID:', productId);
      showToast('Product not found', 'error');
      return;
    }
  
    console.log('Found product to add to cart:', product);
  
    // Check if user is logged in
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) {
      // User not logged in, prompt login
      showToast('Please login to add items to cart', 'error');
      setTimeout(() => {
        window.location.href = '/~xzy2020c/PurelyHandmade/views/auth/login.html?returnUrl=' + encodeURIComponent(window.location.href);
      }, 1500);
      return;
    }
  
    // Show loading indicator
    showLoading('Adding to cart...');
  
    try {
      // Call API to add product to cart
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DataService.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId,
          quantity: quantity || 1
        })
      });
  
      const result = await response.json();
      hideLoading();
  
      if (result.success) {
        // Show success message
        showToast(`${product.name || 'Product'} added to your cart!`, 'success');
  
        // Update cart count
        if (typeof window.updateCartCount === 'function') {
          window.updateCartCount();
        }
      } else {
        // Show error message
        showToast(result.message || 'Failed to add product to cart', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error adding product to cart:', error);
      showToast('Error adding product to cart', 'error');
    }
  }
  
  // Show loading indicator
  function showLoading(message = 'Loading...') {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading-overlay';
    loadingEl.style.position = 'fixed';
    loadingEl.style.top = '0';
    loadingEl.style.left = '0';
    loadingEl.style.width = '100%';
    loadingEl.style.height = '100%';
    loadingEl.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingEl.style.display = 'flex';
    loadingEl.style.flexDirection = 'column';
    loadingEl.style.justifyContent = 'center';
    loadingEl.style.alignItems = 'center';
    loadingEl.style.zIndex = '9999';
  
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid var(--accent-color, #4CAF50)';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    spinner.style.marginBottom = '15px';
  
    const messageEl = document.createElement('div');
    messageEl.className = 'loading-message';
    messageEl.textContent = message;
    messageEl.style.fontSize = '16px';
  
    loadingEl.appendChild(spinner);
    loadingEl.appendChild(messageEl);
    document.body.appendChild(loadingEl);
  
    // Add animation styles
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
  
  // Hide loading indicator
  function hideLoading() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
      loadingEl.remove();
    }
  }
  
  // Update cart count
  async function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
  
    if (!cartCount) return;
  
    // Check if user is logged in
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) {
      cartCount.style.display = 'none';
      return;
    }
  
    try {
      // Call API to get cart data
      const response = await fetch(`/api/cart?userId=${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${DataService.getAuthToken()}`
        }
      });
  
      const result = await response.json();
  
      if (result.success) {
        let cartItems = [];
  
        // Handle different response structures
        if (Array.isArray(result.data)) {
          cartItems = result.data;
        } else if (result.data && Array.isArray(result.data.items)) {
          cartItems = result.data.items;
        } else if (Array.isArray(result.items)) {
          cartItems = result.items;
        }
  
        if (cartItems.length > 0) {
          const count = cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
          cartCount.textContent = count;
          cartCount.style.display = count > 0 ? 'inline-block' : 'none';
        } else {
          cartCount.style.display = 'none';
        }
      } else {
        cartCount.style.display = 'none';
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      cartCount.style.display = 'none';
    }
  }
  
  // Create product card HTML
  function createProductCard(product) {
    // Ensure product.id is treated as a string for consistent comparison
    const productId = String(product.id);
    console.log('Creating card for product ID:', productId);
  
    // Generate star rating HTML
    const fullStars = Math.floor(product.rating || 0);
    const hasHalfStar = (product.rating || 0) % 1 >= 0.5;
  
    let starsHtml = '<div class="product-rating">';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="bi bi-star-fill"></i>';
    }
    if (hasHalfStar) {
      starsHtml += '<i class="bi bi-star-half"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="bi bi-star"></i>';
    }
    // Add numeric rating display
    starsHtml += `<span class="rating-text">(${product.rating ? product.rating.toFixed(1) : '0.0'})</span>`;
    starsHtml += '</div>';
  
    // Price display
    let priceHtml = '';
    if (product.onSale && product.salePrice) {
      priceHtml = `
        <div class="product-price-wrapper">
          <span class="product-price">$${product.salePrice.toFixed(2)}</span>
          <span class="product-price-discount">$${product.price.toFixed(2)}</span>
        </div>
      `;
    } else if (product.price) {
      priceHtml = `<div class="product-price-wrapper"><span class="product-price">$${product.price.toFixed(2)}</span></div>`;
    } else {
      priceHtml = `<div class="product-price-wrapper"><span class="product-price">Price unavailable</span></div>`;
    }
  
    // Handle image URL
    let imageUrl = CONFIG.getImagePath(`/product-placeholder.jpg`);
    if (product.image) {
      imageUrl = product.image;
    } else if (product.gallery) {
      // Handle gallery being an array or JSON string
      try {
        const gallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
        if (Array.isArray(gallery) && gallery.length > 0) {
          imageUrl = gallery[0];
        }
      } catch (e) {
        console.error('Error parsing gallery data:', e);
      }
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    }
  
    return `
      <div class="col-md-4">
      <div class="product-card">
        <div class="product-img-wrapper">
        <a href="${CONFIG.getViewPath(`/products/product_detail.html?id=${product.id}`)}">
          <img src="${imageUrl}" class="product-img" alt="${product.name || 'Product'}">
          ${product.onSale ? '<div class="product-badge">Sale</div>' : ''}
        </a>
        </div>
        <div class="product-card-body">
        <a href="${CONFIG.getViewPath(`/products/product_detail.html?id=${product.id}`)}" style="text-decoration: none; color: inherit;">
          <h2 class="product-title">${product.name}</h2>
        </a>
        ${priceHtml}
        ${starsHtml}
        <p class="product-desc">${product.description ? product.description.substring(0, 80) + '...' : 'No description available'}</p>
        <button class="add-to-cart-btn" data-product-id="${productId}" onclick="addToCart('${productId}', 1); return false;">
          <i class="bi bi-cart-plus me-2"></i> Add to Cart
        </button>
        </div>
      </div>
      </div>
    `;
  }
  
  // Load designer details and products
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting to load designer products');
    const designerId = getQueryParam('id');
    console.log('Designer ID from URL:', designerId);
  
    if (!designerId) {
      showToast('No designer ID provided in URL', 'error');
      return;
    }
  
    showLoading('Loading designer information...');
  
    try {
      // Fetch designer data from API
      const designerResponse = await fetch(CONFIG.getApiPath(`/designers/detail?id=${designerId}`));
      const designerResult = await designerResponse.json();
  
      console.log('Designer API response:', designerResult);
  
      if (!designerResult.success || !designerResult.data) {
        hideLoading();
        document.getElementById('designer-info').innerHTML = '<div class="alert alert-warning">Designer not found.</div>';
        return;
      }
  
      const designer = designerResult.data;
  
      // Display designer information
      document.getElementById('designer-info').innerHTML = `
        <h1>${designer.name}</h1>
        <p>${designer.bio || 'No biography available.'}</p>
      `;
  
      // Update breadcrumb with designer name
      document.getElementById('designer-name').textContent = designer.name;
  
      // Set header for products section
      document.getElementById('products-header').innerText = designer.name + "'s Products";
  
      // Fetch products by designer from API
      const productsResponse = await fetch(`/~xzy2020c/PurelyHandmade/api/products?designerId=${designerId}`);
      const productsResult = await productsResponse.json();
  
      console.log('Products API response:', productsResult);
      hideLoading();
  
      // Extract products from response
      let designerProducts = [];
      if (productsResult.success) {
        if (Array.isArray(productsResult.data)) {
          designerProducts = productsResult.data;
        } else if (productsResult.data && Array.isArray(productsResult.data.products)) {
          designerProducts = productsResult.data.products;
        } else if (productsResult.products && Array.isArray(productsResult.products)) {
          designerProducts = productsResult.products;
        }
      }
  
      console.log('Filtered designer products:', designerProducts);
  
      if (designerProducts.length === 0) {
        document.getElementById('products-container').innerHTML = '<div class="alert alert-info">No products available from this designer.</div>';
        return;
      }
  
      // Render product cards
      const productsContainer = document.getElementById('products-container');
      productsContainer.innerHTML = '';
  
      designerProducts.forEach(product => {
        console.log('Creating card for product:', product);
        productsContainer.innerHTML += createProductCard(product);
      });
  
      // No need for separate event listeners since we're using onclick in the HTML
      console.log('Product cards added with inline onclick handlers');
    } catch (error) {
      hideLoading();
      console.error('Error loading designer data:', error);
      document.getElementById('designer-info').innerHTML = '<div class="alert alert-danger">Error loading designer information.</div>';
    }
  });