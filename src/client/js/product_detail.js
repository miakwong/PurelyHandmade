/**
 * Product Detail Page Script
 * 产品详情页面脚本
 */

document.addEventListener("DOMContentLoaded", async function () {
  // 加载导航栏和页脚
  if (typeof UIHelpers !== 'undefined') {
    UIHelpers.loadNavbar().then(() => UIHelpers.updateCartCount());
    UIHelpers.loadFooter();
  }
  
  // 获取URL参数
  const productId = UIHelpers.getUrlParameter('id');
  const categorySlug = UIHelpers.getUrlParameter('category');
  
  console.log("Product ID:", productId, "Category:", categorySlug);
  
  // 获取产品数据
  let product = null;
  let category = null;
  let designer = null;
  
  if (productId) {
    try {
      // 异步获取产品数据
      product = await DataService.getProductById(productId);
      
      if (product) {
        // 异步获取类别和设计师数据
        category = await DataService.getCategoryById(product.categoryId);
        designer = await DataService.getDesignerById(product.designerId);
        
        // 更新面包屑导航
        updateBreadcrumb(category, product);
        
        // 更新产品详情
        updateProductDetails(product, designer);
        
        // 加载产品评论
        loadProductReviews(productId);
        
        // 设置添加到购物车按钮
        setupAddToCartButton(product);
      } else {
        handleProductNotFound();
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      handleProductNotFound();
    }
  } else {
    handleProductNotFound();
  }
  
  /**
   * 更新面包屑导航
   * Update breadcrumb navigation
   */
  function updateBreadcrumb(category, product) {
    const categoryLink = document.getElementById("breadcrumb-category-link");
    const productItem = document.getElementById("breadcrumb-product");
    
    if (category && categoryLink) {
      categoryLink.innerHTML = `<a href="/src/client/views/product/products.html?category=${category.id}">${category.name}</a>`;
    }
    
    if (product && productItem) {
      productItem.textContent = product.name;
    }
  }
  
  /**
   * 更新产品详情
   * Update product details
   */
  function updateProductDetails(product, designer) {
    // 更新标题和主要信息
    document.getElementById("product-title").textContent = product.name;
    
    // Check if onSale property exists and salePrice is defined
    const hasDiscount = product.onSale && product.salePrice !== undefined;
    const price = hasDiscount
      ? `<span class="text-decoration-line-through me-2">$${product.price.toFixed(2)}</span>$${product.salePrice.toFixed(2)}`
      : `$${product.price.toFixed(2)}`;
    
    document.getElementById("product-price").innerHTML = `Price: ${price}`;
    document.getElementById("product-description").textContent = product.description;
    
    // 显示设计师信息如果有的话
    const designerElement = document.getElementById("product-designer");
    if (designerElement && designer) {
      designerElement.textContent = `Designer: ${designer.name}`;
      designerElement.style.display = 'block';
    }
    
    // 设置产品详情
    const detailsElement = document.getElementById("product-details");
    if (detailsElement && product.details) {
      detailsElement.innerHTML = product.details || '';
    }
    
    // 设置主产品图片
    updateProductImages(product);
  }
  
  /**
   * 更新产品图片
   */
  function updateProductImages(product) {
    const carouselInner = document.getElementById("carousel-images");
    if (!carouselInner) return;
    
    // Clear any existing content
    carouselInner.innerHTML = '';
    
    // Use image array if available, otherwise just use the main image
    const images = product.gallery ? JSON.parse(product.gallery) : [];
    
    if (images.length === 0 && product.image) {
      images.push(product.image);
    }
    
    // If no images, use a placeholder
    if (images.length === 0) {
      images.push('/src/client/img/placeholder.jpg');
    }
    
    // Add each image to the carousel
    images.forEach((imageSrc, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = imageSrc;
      img.className = 'd-block w-100';
      img.alt = `${product.name} - Image ${index + 1}`;
      
      carouselItem.appendChild(img);
      carouselInner.appendChild(carouselItem);
    });
  }
  
  /**
   * 设置添加到购物车按钮
   * Setup add to cart button
   */
  function setupAddToCartButton(product) {
    const addToCartBtn = document.getElementById("add-to-cart");
    if (!addToCartBtn) return;
    
    // Disable the button if the product is out of stock
    if (product.stock <= 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = "Out of Stock";
      return;
    }
    
    addToCartBtn.addEventListener("click", function() {
      const quantity = parseInt(document.getElementById("quantity").value) || 1;
      
      if (DataService.addToCart(product.id, quantity)) {
        UIHelpers.showToast("Product added to cart!");
        UIHelpers.updateCartCount();
      } else {
        UIHelpers.showToast("Failed to add product to cart", "error");
      }
    });
  }
  
  /**
   * 加载产品评论
   * Load product reviews
   */
  async function loadProductReviews(productId) {
    try {
      const reviews = await DataService.getProductReviews(productId);
      displayReviews(reviews);
    } catch (error) {
      console.error("Error loading product reviews:", error);
    }
  }
  
  /**
   * 显示评论
   * Display reviews
   */
  function displayReviews(reviews) {
    const reviewsContainer = document.getElementById("product-reviews");
    if (!reviewsContainer) return;
    
    if (!reviews || reviews.length === 0) {
      reviewsContainer.innerHTML = '<p class="text-muted">No reviews yet.</p>';
      return;
    }
    
    reviewsContainer.innerHTML = '';
    
    reviews.forEach(review => {
      const reviewElement = document.createElement("div");
      reviewElement.className = "review-item mb-3 p-3 border rounded";
      
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      
      reviewElement.innerHTML = `
        <div class="d-flex justify-content-between">
          <h5 class="mb-1">${review.title || 'Review'}</h5>
          <div class="text-warning">${stars}</div>
        </div>
        <p class="mb-1">${review.content}</p>
        <small class="text-muted">By ${review.username || 'Anonymous'} - ${new Date(review.createdAt).toLocaleDateString()}</small>
      `;
      
      reviewsContainer.appendChild(reviewElement);
    });
  }
  
  /**
   * 处理产品未找到的情况
   * Handle product not found
   */
  function handleProductNotFound() {
    document.querySelector('.container.mb-5').innerHTML = `
      <div class="alert alert-warning text-center my-5">
        <h4>Product Not Found</h4>
        <p>The product you are looking for does not exist or has been removed.</p>
        <a href="/src/client/views/product/products.html" class="btn btn-primary mt-3">Browse Products</a>
      </div>
    `;
  }
});
