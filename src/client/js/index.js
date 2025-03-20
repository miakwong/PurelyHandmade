document.addEventListener("DOMContentLoaded", async function () {
  // 获取导航栏元素（添加错误检查）
  const navbar = document.querySelector(".navbar");
  const ourStoryLink = document.getElementById("ourStoryLink");
  const customNavbar = document.querySelector(".custom-navbar");
  const featuredProductsContainer = document.getElementById("best-sellers-container");
  const newArrivalsContainer = document.getElementById("new-arrivals-container");

  // 从后端加载数据
  await loadDataFromBackend();

  // 只有当navbar存在时才添加滚动事件
  if (navbar) {
  // Change background color on scroll
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
  } else {
    console.warn("警告: 未找到导航栏元素 (.navbar)");
  }

  // 只有当customNavbar存在时才添加新的导航项
  if (customNavbar) {
  // Dynamically add a new nav item
  const newNavItem = document.createElement("li");
  newNavItem.classList.add("nav-item");

  const newLink = document.createElement("a");
  newLink.classList.add("nav-link");
  newLink.href = "#";
  newLink.textContent = "Contact Us";

  newNavItem.appendChild(newLink);
    customNavbar.appendChild(newNavItem);
  } else {
    console.warn("警告: 未找到自定义导航栏元素 (.custom-navbar)");
  }

  // Toggle Our Story section
  if (ourStoryLink) {
    ourStoryLink.addEventListener("click", function (event) {
      event.preventDefault();
      const sidebar = document.querySelector(".sidebar");
      const designerCarousel = document.querySelector(".designer-carousel");
      
      // 确保元素存在后再操作
      if (sidebar) sidebar.classList.add("d-none");
      if (designerCarousel) designerCarousel.classList.add("d-none");
      
      // 加载并显示打折商品
      loadOnSaleProducts();
    });
  }
  
  // 更新购物车数量
  updateCartCount();

  // 从后端加载并显示数据
  async function loadDataFromBackend() {
    try {
      // 显示加载状态
      showLoadingState();
      
      // 并行加载所有需要的数据
      await Promise.all([
        loadFeaturedProducts(),
        loadNewArrivals()
      ]);
      
      // 隐藏加载状态
      hideLoadingState();
    } catch (error) {
      console.error('加载数据出错:', error);
      showErrorMessage('无法从服务器加载数据，请刷新页面或稍后再试。');
    }
  }
  
  // 加载特色/畅销产品
  async function loadFeaturedProducts() {
    if (!featuredProductsContainer) return;
    
    try {
      const featuredProducts = await DataService.getFeaturedProducts();
      renderProductsToContainer(featuredProducts, featuredProductsContainer, null);
    } catch (error) {
      console.error('加载特色产品出错:', error);
    }
  }
  
  // 加载新到货产品
  async function loadNewArrivals() {
    if (!newArrivalsContainer) return;
    
    try {
      const newArrivals = await DataService.getNewArrivals(30); // 过去30天内的新品
      renderProductsToContainer(newArrivals, newArrivalsContainer, null);
    } catch (error) {
      console.error('加载新到货产品出错:', error);
    }
  }
  
  // 加载打折商品
  async function loadOnSaleProducts() {
    // 尝试找到或创建打折商品容器
    let onSaleContainer = document.getElementById("on-sale-container");
    
    if (!onSaleContainer) {
      // 创建一个新的区域来展示打折商品
      const mainContent = document.querySelector("main") || document.body;
      const onSaleSection = document.createElement("section");
      onSaleSection.className = "container my-5";
      onSaleSection.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>限时折扣</h2>
          <a href="/src/client/views/on-sale.html" class="btn btn-link">查看全部</a>
        </div>
        <div class="row" id="on-sale-container"></div>
      `;
      
      // 插入到主内容区域中的适当位置
      const referenceElement = document.querySelector(".subscribe-section");
      if (referenceElement) {
        mainContent.insertBefore(onSaleSection, referenceElement);
      } else {
        mainContent.appendChild(onSaleSection);
      }
      
      onSaleContainer = document.getElementById("on-sale-container");
    }
    
    try {
      const onSaleProducts = await DataService.getOnSaleProducts();
      renderProductsToContainer(onSaleProducts, onSaleContainer, null);
    } catch (error) {
      console.error('加载打折商品出错:', error);
    }
  }
  
  // 将产品渲染到指定容器
  function renderProductsToContainer(products, container, title) {
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加标题如果提供了
    if (title) {
      const titleElement = document.createElement('h2');
      titleElement.className = 'section-title text-center mb-4';
      titleElement.textContent = title;
      container.appendChild(titleElement);
    }
    
    // 没有产品时显示消息
    if (products.length === 0) {
      const noProductsCol = document.createElement('div');
      noProductsCol.className = 'col-12 text-center';
      noProductsCol.innerHTML = '<p class="text-muted">暂无产品</p>';
      container.appendChild(noProductsCol);
      return;
    }
    
    // 渲染每个产品
    products.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-md-3 mb-4';
      
      // 产品卡片HTML
      col.innerHTML = `
        <div class="card product-card h-100">
          ${product.onSale ? '<span class="product-badge">促销</span>' : ''}
          ${product.featured ? '<span class="product-badge bg-primary">特色</span>' : ''}
          <div class="product-img-wrapper">
            <img src="${product.image || '/src/client/img/product-placeholder.jpg'}" class="product-img" alt="${product.name}">
          </div>
          <div class="product-card-body">
            <h5 class="product-title">${product.name}</h5>
            <div class="product-price-wrapper">
              <span class="product-price">¥${product.price.toFixed(2)}</span>
              ${product.onSale ? `<span class="product-price-discount">¥${(product.price * 1.2).toFixed(2)}</span>` : ''}
            </div>
            <p class="product-desc">${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '暂无描述'}</p>
            <button class="btn add-to-cart-btn" data-product-id="${product.id}">
              <i class="bi bi-cart-plus me-2"></i>加入购物车
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(col);
    });
    
    // 为所有加入购物车按钮添加事件
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const productId = this.getAttribute('data-product-id');
        try {
          await DataService.addToCart(productId, 1);
          showToast('已添加到购物车！');
          
          // 更新购物车图标数量
          if (typeof DataService.updateCartCount === 'function') {
            DataService.updateCartCount();
          } else if (typeof updateCartCount === 'function') {
            updateCartCount();
          }
        } catch (error) {
          console.error('添加到购物车出错:', error);
          showToast('添加到购物车失败，请稍后再试', 'danger');
        }
      });
    });
  }
  
  // 显示加载状态
  function showLoadingState() {
    // 在每个产品容器中添加加载状态
    [featuredProductsContainer, newArrivalsContainer].forEach(container => {
      if (!container) return;
      
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3">正在加载产品数据...</p>
        </div>
      `;
    });
  }
  
  // 隐藏加载状态
  function hideLoadingState() {
    // 加载完成后，容器内容会被替换，所以这里不需要特别处理
  }
  
  // 显示错误消息
  function showErrorMessage(message) {
    [featuredProductsContainer, newArrivalsContainer].forEach(container => {
      if (!container) return;
      
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
        </div>
      `;
    });
  }
  
  // 更新购物车数量显示
  function updateCartCount() {
    try {
      const cartItems = DataService.getCart();
      const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        if (cartCount > 0) {
          element.textContent = cartCount;
          element.style.display = 'inline-block';
        } else {
          element.style.display = 'none';
        }
      });
    } catch (error) {
      console.error('更新购物车数量时出错:', error);
    }
  }
  
  // 显示通知消息
  function showToast(message, type = 'success') {
    // 检查UI辅助函数是否可用
    if (typeof UIHelpers !== 'undefined' && typeof UIHelpers.showToast === 'function') {
      UIHelpers.showToast(message, type);
      return;
    }
    
    // 后备实现：创建一个简单的toast
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // 如果Bootstrap可用，使用它的Toast
    if (typeof bootstrap !== 'undefined') {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    } else {
      // 简单的显示/隐藏
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }
  
  // 创建Toast容器
  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
  }
  
  // 暴露全局函数
  window.updateCartCount = updateCartCount;
});
