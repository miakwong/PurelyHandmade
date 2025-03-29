// 页面变量
let products = [];
let categories = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let activeCategoryId = null;
let filterCriteria = {
  categories: [],
  priceMin: null,
  priceMax: null,
  rating: 0,
  onSale: false
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
  console.log("=== DOM Content Loaded - 开始初始化页面 ===");
  console.log("页面URL:", window.location.href);
  console.log("页面参数:", new URLSearchParams(window.location.search).toString());

  // 确保数据服务已加载
  if (typeof DataService === 'undefined') {
    console.error('错误: DataService未定义 - 请检查脚本加载顺序');
    showError('DataService不可用，请刷新页面或检查控制台错误。');
    return;
  }

  // 检查DOM元素状态
  console.log("DOM检查 - 类别筛选容器:", document.getElementById('category-filters') ? '存在' : '不存在');
  console.log("DOM检查 - 产品容器:", document.getElementById('products-container') ? '存在' : '不存在');
  console.log("DOM检查 - 分页容器:", document.getElementById('pagination') ? '存在' : '不存在');

  // 初始化筛选器折叠功能
  try {
    initializeFilterAccordion();
    console.log("筛选器折叠功能初始化完成");
  } catch (error) {
    console.error("初始化筛选器折叠功能错误:", error);
  }

  // 设置全局错误处理
  window.onerror = function (message, source, lineno, colno, error) {
    console.error("全局错误:", message, "at", source, lineno, colno);
    return false;
  };

  // 确保数据初始化函数存在并运行
  if (typeof window.initializeData === 'function') {
    try {
      window.initializeData();
      console.log("数据初始化完成");
    } catch (error) {
      console.error("数据初始化错误:", error);
    }
  }

  // 添加常用事件监听
  try {
    addCommonEventListeners();
    console.log("常用事件监听器添加完成");
  } catch (error) {
    console.error("添加事件监听器错误:", error);
  }

  // 加载分类，然后加载产品
  console.log("开始加载类别和产品数据");
  loadCategories()
    .then(() => {
      console.log("类别加载成功，现在加载产品");
      return loadProducts();
    })
    .catch(error => {
      console.error('页面初始化错误:', error);
      showError('页面初始化失败，请刷新后重试。');
    });
});

// 初始化筛选器折叠功能
function initializeFilterAccordion() {
  document.querySelectorAll('.filter-group-title').forEach(function (title) {
    title.addEventListener('click', function () {
      const content = this.nextElementSibling;
      const icon = this.querySelector('i');
      const isCategoryFilter = content.id === 'category-filters';

      if (content.classList.contains('show')) {
        // 收起内容
        content.classList.remove('show');
        icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
        
        // 特殊处理分类选择器
        if (isCategoryFilter) {
          content.style.maxHeight = '0px';
        }
      } else {
        // 展开内容
        content.classList.add('show');
        icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
        
        // 特殊处理分类选择器
        if (isCategoryFilter) {
          // 根据当前分类数量调整高度
          if (categories && categories.length > 0) {
            adjustCategoryHeight(categories.length);
          } else {
            // 若没有分类数据，设置一个默认高度
            content.style.maxHeight = '150px';
          }
        }
      }
    });
  });
  
  // 初始化时确保Categories展开（因为默认是展开的）
  const categoryFilters = document.getElementById('category-filters');
  if (categoryFilters && categoryFilters.classList.contains('show') && categories) {
    adjustCategoryHeight(categories.length);
  }
}

