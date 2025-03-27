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
      } else {
        console.log("DataService已加载:", typeof DataService, Object.keys(DataService));
      }

      // 检查DOM元素状态
      console.log("DOM检查 - 类别筛选容器:", document.getElementById('category-filters') ? '存在' : '不存在');
      console.log("DOM检查 - 产品容器:", document.getElementById('products-container') ? '存在' : '不存在');
      console.log("DOM检查 - 分页容器:", document.getElementById('pagination') ? '存在' : '不存在');

      // 初始化筛选器折叠功能 - 放在更前面执行
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
      } else {
        console.warn("initializeData函数未找到");
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

          // 切换内容显示状态
          if (content.classList.contains('show')) {
            content.classList.remove('show');
            icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
          } else {
            content.classList.add('show');
            icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
          }
        });
      });
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
          // 创建默认的筛选器以避免错误
          createDefaultCategoryFilter();
          return;
        }

        categoryFiltersContainer.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>';

        // 使用API获取分类
        let categoryResponse;
        try {
          console.log("Sending API request to get category data...");
          // 尝试使用fetch直接请求API - 用作备份机制
          if (typeof DataService === 'undefined' || !DataService.getAllCategories) {
            console.warn("DataService is undefined or not available, trying to use fetch directly as a backup mechanism");
            const response = await fetch('/api/categories');
            categoryResponse = await response.json();
          } else {
            categoryResponse = await DataService.getAllCategories();
          }

          // 确保响应格式一致性，避免undefined错误
          if (!categoryResponse) {
            throw new Error("API returned empty response");
          }

          console.log('API分类数据响应:', categoryResponse);
        } catch (apiError) {
          console.error('Error getting category data from API:', apiError.message || apiError);
          // API错误仍需确保UI正常 - 创建一个格式正确的失败响应
          categoryResponse = {
            success: false,
            message: apiError.message || 'Error getting category data',
            data: { categories: [] }
          };
        }

        // 检查响应格式并规范化
        if (!categoryResponse.hasOwnProperty('success')) {
          console.warn('API response format is not consistent, attempting to normalize');
          // 如果响应没有success字段，尝试重新格式化它
          if (categoryResponse.data || categoryResponse.categories) {
            // 如果有data.categories或直接有categories字段，认为成功
            categoryResponse = {
              success: true,
              message: "Successfully got categories",
              data: {
                categories: categoryResponse.data?.categories || categoryResponse.categories || []
              }
            };
          } else {
            // 无法识别的格式，创建失败响应
            categoryResponse = {
              success: false,
              message: "Incorrect response format",
              data: { categories: [] }
            };
          }
        }

        // 确保至少有全部分类选项
        if (categoryResponse.success) {
          let categoriesData = [];

          // 确保categories数据存在且格式正确
          if (categoryResponse.data && Array.isArray(categoryResponse.data.categories)) {
            categoriesData = categoryResponse.data.categories;
          } else if (categoryResponse.data && typeof categoryResponse.data === 'object') {
            // 尝试从其他可能的位置获取categories
            categoriesData = Object.values(categoryResponse.data);
          } else if (Array.isArray(categoryResponse.categories)) {
            categoriesData = categoryResponse.categories;
          }

          categories = categoriesData;
          console.log(`Successfully got ${categories.length} categories:`, categories);

          // 清空现有内容并添加"全部"选项
          categoryFiltersContainer.innerHTML = '';
          addAllCategoriesCheckbox(categoryFiltersContainer);
          console.log("'All' category option added");

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
            console.log(`已添加${categories.length}个分类选项`);

            // 添加分类点击事件
            addCategoryEventListeners();
            console.log("已添加分类筛选事件监听器");
          } else {
            console.warn('API returned empty categories');
            categoryFiltersContainer.innerHTML += '<p class="text-muted small mt-2">No categories available at the moment</p>';
          }

          // 检查URL参数中是否有categoryId
          handleCategoryUrlParameters();

          // 添加评分筛选的事件监听
          addRatingEventListeners();

          // 添加特惠筛选的事件监听
          addSaleFilterEventListener();

          // 检查其他URL参数
          checkUrlParameters();

          // 最终验证
          const allCategoryCheckbox = document.getElementById('category-all');
          console.log("Category load completed verification - 'All' category checkbox:", allCategoryCheckbox ? 'exists' : 'does not exist');
          if (allCategoryCheckbox) {
            console.log("All category checkbox status: checked=", allCategoryCheckbox.checked);
          }

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
        console.error('Error loading categories:', error.message || error);
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
        // 使用空数组继续，不抛出错误，确保其他功能可以继续
        categories = [];
      }
    }

    // 创建默认的分类筛选器（确保UI可用）
    function createDefaultCategoryFilter() {
      console.log("=== createDefaultCategoryFilter() - Creating default category filter ===");
      const categoryFiltersContainer = document.getElementById('category-filters');
      if (categoryFiltersContainer) {
        categoryFiltersContainer.innerHTML = '';
        addAllCategoriesCheckbox(categoryFiltersContainer);
        console.log("Default category filter created");
      } else {
        console.error("Category filter container not found, unable to create default filter");
      }
    }

    // 添加"全部"分类选项
    function addAllCategoriesCheckbox(container) {
      console.log("=== addAllCategoriesCheckbox() - Adding 'All' category option ===");
      container.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="all" id="category-all" checked>
        <label class="form-check-label" for="category-all">
          All Categories
        </label>
      </div>
    `;
      console.log("DOM after adding - 'All' category checkbox:", document.getElementById('category-all') ? 'exists' : 'does not exist');

      // 添加"全部"分类点击事件
      const allCategoriesCheckbox = document.getElementById('category-all');
      if (allCategoriesCheckbox) {
        allCategoriesCheckbox.addEventListener('change', function () {
          console.log("'All' category checkbox changed - new status:", this.checked);
          if (this.checked) {
            document.querySelectorAll('.category-filter').forEach(function (checkbox) {
              checkbox.checked = false;
            });
          }
          applyFiltersAndSort();
        });
        console.log("'All' category checkbox event listener added");
      } else {
        console.error("Unable to add 'All' category checkbox event listener - element does not exist");
      }
    }

    // 添加分类筛选事件监听
    function addCategoryEventListeners() {
      document.querySelectorAll('.category-filter').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
          // 当任何分类被选中时，取消选中"全部"
          const allCategoriesCheckbox = document.getElementById('category-all');
          if (this.checked && allCategoriesCheckbox) {
            allCategoriesCheckbox.checked = false;
          }

          // 如果没有分类被选中，则选中"全部"
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

      if (categoryId) {
        activeCategoryId = parseInt(categoryId);

        // 更新对应的复选框
        const allCategoriesCheckbox = document.getElementById('category-all');
        if (allCategoriesCheckbox) {
          allCategoriesCheckbox.checked = false;
        }

        const categoryCheckbox = document.getElementById(`category-${categoryId}`);
        if (categoryCheckbox) {
          categoryCheckbox.checked = true;
        }

        // 更新面包屑和标题
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

        // 检查URL中是否有搜索查询参数
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');

        let productsResponse;

        if (searchQuery) {
          console.log("检测到搜索查询参数:", searchQuery);
          // 更新标题以显示搜索结果
          const breadcrumbCategory = document.getElementById('breadcrumb-category');
          if (breadcrumbCategory) {
            breadcrumbCategory.textContent = `Search Results: "${searchQuery}"`;
          }

          const productListTitle = document.getElementById('product-list-title');
          if (productListTitle) {
            productListTitle.textContent = `Search Results: "${searchQuery}"`;
          }

          // 使用搜索API获取产品
          console.log("发送搜索API请求获取产品数据...");
          productsResponse = await DataService.searchProducts(searchQuery);
        } else {
          // 使用API获取全部产品
          console.log("发送API请求获取全部产品数据...");
          productsResponse = await DataService.getAllProducts();
        }

        console.log('API产品数据响应:', productsResponse);

        if (productsResponse.success) {
          // 处理不同的API响应格式
          if (productsResponse.data && Array.isArray(productsResponse.data)) {
            products = productsResponse.data;
          } else if (productsResponse.data && productsResponse.data.products && Array.isArray(productsResponse.data.products)) {
            products = productsResponse.data.products;
          } else if (productsResponse.products && Array.isArray(productsResponse.products)) {
            products = productsResponse.products;
          } else {
            products = [];
          }

          console.log(`成功获取${products.length}个产品`);

          // 应用筛选和排序 - 仅在有产品且UI已准备好的情况下执行
          setTimeout(() => {
            const categoryAllCheckbox = document.getElementById('category-all');
            console.log("筛选前检查 - 全部分类复选框:", categoryAllCheckbox ? '存在' : '不存在');

            if (document.getElementById('category-all')) {
              console.log("应用筛选和排序 - UI已准备好");
              applyFiltersAndSort();
            } else {
              console.log('等待筛选器准备好 - 先显示所有产品');
              // 产品已加载但筛选器尚未准备好，设置默认显示所有产品
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

    // 显示所有产品（无筛选）
    function renderAllProducts() {
      console.log("=== renderAllProducts() - 显示所有产品（无筛选） ===");
      filteredProducts = [...products];
      console.log(`显示全部${filteredProducts.length}个产品`);

      // 更新产品计数
      const productCountEl = document.getElementById('product-count');
      if (productCountEl) {
        productCountEl.textContent = `Showing ${filteredProducts.length} products`;
      }

      // 分页
      renderPagination();

      // 渲染产品
      renderProducts();
    }

    // 应用筛选和排序
    function applyFiltersAndSort() {
      console.log("=== applyFiltersAndSort() - 应用筛选和排序 ===");
      console.log("DOM查询 - 全部分类复选框:", document.getElementById('category-all') ? '存在' : '不存在');

      // 先检查UI元素是否已准备好
      const categoryAllCheckbox = document.getElementById('category-all');
      if (!categoryAllCheckbox) {
        console.warn('未找到"全部"分类复选框 - 显示全部产品，不进行筛选');
        renderAllProducts();
        return;
      }

      // 获取所有筛选条件
      // 分类筛选
      const selectedCategories = [];
      if (!categoryAllCheckbox.checked) {
        const checkedCategories = document.querySelectorAll('.category-filter:checked');
        console.log(`分类筛选 - "全部"未选中，找到${checkedCategories ? checkedCategories.length : 0}个选中的分类`);

        if (checkedCategories && checkedCategories.length > 0) {
          checkedCategories.forEach(function (checkbox) {
            selectedCategories.push(parseInt(checkbox.value));
          });
        }
      } else {
        console.log("分类筛选 - '全部'已选中，不筛选分类");
      }
      console.log("已选分类IDs:", selectedCategories);

      // 价格筛选
      const priceMinEl = document.getElementById('price-min');
      const priceMaxEl = document.getElementById('price-max');
      const minPrice = priceMinEl && priceMinEl.value ? parseFloat(priceMinEl.value) : null;
      const maxPrice = priceMaxEl && priceMaxEl.value ? parseFloat(priceMaxEl.value) : null;
      console.log("价格筛选:", { min: minPrice, max: maxPrice });

      // 评分筛选
      const ratingFilterEl = document.querySelector('input[name="rating-filter"]:checked');
      const ratingFilter = ratingFilterEl ? parseInt(ratingFilterEl.value) : 0;
      console.log("评分筛选:", ratingFilter, "星及以上");

      // 特惠筛选
      const filterSaleEl = document.getElementById('filter-sale');
      const onSaleFilter = filterSaleEl ? filterSaleEl.checked : false;
      console.log("特惠筛选:", onSaleFilter ? "仅显示特惠" : "显示全部");

      // 应用筛选
      console.log(`开始筛选 - 筛选前${products.length}个产品`);
      filteredProducts = products.filter(function (product) {
        // 分类筛选
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
          return false;
        }

        // 价格筛选
        if (minPrice !== null && product.price < minPrice) {
          return false;
        }
        if (maxPrice !== null && product.price > maxPrice) {
          return false;
        }

        // 评分筛选
        if (ratingFilter > 0 && (!product.rating || product.rating < ratingFilter)) {
          return false;
        }

        // 特惠筛选
        if (onSaleFilter && !product.onSale) {
          return false;
        }

        return true;
      });
      console.log(`筛选完成 - 筛选后${filteredProducts.length}个产品`);

      // 应用排序
      const sortSelect = document.getElementById('sort-select');
      const sortOption = sortSelect ? sortSelect.value : 'featured';
      console.log("应用排序:", sortOption);

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
        default: // 'featured'
          filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }
      console.log("排序完成");

      // 更新产品计数
      const productCountEl = document.getElementById('product-count');
      if (productCountEl) {
        productCountEl.textContent = `Showing ${filteredProducts.length} products`;
      }

      // 分页
      renderPagination();

      // 渲染产品
      renderProducts();
    }

    // 渲染分页
    function renderPagination() {
      console.log("=== renderPagination() - 渲染分页 ===");
      const paginationContainer = document.getElementById('pagination');
      if (!paginationContainer) {
        console.error('分页容器未找到');
        return;
      }

      const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      console.log(`分页信息: 共${filteredProducts.length}个产品，每页${productsPerPage}个，共${totalPages}页，当前第${currentPage}页`);

      if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
        console.log("当前页超出范围，重置为第1页");
      }

      paginationContainer.innerHTML = '';

      if (totalPages <= 1) {
        console.log("仅有1页或无数据，不显示分页");
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
      document.querySelectorAll('.page-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const page = parseInt(this.getAttribute('data-page'));
          if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderProducts();
            // 滚动到产品列表顶部
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
      console.log("=== renderProducts() - 渲染产品 ===");
      const productsContainer = document.getElementById('products-container');
      if (!productsContainer) {
        console.error('产品容器未找到');
        return;
      }

      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      console.log(`渲染产品: 当前页${currentPage}，显示索引${startIndex}到${endIndex - 1}，共${paginatedProducts.length}个产品`);

      if (paginatedProducts.length === 0) {
        console.log("没有匹配筛选条件的产品");
        productsContainer.innerHTML = '<div class="col-12 text-center py-4"><p>No products match your filters. Please try different criteria.</p></div>';
        return;
      }

      productsContainer.innerHTML = '';
      console.log(`开始渲染${paginatedProducts.length}个产品到DOM`);

      paginatedProducts.forEach(function (product) {
        // 准备产品图片
        const imgSrc = product.image || (product.gallery ? JSON.parse(product.gallery)[0] : null) || '/~xzy2020c/PurelyHandmade/assets/placeholder.jpg';

        // 准备价格显示
        let priceHtml;
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

        // 准备评分显示
        const rating = product.rating || 0;
        const starsHtml = `<div class="product-rating">
        ${Array(5).fill().map((_, i) =>
          `<i class="bi ${i < rating ? 'bi-star-fill' : 'bi-star'}"></i>`
        ).join('')}
      </div>`;

        // 创建产品卡片
        const productHtml = `
        <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
          <div class="product-card">
            <div class="product-img-wrapper">
              <a href="/~xzy2020c/PurelyHandmade/views/products/product_detail.html?id=${product.id}">
                <img src="${imgSrc}" class="product-img" alt="${product.name}">
                ${product.onSale ? '<div class="product-badge">Sale</div>' : ''}
              </a>
            </div>
            <div class="product-card-body">
              <a href="/~xzy2020c/PurelyHandmade/views/products/product_detail.html?id=${product.id}">
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

        productsContainer.innerHTML += productHtml;
      });

      // 给"添加到购物车"按钮添加事件
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
        // 用户未登录，提示登录
        showToast('Please login to add items to cart', 'error');
        setTimeout(() => {
          window.location.href = '/src/client/views/auth/login.html?returnUrl=' + encodeURIComponent(window.location.href);
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
            productId: productId,
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

      // 自动消失
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

      // 检查是否有搜索查询
      const searchQuery = urlParams.get('q');
      if (searchQuery) {
        // 实现搜索功能
        // ...

        // 更新面包屑和标题
        const breadcrumbCategory = document.getElementById('breadcrumb-category');
        const productListTitle = document.getElementById('product-list-title');

        if (breadcrumbCategory) {
          breadcrumbCategory.textContent = `Search Results: "${searchQuery}"`;
        }

        if (productListTitle) {
          productListTitle.textContent = `Search Results: "${searchQuery}"`;
        }
      }
    }

    // 添加事件监听器
    function addCommonEventListeners() {
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', applyFiltersAndSort);
      } else {
        console.warn("Sort select element not found");
      }

      const productsPerPageSelect = document.getElementById('products-per-page');
      if (productsPerPageSelect) {
        productsPerPageSelect.addEventListener('change', function () {
          productsPerPage = parseInt(this.value);
          currentPage = 1;
          applyFiltersAndSort();
        });
      } else {
        console.warn("Products per page select not found");
      }

      const applyPriceFilterBtn = document.getElementById('apply-price-filter');
      if (applyPriceFilterBtn) {
        applyPriceFilterBtn.addEventListener('click', applyFiltersAndSort);
      } else {
        console.warn("Apply price filter button not found");
      }

      const resetFiltersBtn = document.getElementById('reset-filters');
      if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
      } else {
        console.warn("Reset filters button not found");
      }
    }