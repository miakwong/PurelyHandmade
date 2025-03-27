
    // Get product ID from URL
    function getProductId() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      return id ? parseInt(id) : null;
    }

    // Load product details from API
    async function loadProductDetails() {
      const productId = getProductId();

      if (!productId) {
        showError('Product ID not found in URL');
        return;
      }

      try {
        // Show loading state
        document.getElementById('product-title').textContent = 'Loading product...';

        // Fetch product from API
        const product = await DataService.getProductById(productId);

        if (!product) {
          showError('Product not found');
          return;
        }

        // Render product
        renderProduct(product);

        // Setup other page elements
        setupQuantityButtons();
        checkWishlist(productId);
        setupSocialSharing(product);

        // Load related products
        loadRelatedProducts(product);

        // Update cart count
        updateCartCount();
      } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details');
      }
    }

    // Render product details
    function renderProduct(product) {
      // Set title
      document.getElementById('product-title').textContent = product.name || 'Unnamed Product';

      // Set breadcrumbs
      document.getElementById('breadcrumb-product').textContent = product.name || 'Product';

      const categoryLink = document.getElementById('breadcrumb-category-link');
      if (product.categoryName) {
        categoryLink.querySelector('a').href = CONFIG.getViewPath(`products/category-page.html?id=${product.categoryId}`);
        categoryLink.querySelector('a').textContent = product.categoryName;
      } else {
        categoryLink.querySelector('a').href = CONFIG.getViewPath(`products/category-list.html`);
        categoryLink.querySelector('a').textContent = 'Categories';
      }

      // Set images
      const carouselInner = document.getElementById('carousel-images');
      let galleryImages = [];

      // Handle gallery/images differently depending on format
      if (product.gallery) {
        try {
          // Try to parse gallery if it's a JSON string
          if (typeof product.gallery === 'string') {
            galleryImages = JSON.parse(product.gallery);
          } else if (Array.isArray(product.gallery)) {
            galleryImages = product.gallery;
          }
        } catch (e) {
          console.error('Failed to parse gallery:', e);
        }
      }

      // Fallback to single image if no gallery
      if (galleryImages.length === 0 && product.image) {
        galleryImages = [product.image];
      }

      // If still no images, use placeholder
      if (galleryImages.length === 0) {
        galleryImages = ['/~xzy2020c/PurelyHandmade/assets/placeholder.jpg'];
      }

      // Create carousel items
      carouselInner.innerHTML = '';
      galleryImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `<img src="${image}" class="d-block w-100" alt="${product.name}">`;
        carouselInner.appendChild(item);
      });

      // Set price
      const price = parseFloat(product.price) || 0;
      const salePrice = product.onSale && product.salePrice ? parseFloat(product.salePrice) : null;

      if (product.onSale && salePrice) {
        document.getElementById('product-price').textContent = `$${salePrice.toFixed(2)}`;
        document.getElementById('product-original-price').textContent = `$${price.toFixed(2)}`;
        document.getElementById('product-status').innerHTML = '<span class="badge bg-danger">Sale</span>';
      } else {
        document.getElementById('product-price').textContent = `$${price.toFixed(2)}`;
        document.getElementById('product-original-price').textContent = '';
      }

      // Set description
      document.getElementById('product-description').innerHTML = `
      <p>${product.description || 'No description available.'}</p>
    `;

      document.getElementById('full-description').innerHTML = `
      <p>${product.description || 'No description available.'}</p>
    `;

      // Set details
      let detailsHtml = '<table class="table table-bordered">';

      if (product.material) {
        detailsHtml += `<tr><th>Material</th><td>${product.material}</td></tr>`;
      }

      if (product.dimensions) {
        detailsHtml += `<tr><th>Dimensions</th><td>${product.dimensions}</td></tr>`;
      }

      if (product.weight) {
        detailsHtml += `<tr><th>Weight</th><td>${product.weight}</td></tr>`;
      }

      detailsHtml += `<tr><th>SKU</th><td>${product.id || 'N/A'}</td></tr>`;
      detailsHtml += '</table>';

      document.getElementById('product-details').innerHTML = detailsHtml;

      // Set metadata
      document.getElementById('product-category').textContent = product.categoryName || 'Uncategorized';
      document.getElementById('product-designer').textContent = product.designerName || 'Unknown';
      document.getElementById('product-code').textContent = `SKU-${product.id || 'N/A'}`;

      // Set reviews if available
      if (product.reviews && product.reviews.length > 0) {
        renderReviews(product.reviews);
      } else {
        document.getElementById('reviews-container').innerHTML = `
        <p>No reviews yet for this product.</p>
      `;
      }

      // Set rating
      let rating = 0;
      if (product.rating) {
        rating = parseFloat(product.rating);
      } else if (product.reviews && product.reviews.length > 0) {
        // Calculate average rating from reviews
        const totalRating = product.reviews.reduce((sum, review) => sum + (parseFloat(review.rating) || 0), 0);
        rating = totalRating / product.reviews.length;
      }

      const ratingHtml = generateRatingStars(rating);
      document.getElementById('product-rating').innerHTML = ratingHtml;

      // Setup add to cart button
      document.getElementById('add-to-cart').addEventListener('click', function () {
        const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
        addToCart(product, quantity);
      });

      // Setup wishlist button
      document.getElementById('wishlist-btn').addEventListener('click', function () {
        toggleWishlist(product);
      });
    }

    // Generate rating stars
    function generateRatingStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      let starsHtml = '<div class="product-rating">';
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="bi bi-star-fill text-warning"></i> ';
      }
      if (hasHalfStar) {
        starsHtml += '<i class="bi bi-star-half text-warning"></i> ';
      }
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="bi bi-star text-muted"></i> ';
      }

      starsHtml += `<span class="ms-2 text-muted">(${rating.toFixed(1)})</span>`;
      starsHtml += '</div>';

      return starsHtml;
    }

    // Setup quantity buttons
    function setupQuantityButtons() {
      const quantityInput = document.getElementById('product-quantity');
      const decreaseBtn = document.getElementById('decrease-quantity');
      const increaseBtn = document.getElementById('increase-quantity');

      decreaseBtn.addEventListener('click', function () {
        let quantity = parseInt(quantityInput.value) || 1;
        if (quantity > 1) {
          quantityInput.value = quantity - 1;
        }
      });

      increaseBtn.addEventListener('click', function () {
        let quantity = parseInt(quantityInput.value) || 1;
        quantityInput.value = quantity + 1;
      });

      quantityInput.addEventListener('change', function () {
        let quantity = parseInt(quantityInput.value) || 1;
        if (quantity < 1) {
          quantityInput.value = 1;
        }
      });
    }

    // Render reviews
    function renderReviews(reviews) {
      const reviewsContainer = document.getElementById('reviews-container');
      if (!reviewsContainer) return;

      if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
        return;
      }

      let reviewsHtml = '';

      reviews.forEach(review => {
        const rating = parseFloat(review.rating) || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        let starsHtml = '<div class="rating">';
        for (let i = 0; i < fullStars; i++) {
          starsHtml += '<i class="bi bi-star-fill text-warning"></i> ';
        }
        if (hasHalfStar) {
          starsHtml += '<i class="bi bi-star-half text-warning"></i> ';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
          starsHtml += '<i class="bi bi-star text-muted"></i> ';
        }
        starsHtml += '</div>';

        const reviewDate = review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date';

        reviewsHtml += `
        <div class="review-card">
          <div class="d-flex justify-content-between align-items-center">
            <h5>${review.userName || 'Anonymous'}</h5>
            <small class="text-muted">${reviewDate}</small>
          </div>
          ${starsHtml}
          <h6>${review.title || 'Review'}</h6>
          <p>${review.content || 'No comment provided.'}</p>
        </div>
      `;
      });

      reviewsContainer.innerHTML = reviewsHtml;
    }

    // Load related products
    async function loadRelatedProducts(product) {
      try {
        const categoryId = product.categoryId || 0;

        // Get all products from API
        const productsData = await DataService.getAllProducts();
        if (!productsData || !productsData.success) {
          console.error('Failed to load related products');
          return;
        }

        // Get products array
        let products = [];
        if (productsData.data && productsData.data.products) {
          products = productsData.data.products;
        } else if (productsData.products) {
          products = productsData.products;
        }

        // Find products in the same category, excluding current product
        let relatedProducts = products.filter(p => p.categoryId === categoryId && p.id !== product.id);

        // If not enough products in the same category, add some other products
        if (relatedProducts.length < 4) {
          const otherProducts = products.filter(p => p.id !== product.id && p.categoryId !== categoryId);
          relatedProducts = relatedProducts.concat(otherProducts.slice(0, 4 - relatedProducts.length));
        }

        // Limit to max 4 related products
        relatedProducts = relatedProducts.slice(0, 4);

        // Render related products
        const container = document.getElementById('related-products-container');
        if (!container) return;

        container.innerHTML = '';

        if (relatedProducts.length === 0) {
          container.innerHTML = '<p class="text-muted">No related products found.</p>';
          return;
        }

        relatedProducts.forEach(relatedProduct => {
          // Handle potentially empty fields
          const name = relatedProduct.name || 'Unnamed Product';
          const price = parseFloat(relatedProduct.price) || 0;
          const salePrice = relatedProduct.onSale && relatedProduct.salePrice ? parseFloat(relatedProduct.salePrice) : (relatedProduct.onSale ? price * 0.9 : null);

          // Get product image
          let imageSrc = '/~xzy2020c/PurelyHandmade/assets/placeholder.jpg';
          if (relatedProduct.image) {
            imageSrc = relatedProduct.image;
          } else if (relatedProduct.gallery) {
            try {
              const gallery = typeof relatedProduct.gallery === 'string' ? JSON.parse(relatedProduct.gallery) : relatedProduct.gallery;
              if (Array.isArray(gallery) && gallery.length > 0) {
                imageSrc = gallery[0];
              }
            } catch (e) {
              console.error('Failed to parse gallery:', e);
            }
          }

          // Generate price HTML
          let priceHtml;
          if (relatedProduct.onSale && salePrice) {
            priceHtml = `
            <span class="product-price">$${salePrice.toFixed(2)}</span>
            <span class="product-price-discount">$${price.toFixed(2)}</span>
          `;
          } else {
            priceHtml = `<span class="product-price">$${price.toFixed(2)}</span>`;
          }

          // Generate product card HTML
          const productHtml = `
          <div class="col-6 col-md-3">
            <div class="product-card">
              ${relatedProduct.onSale ? '<span class="product-badge">SALE</span>' : ''}
              <a href="/~xzy2020c/PurelyHandmade/views/products/product_detail.html?id=${relatedProduct.id}" class="text-decoration-none text-dark">
                <img src="${imageSrc}" class="card-img-top" alt="${name}">
                <div class="card-body">
                  <h5 class="card-title">${name}</h5>
                  <div class="mb-2">${priceHtml}</div>
                  <button class="btn btn-outline-primary btn-sm w-100 add-to-cart-related" data-product-id="${relatedProduct.id}">
                    <i class="bi bi-cart-plus"></i> Add to Cart
                  </button>
                </div>
              </a>
            </div>
          </div>
        `;

          container.innerHTML += productHtml;
        });

        // Add related products' "Add to Cart" button events
        document.querySelectorAll('.add-to-cart-related').forEach(button => {
          button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = relatedProducts.find(p => p.id === productId);
            if (product) {
              addToCart(product, 1);
            }
          });
        });
      } catch (error) {
        console.error('Error loading related products:', error);
      }
    }

    // Add to cart
    async function addToCart(product, quantity) {
      if (!product) return;

      // Validate quantity
      quantity = parseInt(quantity);
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
      }

      // 检查用户是否登录
      const currentUser = DataService.getCurrentUser();
      if (!currentUser) {
        // 用户未登录，提示登录
        showToast('Please login to add items to cart', 'error');
        setTimeout(() => {
          window.location.href = '/~xzy2020c/PurelyHandmade/views/auth/login.html?returnUrl=' + encodeURIComponent(window.location.href);
        }, 1500);
        return;
      }

      // 显示加载提示
      showLoading('Adding to cart...');

      try {
        // 调用API添加商品到购物车
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DataService.getAuthToken()}`
          },
          body: JSON.stringify({
            userId: currentUser.id,
            productId: product.id,
            quantity: quantity
          })
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
          // 显示成功信息
          showToast(`${product.name || 'Product'} added to your cart!`, 'success');

          // 更新购物车数量
          if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
          }
        } else {
          // 显示错误信息
          showToast(result.message || 'Failed to add product to cart', 'error');
        }
      } catch (error) {
        hideLoading();
        console.error('Error adding product to cart:', error);
        showToast('Error adding product to cart', 'error');
      }
    }

    // 显示加载提示
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

      // 添加动画样式
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

    // 隐藏加载提示
    function hideLoading() {
      const loadingEl = document.getElementById('loading-overlay');
      if (loadingEl) {
        loadingEl.remove();
      }
    }

    // Update cart count
    function updateCartCount() {
      const cartData = localStorage.getItem('cart');
      const cartCount = document.getElementById('cart-count');

      if (!cartCount) return;

      if (cartData) {
        const cart = JSON.parse(cartData);
        const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
      } else {
        cartCount.style.display = 'none';
      }
    }

    // Handle wishlist
    function toggleWishlist(product) {
      if (!product) return;

      let wishlist = [];
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        wishlist = JSON.parse(wishlistData);
      }

      const productId = product.id;
      const isInWishlist = wishlist.some(item => item.id === productId);

      if (isInWishlist) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id !== productId);
        document.getElementById('wishlist-btn').classList.remove('active');
        showToast(`${product.name} removed from wishlist`, 'info');
      } else {
        // Add to wishlist
        // Handle image URL
        let imageUrl = '/~xzy2020c/PurelyHandmade/assets/placeholder.jpg';
        if (product.image) {
          imageUrl = product.image;
        } else if (product.gallery) {
          try {
            const gallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
            if (Array.isArray(gallery) && gallery.length > 0) {
              imageUrl = gallery[0];
            }
          } catch (e) {
            console.error('Failed to parse gallery:', e);
          }
        }

        // Calculate price
        const price = parseFloat(product.price) || 0;
        const finalPrice = product.onSale ? (parseFloat(product.salePrice) || price * 0.9) : price;

        wishlist.push({
          id: productId,
          name: product.name || 'Unnamed Product',
          price: finalPrice,
          image: imageUrl,
          categoryId: product.categoryId || null
        });

        document.getElementById('wishlist-btn').classList.add('active');
        showToast(`${product.name} added to wishlist`, 'success');
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Check if product is in wishlist
    function checkWishlist(productId) {
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlist = JSON.parse(wishlistData);
        const isInWishlist = wishlist.some(item => item.id === productId);

        if (isInWishlist) {
          document.getElementById('wishlist-btn').classList.add('active');
        }
      }
    }

    // Setup social sharing functionality
    function setupSocialSharing(product) {
      const productUrl = encodeURIComponent(window.location.href);
      const productName = encodeURIComponent(product.name || 'Purely Homemade Product');
      const productDesc = encodeURIComponent(product.description || 'Check out this amazing product from Purely Homemade!');

      const shareLinks = document.querySelectorAll('.social-share a');

      // Facebook share
      shareLinks[0].href = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`;
      shareLinks[0].target = '_blank';

      // Twitter share
      shareLinks[1].href = `https://twitter.com/intent/tweet?text=${productDesc}&url=${productUrl}`;
      shareLinks[1].target = '_blank';

      // Pinterest share
      let imageUrl = '';
      if (product.image) {
        imageUrl = encodeURIComponent(product.image);
      } else if (product.gallery) {
        try {
          const gallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
          if (Array.isArray(gallery) && gallery.length > 0) {
            imageUrl = encodeURIComponent(gallery[0]);
          }
        } catch (e) {
          console.error('Failed to parse gallery:', e);
        }
      }
      shareLinks[2].href = `https://pinterest.com/pin/create/button/?url=${productUrl}&media=${imageUrl}&description=${productDesc}`;
      shareLinks[2].target = '_blank';

      // Copy link
      shareLinks[3].addEventListener('click', function (e) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Link copied to clipboard!', 'success');
        }).catch(err => {
          console.error('Could not copy link: ', err);
        });
      });
    }

    // Show toast notification
    function showToast(message, type = 'success') {
      // Ensure toast container exists
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
      }

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast show`;
      toast.role = 'alert';
      toast.ariaLive = 'assertive';
      toast.ariaAtomic = 'true';

      // Set toast content with appropriate styling
      let bgClass = 'bg-success';
      if (type === 'error') bgClass = 'bg-danger';
      if (type === 'info') bgClass = 'bg-info';

      toast.innerHTML = `
      <div class="toast-header">
        <div class="rounded me-2 ${bgClass}" style="width: 20px; height: 20px;"></div>
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;

      // Add to container
      toastContainer.appendChild(toast);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // Show error
    function showError(message) {
      showToast(message, 'error');
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', function () {
      loadProductDetails();
    });