// 显示错误消息
function showError(message) {
  const container = document.getElementById('products-container');
  if (container) {
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-danger" role="alert">
          ${message}
        </div>
      </div>
    `;
  }
}

// 加载分类
async function loadCategories() {
  console.log("=== loadCategories() - 开始加载分类 ===");
  try {
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (!categoryFiltersContainer) {
      console.error('分类筛选器容器未找到');
      createDefaultCategoryFilter();
      return;
    }

    categoryFiltersContainer.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>';

    // 使用API获取分类
    const categoryResponse = await DataService.getAllCategories();
    console.log('API分类数据响应:', categoryResponse);

    if (categoryResponse.success) {
      categories = categoryResponse.data.categories || [];
      console.log(`成功获取${categories.length}个分类`);

      // 清空现有内容并添加"全部"选项
      categoryFiltersContainer.innerHTML = '';
      addAllCategoriesCheckbox(categoryFiltersContainer);

      // 添加分类选项
      if (categories.length > 0) {
        categories.forEach(function (category) {
          const categoryHtml = `
            <div class="form-check">
              <input class="form-check-input category-filter" type="checkbox" value="${category.id}" id="category-${category.id}">
              <label class="form-check-label" for="category-${category.id}">
                ${category.name}
              </label>
            </div>
          `;
          categoryFiltersContainer.innerHTML += categoryHtml;
        });

        // 添加分类点击事件
        addCategoryEventListeners();
        
        // 根据分类数量调整高度
        adjustCategoryHeight(categories.length);
      } else {
        categoryFiltersContainer.innerHTML += '<p class="text-muted small mt-2">No categories available at the moment</p>';
      }

      // 检查URL参数
      handleCategoryUrlParameters();
      addRatingEventListeners();
      addSaleFilterEventListener();
      checkUrlParameters();
    } else {
      const errorMessage = categoryResponse.message || 'Unknown error';
      console.error('API category request failed:', errorMessage);
      categoryFiltersContainer.innerHTML = `
        <div class="alert alert-warning small py-2">
          <i class="bi bi-exclamation-triangle me-2"></i>Failed to load categories
          <button class="btn btn-sm btn-outline-secondary ms-2" onclick="loadCategories()">Retry</button>
        </div>
      `;
      createDefaultCategoryFilter();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    const categoryFiltersContainer = document.getElementById('category-filters');
    if (categoryFiltersContainer) {
      categoryFiltersContainer.innerHTML = `
        <div class="alert alert-warning small py-2">
          <i class="bi bi-exclamation-triangle me-2"></i>Error loading categories: ${error.message || 'Unknown error'}
          <button class="btn btn-sm btn-outline-secondary ms-2" onclick="loadCategories()">Retry</button>
        </div>
      `;
    }
    createDefaultCategoryFilter();
    categories = [];
  }
}

// 根据分类数量调整分类区域高度
function adjustCategoryHeight(categoriesCount) {
  const categoryFiltersContainer = document.getElementById('category-filters');
  if (!categoryFiltersContainer) return;
  
  // 基础高度包括"All Categories"选项
  const baseHeight = 40; // "All Categories"的高度
  const categoryItemHeight = 32; // 每个分类选项的大致高度
  const padding = 20; // 上下内边距
  
  // 计算高度 - 基础高度加上分类数量乘以单个分类高度
  const calculatedHeight = baseHeight + (categoriesCount * categoryItemHeight) + padding;
  
  // 设置最小和最大高度
  const minHeight = 100;
  const maxHeight = 400;
  
  // 应用计算后的高度，但在合理范围内
  const finalHeight = Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  
  console.log(`调整分类区域高度: ${categoriesCount}个分类, 计算高度${calculatedHeight}px, 最终高度${finalHeight}px`);
  
  // 应用样式
  categoryFiltersContainer.style.maxHeight = `${finalHeight}px`;
}

// 创建默认的分类筛选器
function createDefaultCategoryFilter() {
  const categoryFiltersContainer = document.getElementById('category-filters');
  if (categoryFiltersContainer) {
    categoryFiltersContainer.innerHTML = '';
    addAllCategoriesCheckbox(categoryFiltersContainer);
  }
}

// 添加"全部"分类选项
function addAllCategoriesCheckbox(container) {
  container.innerHTML += `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="all" id="category-all" checked>
      <label class="form-check-label" for="category-all">
        All Categories
      </label>
    </div>
  `;

  const allCategoriesCheckbox = document.getElementById('category-all');
  if (allCategoriesCheckbox) {
    allCategoriesCheckbox.addEventListener('change', function () {
      if (this.checked) {
        document.querySelectorAll('.category-filter').forEach(function (checkbox) {
          checkbox.checked = false;
        });
      }
      applyFiltersAndSort();
    });
  }
}

// 添加分类筛选事件监听
function addCategoryEventListeners() {
  document.querySelectorAll('.category-filter').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      const allCategoriesCheckbox = document.getElementById('category-all');
      if (this.checked && allCategoriesCheckbox) {
        allCategoriesCheckbox.checked = false;
      }

      if (document.querySelectorAll('.category-filter:checked').length === 0 && allCategoriesCheckbox) {
        allCategoriesCheckbox.checked = true;
      }

      applyFiltersAndSort();
    });
  });
}

// 处理URL参数中的分类
function handleCategoryUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('id');
  const searchQuery = urlParams.get('q');

  // 如果是搜索查询，不处理分类ID
  if (searchQuery) {
    return;
  }

  // 只有在有分类ID时才处理
  if (categoryId) {
    activeCategoryId = parseInt(categoryId);

    const allCategoriesCheckbox = document.getElementById('category-all');
    if (allCategoriesCheckbox) {
      allCategoriesCheckbox.checked = false;
    }

    const categoryCheckbox = document.getElementById(`category-${categoryId}`);
    if (categoryCheckbox) {
      categoryCheckbox.checked = true;
    }

    const category = categories.find(c => c.id === parseInt(categoryId));
    if (category) {
      const breadcrumbCategory = document.getElementById('breadcrumb-category');
      const productListTitle = document.getElementById('product-list-title');

      if (breadcrumbCategory) {
        breadcrumbCategory.textContent = category.name;
      }

      if (productListTitle) {
        productListTitle.textContent = category.name;
      }
    }
  }
}

// 添加评分筛选事件监听
function addRatingEventListeners() {
  document.querySelectorAll('input[name="rating-filter"]').forEach(function (radio) {
    radio.addEventListener('change', applyFiltersAndSort);
  });
}

// 添加特惠筛选事件监听
function addSaleFilterEventListener() {
  const filterSaleEl = document.getElementById('filter-sale');
  if (filterSaleEl) {
    filterSaleEl.addEventListener('change', applyFiltersAndSort);
  }
}

// 加载产品
async function loadProducts() {
  console.log("=== loadProducts() - 开始加载产品 ===");
  try {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
      console.error('产品容器未找到');
      return;
    }

    productsContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading products...</span>
        </div>
        <p class="mt-2">Loading products...</p>
      </div>
    `;

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    let productsResponse;
    if (searchQuery) {
      console.log("检测到搜索查询参数:", searchQuery);
      updateSearchUI(searchQuery);
      productsResponse = await DataService.searchProducts(searchQuery);
    } else {
      productsResponse = await DataService.getAllProducts();
    }

    console.log('API产品数据响应:', productsResponse);

    if (productsResponse.success) {
      products = productsResponse.data.products || [];
      console.log(`成功获取${products.length}个产品`);

      setTimeout(() => {
        if (document.getElementById('category-all')) {
          applyFiltersAndSort();
        } else {
          renderAllProducts();
        }
      }, 100);
    } else {
      console.error("获取产品失败:", productsResponse.message);
      productsContainer.innerHTML = '<div class="col-12 text-center py-4"><p>Unable to load products.</p></div>';
    }
  } catch (error) {
    console.error('加载产品错误:', error);
    document.getElementById('products-container').innerHTML = '<div class="col-12 text-center py-4"><p>Error loading products.</p></div>';
    throw error;
  }
}

