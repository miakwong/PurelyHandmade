/**
 * Product Detail Page Script
 * 产品详情页面脚本
 */

document.addEventListener("DOMContentLoaded", function () {
  // 加载导航栏和页脚
  if (typeof UIHelpers !== 'undefined') {
    UIHelpers.loadNavbar().then(() => UIHelpers.updateCartCount());
    UIHelpers.loadFooter();
  }
  
  // 获取URL参数
  const productId = UIHelpers.getUrlParameter('id');
  const categorySlug = UIHelpers.getUrlParameter('category');
  
  console.log("Product ID:", productId, "Category:", categorySlug);
  
  // 图片基础路径
  const imgBasePath = '/src/client/img/';
  
  // 获取产品数据
  let product = null;
  let category = null;
  let designer = null;
  
  if (productId) {
    product = DataService.getProductById(productId);
    
    if (product) {
      category = DataService.getCategoryById(product.categoryId);
      designer = DataService.getDesignerById(product.designerId);
    }
  }
  
  // 更新面包屑导航
  updateBreadcrumb(category, product);
  
  // 更新产品详情
  if (product) {
    updateProductDetails(product, designer);
  } else {
    handleProductNotFound();
  }
  
  /**
   * 更新面包屑导航
   * Update breadcrumb navigation
   */
  function updateBreadcrumb(category, product) {
    const categoryLink = document.getElementById("breadcrumb-category-link");
    const productItem = document.getElementById("breadcrumb-item");
    
    if (category && categoryLink) {
      categoryLink.textContent = category.name;
      categoryLink.setAttribute("href", `products.html?category=${category.slug}`);
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
    
    const price = product.onSale 
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
      detailsElement.innerHTML = product.details;
    }
    
    // 设置主产品图片
    const mainImage = document.getElementById("product-image");
    if (mainImage && product.images && product.images.length > 0) {
      mainImage.src = product.images[0];
      mainImage.alt = product.name;
    }
    
    // 生成缩略图
    generateThumbnails(product);
    
    // 设置添加到购物车按钮
    setupAddToCartButton(product);
    
    // 显示评论
    displayReviews(product);
  }
  
  /**
   * 生成产品图片缩略图
   * Generate product thumbnails
   */
  function generateThumbnails(product) {
    const thumbnailContainer = document.getElementById("thumbnail-images");
    if (!thumbnailContainer || !product.images || product.images.length === 0) return;
    
    thumbnailContainer.innerHTML = ""; // 清除之前的缩略图
    
    const mainImage = document.getElementById("product-image");
    
    product.images.forEach((imgSrc, index) => {
      const thumb = document.createElement("img");
      thumb.src = imgSrc;
      thumb.classList.add("thumbnail-img");
      
      // 默认第一个缩略图为激活状态
      if (index === 0) {
        thumb.classList.add("active");
      }
      
      // 点击时切换主图片
      thumb.addEventListener("click", function () {
        mainImage.src = imgSrc;
        document.querySelectorAll(".thumbnail-img").forEach(img => img.classList.remove("active"));
        thumb.classList.add("active");
      });
      
      thumbnailContainer.appendChild(thumb);
    });
    
    console.log("Thumbnails generated:", thumbnailContainer.children.length);
  }
  
  /**
   * 设置添加到购物车按钮
   * Setup add to cart button
   */
  function setupAddToCartButton(product) {
    const addToCartButton = document.getElementById("addToCart");
    if (!addToCartButton) return;
    
    addToCartButton.addEventListener("click", function () {
      if (DataService.addToCart(product, 1)) {
        UIHelpers.showToast(`Added ${product.name} to cart!`, 'success');
        UIHelpers.updateCartCount();
      } else {
        UIHelpers.showToast('Failed to add product to cart', 'danger');
      }
    });
  }
  
  /**
   * 显示产品评论
   * Display product reviews
   */
  function displayReviews(product) {
    const reviewsContainer = document.getElementById("product-reviews");
    if (!reviewsContainer) return;
    
    if (!product.reviews || product.reviews.length === 0) {
      reviewsContainer.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this product!</p>';
      return;
    }
    
    let reviewsHtml = '<h3 class="mt-4 mb-3">Customer Reviews</h3>';
    
    product.reviews.forEach(review => {
      // 创建星级评分HTML
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= review.rating) {
          starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
        } else {
          starsHtml += '<i class="bi bi-star text-warning"></i>';
        }
      }
      
      reviewsHtml += `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <h5 class="card-title">${review.name}</h5>
              <small class="text-muted">${review.date}</small>
            </div>
            <div class="mb-2">${starsHtml}</div>
            <p class="card-text">${review.comment}</p>
          </div>
        </div>
      `;
    });
    
    reviewsContainer.innerHTML = reviewsHtml;
  }
  
  /**
   * 处理产品未找到的情况
   * Handle product not found
   */
  function handleProductNotFound() {
    document.getElementById("product-title").textContent = "Product Not Found";
    document.getElementById("product-price").textContent = "";
    document.getElementById("product-description").textContent = "Sorry, this product does not exist or has been removed.";
    
    const addToCartButton = document.getElementById("addToCart");
    if (addToCartButton) {
      addToCartButton.disabled = true;
      addToCartButton.textContent = "Unavailable";
    }
    
    // 显示相关推荐产品
    const recommendedProducts = DataService.getNewArrivals(30).slice(0, 3);
    if (recommendedProducts.length > 0) {
      const recommendedContainer = document.getElementById("recommended-products");
      if (recommendedContainer) {
        UIHelpers.renderProductCards(recommendedProducts, "recommended-products", "You might like these instead");
      }
    }
  }
});