// 更新搜索UI
function updateSearchUI(searchQuery) {
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const productListTitle = document.getElementById('product-list-title');

  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = `Search Results: "${searchQuery}"`;
  }

  if (productListTitle) {
    productListTitle.textContent = `Search Results: "${searchQuery}"`;
  }
}

// 显示所有产品（无筛选）
function renderAllProducts() {
  filteredProducts = [...products];
  console.log(`显示全部${filteredProducts.length}个产品`);

  updateProductCount();
  renderPagination();
  renderProducts();
}

// 更新产品计数
function updateProductCount() {
  const productCountEl = document.getElementById('product-count');
  if (productCountEl) {
    productCountEl.textContent = `Showing ${filteredProducts.length} products`;
  }
}

// 应用筛选和排序
function applyFiltersAndSort() {
  const categoryAllCheckbox = document.getElementById('category-all');
  if (!categoryAllCheckbox) {
    console.warn('未找到"全部"分类复选框 - 显示全部产品，不进行筛选');
    renderAllProducts();
    return;
  }

  // 获取筛选条件
  const selectedCategories = getSelectedCategories(categoryAllCheckbox);
  const { minPrice, maxPrice } = getPriceFilters();
  const ratingFilter = getRatingFilter();
  const onSaleFilter = getSaleFilter();

  // 应用筛选
  filteredProducts = products.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
      return false;
    }

    if (minPrice !== null && product.price < minPrice) {
      return false;
    }
    if (maxPrice !== null && product.price > maxPrice) {
      return false;
    }

    if (ratingFilter > 0 && (!product.rating || product.rating < ratingFilter)) {
      return false;
    }

    if (onSaleFilter && !product.onSale) {
      return false;
    }

    return true;
  });

  // 应用排序
  applySorting();

  // 更新UI
  updateProductCount();
  renderPagination();
  renderProducts();
}

// 获取选中的分类
function getSelectedCategories(categoryAllCheckbox) {
  if (categoryAllCheckbox.checked) {
    return [];
  }

  const selectedCategories = [];
  document.querySelectorAll('.category-filter:checked').forEach(function (checkbox) {
    selectedCategories.push(parseInt(checkbox.value));
  });

  return selectedCategories;
}

// 获取价格筛选条件
function getPriceFilters() {
  const priceMinEl = document.getElementById('price-min');
  const priceMaxEl = document.getElementById('price-max');
  return {
    minPrice: priceMinEl && priceMinEl.value ? parseFloat(priceMinEl.value) : null,
    maxPrice: priceMaxEl && priceMaxEl.value ? parseFloat(priceMaxEl.value) : null
  };
}

// 获取评分筛选条件
function getRatingFilter() {
  const ratingFilterEl = document.querySelector('input[name="rating-filter"]:checked');
  return ratingFilterEl ? parseInt(ratingFilterEl.value) : 0;
}

// 获取特惠筛选条件
function getSaleFilter() {
  const filterSaleEl = document.getElementById('filter-sale');
  return filterSaleEl ? filterSaleEl.checked : false;
}

// 应用排序
function applySorting() {
  const sortSelect = document.getElementById('sort-select');
  const sortOption = sortSelect ? sortSelect.value : 'featured';

  switch (sortOption) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    default:
      filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }
}

// 渲染分页
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) {
    console.error('分页容器未找到');
    return;
  }

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  console.log(`分页信息: 共${filteredProducts.length}个产品，每页${productsPerPage}个，共${totalPages}页，当前第${currentPage}页`);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = 1;
  }

  paginationContainer.innerHTML = '';

  if (totalPages <= 1) {
    return;
  }

  // 上一页按钮
  const prevDisabled = currentPage === 1;
  paginationContainer.innerHTML += `
    <li class="page-item ${prevDisabled ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  // 页码
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // 下一页按钮
  const nextDisabled = currentPage === totalPages;
  paginationContainer.innerHTML += `
    <li class="page-item ${nextDisabled ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;

  // 添加页码点击事件
  addPaginationEventListeners(totalPages);
}

// 添加分页事件监听
function addPaginationEventListeners(totalPages) {
  document.querySelectorAll('.page-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProducts();
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
          productsContainer.scrollIntoView();
        }
      }
    });
  });
}

// 渲染产品
function renderProducts() {
  const productsContainer = document.getElementById('products-container');
  if (!productsContainer) {
    console.error('产品容器未找到');
    return;
  }

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  if (paginatedProducts.length === 0) {
    productsContainer.innerHTML = '<div class="col-12 text-center py-4"><p>No products match your filters. Please try different criteria.</p></div>';
    return;
  }

  productsContainer.innerHTML = '';
  paginatedProducts.forEach(product => {
    const productHtml = createProductCard(product);
    productsContainer.innerHTML += productHtml;
  });

  // 添加购物车事件监听
  addCartEventListeners();
}

// 创建产品卡片HTML
function createProductCard(product) {
  const imgSrc = product.image || (product.gallery ? JSON.parse(product.gallery)[0] : null) || `${CONFIG.BASE_URL}/assets/placeholder.jpg`;
  const priceHtml = createPriceHtml(product);
  const starsHtml = createStarsHtml(product.rating);

  return `
    <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
      <div class="product-card">
        <div class="product-img-wrapper">
          <a href="${CONFIG.getViewPath('products/product_detail.html')}?id=${product.id}">
            <img src="${imgSrc}" class="product-img" alt="${product.name}">
            ${product.onSale ? '<div class="product-badge">Sale</div>' : ''}
          </a>
        </div>
        <div class="product-card-body">
          <a href="${CONFIG.getViewPath('products/product_detail.html')}?id=${product.id}">
            <h2 class="product-title">${product.name}</h2>
          </a>
          ${priceHtml}
          ${starsHtml}
          <p class="product-desc">${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            <i class="bi bi-cart-plus me-2"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// 创建价格HTML
function createPriceHtml(product) {
  if (product.onSale && product.salePrice) {
    return `
      <div class="product-price-wrapper">
        <span class="product-price">$${product.salePrice.toFixed(2)}</span>
        <span class="product-price-discount">$${product.price.toFixed(2)}</span>
      </div>
    `;
  }
  return `<div class="product-price-wrapper"><span class="product-price">$${product.price.toFixed(2)}</span></div>`;
}

// 创建星级HTML
function createStarsHtml(rating) {
  const stars = Array(5).fill().map((_, i) => 
    `<i class="bi ${i < (rating || 0) ? 'bi-star-fill' : 'bi-star'}"></i>`
  ).join('');
  return `<div class="product-rating">${stars}</div>`;
}

// 添加购物车事件监听
function addCartEventListeners() {
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product-id');
      addToCart(productId, 1);
    });
  });
}

// 重置筛选
function resetFilters() {
  const categoryAllCheckbox = document.getElementById('category-all');
  if (categoryAllCheckbox) {
    categoryAllCheckbox.checked = true;
  }

  document.querySelectorAll('.category-filter').forEach(function (checkbox) {
    checkbox.checked = false;
  });

  // 重置价格筛选
  const priceMinInput = document.getElementById('price-min');
  const priceMaxInput = document.getElementById('price-max');
  if (priceMinInput) priceMinInput.value = '';
  if (priceMaxInput) priceMaxInput.value = '';

  // 重置评分筛选
  const ratingAllRadio = document.getElementById('rating-all');
  if (ratingAllRadio) ratingAllRadio.checked = true;

  // 重置特惠筛选
  const filterSaleCheckbox = document.getElementById('filter-sale');
  if (filterSaleCheckbox) filterSaleCheckbox.checked = false;

  // 重置排序
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  // 应用筛选和排序
  applyFiltersAndSort();
}

// 添加到购物车
async function addToCart(productId, quantity) {
  const product = products.find(p => p.id == productId);

  if (!product) {
    showToast('Product not found!', 'error');
    return;
  }

  // 检查用户是否登录
  const currentUser = DataService.getCurrentUser();
  if (!currentUser) {
    showToast('Please login to add items to cart', 'error');
    setTimeout(() => {
      window.location.href = `${CONFIG.getViewPath('auth/login.html')}?returnUrl=${encodeURIComponent(window.location.href)}`;
    }, 1500);
    return;
  }

  showLoading('Adding to cart...');

  try {
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
    hideLoading();

    if (result.success) {
      showToast(`${product.name || 'Product'} added to your cart!`, 'success');
      if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
      }
    } else {
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
  let overlay = document.getElementById('loading-overlay');
  if (overlay) {
    const messageEl = overlay.querySelector('.loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
    return;
  }

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

  overlay.appendChild(spinner);
  overlay.appendChild(messageEl);
  document.body.appendChild(overlay);

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
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// 显示Toast通知
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found');
    return;
  }

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div class="modern-toast ${type}" id="${toastId}">
      <div class="modern-toast-icon">
        <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'}"></i>
      </div>
      <div class="modern-toast-content">${message}</div>
      <button class="modern-toast-close" onclick="document.getElementById('${toastId}').remove()">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;

  toastContainer.innerHTML += toastHtml;

  setTimeout(() => {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('fadeout');
      setTimeout(() => toast.remove(), 500);
    }
  }, 3000);
}

// 检查URL参数
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');

  if (searchQuery) {
    updateSearchUI(searchQuery);
  }
}

// 添加事件监听器
function addCommonEventListeners() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFiltersAndSort);
  }

  const productsPerPageSelect = document.getElementById('products-per-page');
  if (productsPerPageSelect) {
    productsPerPageSelect.addEventListener('change', function () {
      productsPerPage = parseInt(this.value);
      currentPage = 1;
      applyFiltersAndSort();
    });
  }

  const applyPriceFilterBtn = document.getElementById('apply-price-filter');
  if (applyPriceFilterBtn) {
    applyPriceFilterBtn.addEventListener('click', applyFiltersAndSort);
  }

  const resetFiltersBtn = document.getElementById('reset-filters');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
}