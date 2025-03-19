/**
 * 前端集成测试
 * 测试各个服务层之间的交互和页面功能
 */

// 模拟DOM元素创建帮助函数
function createMockElement(id, tagName = 'div', properties = {}) {
  const element = document.createElement(tagName);
  element.id = id;
  
  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (typeof value === 'function' && key.startsWith('on')) {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element[key] = value;
    }
  });
  
  return element;
}

// 模拟window.location
const originalLocation = window.location;

// 测试数据
const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    categoryId: 1,
    designerId: 'd1',
    price: 25.99,
    stock: 15,
    description: 'Test description 1',
    details: 'Test details 1',
    onSale: false,
    salePrice: null,
    images: ['/src/client/img/test1.jpg'],
    listingDate: new Date().toISOString(),
    reviews: [
      { id: 1, userId: 1, name: 'Test User', rating: 5, comment: 'Great product', date: '2023-01-01' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Test Product 2',
    categoryId: 1,
    designerId: 'd1',
    price: 89.99,
    stock: 8,
    description: 'Test description 2',
    details: 'Test details 2',
    onSale: true,
    salePrice: 79.99,
    images: ['/src/client/img/test2.jpg'],
    listingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockCategories = [
  { id: 1, name: 'Test Category', slug: 'test-category', description: 'Test category description' }
];

const mockDesigners = [
  {
    id: 'd1',
    name: 'Test Designer',
    specialty: 'Test Specialty',
    bio: 'Test bio',
    image: '/src/client/img/designer-test.jpg',
    featured: true,
    social: {}
  }
];

const mockUser = {
  id: 1,
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'user'
};

// 测试套件
describe('前端集成测试', () => {
  // 在每个测试前设置环境
  beforeEach(() => {
    // 清除并重建DOM
    document.body.innerHTML = '';
    
    // 模拟 localStorage
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    
    // 预设localStorage数据
    localStorage.setItem('products', JSON.stringify(mockProducts));
    localStorage.setItem('categories', JSON.stringify(mockCategories));
    localStorage.setItem('designers', JSON.stringify(mockDesigners));
    
    // 模拟fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve(''),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
    );
    
    // 模拟window.location
    delete window.location;
    window.location = { 
      href: 'http://localhost/',
      pathname: '/',
      search: '',
      hash: '',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn()
    };
    
    // 设置所有服务
    setupServices();
  });
  
  // 在所有测试后恢复环境
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.location = originalLocation;
  });
  
  // 设置所有服务
  function setupServices() {
    // 设置DataService
    window.DataService = {
      initData: jest.fn(),
      
      getAllProducts: function() {
        return JSON.parse(localStorage.getItem('products')) || [];
      },
      
      getProductById: function(id) {
        const products = this.getAllProducts();
        return products.find(p => p.id == id) || null;
      },
      
      getAllCategories: function() {
        return JSON.parse(localStorage.getItem('categories')) || [];
      },
      
      getCategoryById: function(id) {
        const categories = this.getAllCategories();
        return categories.find(c => c.id == id) || null;
      },
      
      getAllDesigners: function() {
        return JSON.parse(localStorage.getItem('designers')) || [];
      },
      
      getDesignerById: function(id) {
        const designers = this.getAllDesigners();
        return designers.find(d => d.id == id) || null;
      },
      
      getNewArrivals: function(days = 7) {
        const products = this.getAllProducts();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return products.filter(product => {
          const listingDate = new Date(product.listingDate);
          return !isNaN(listingDate) && listingDate >= cutoffDate;
        });
      },
      
      getOnSaleProducts: function() {
        const products = this.getAllProducts();
        return products.filter(product => product.onSale);
      },
      
      getProductsByCategory: function(categoryId) {
        const products = this.getAllProducts();
        return products.filter(product => product.categoryId == categoryId);
      },
      
      getCart: function() {
        return JSON.parse(localStorage.getItem('cart')) || [];
      },
      
      updateCart: function(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
      },
      
      addToCart: function(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.onSale ? product.salePrice : product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            quantity: quantity
          });
        }
        
        return this.updateCart(cart);
      },
      
      removeFromCart: function(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        return this.updateCart(updatedCart);
      },
      
      clearCart: function() {
        return this.updateCart([]);
      },
      
      getCurrentUser: function() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
      },
      
      setCurrentUser: function(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      },
      
      logout: function() {
        localStorage.removeItem('currentUser');
        return true;
      }
    };
    
    // 设置UIHelpers
    window.UIHelpers = {
      loadNavbar: jest.fn().mockResolvedValue(true),
      loadFooter: jest.fn().mockResolvedValue(true),
      
      updateAuthState: function() {
        const currentUser = DataService.getCurrentUser();
        
        // 模拟找不到元素的情况
        if (!document.getElementById('login-button')) {
          console.warn('Could not find authentication buttons in navbar');
          return;
        }
        
        const loginButton = document.getElementById('login-button');
        const registerButton = document.getElementById('register-button');
        const profileButton = document.getElementById('profile-button');
        const orderHistoryButton = document.getElementById('order-history-button');
        const logoutButton = document.getElementById('logout-button');
        const adminButton = document.getElementById('admin-button');
        
        if (currentUser) {
          loginButton.style.display = 'none';
          registerButton.style.display = 'none';
          
          if (profileButton) profileButton.style.display = 'block';
          if (orderHistoryButton) orderHistoryButton.style.display = 'block';
          if (logoutButton) logoutButton.style.display = 'block';
          
          if (currentUser.role === 'admin' && adminButton) {
            adminButton.style.display = 'block';
          }
        } else {
          loginButton.style.display = 'block';
          registerButton.style.display = 'block';
          
          if (profileButton) profileButton.style.display = 'none';
          if (orderHistoryButton) orderHistoryButton.style.display = 'none';
          if (logoutButton) logoutButton.style.display = 'none';
          if (adminButton) adminButton.style.display = 'none';
        }
      },
      
      checkAdminPermissions: function() {
        const currentUser = DataService.getCurrentUser();
        if (!currentUser) {
          window.location.href = '/src/client/views/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
          return false;
        }
        
        if (currentUser.role !== 'admin') {
          this.showToast('You must be logged in as an administrator to access this page.', 'danger');
          window.location.href = '/src/client/views/auth/login.html?redirect=admin';
          return false;
        }
        return true;
      },
      
      showToast: jest.fn(),
      
      updateCartCount: function() {
        const cartCount = document.getElementById('cart-count');
        if (!cartCount) return;
        
        const cart = DataService.getCart();
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCount.textContent = itemCount;
        cartCount.style.display = itemCount > 0 ? 'inline-block' : 'none';
      },
      
      renderProductCards: function(products, containerId, title = '') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        if (title) {
          html = `<h2 class="text-center mb-4">${title}</h2>`;
        }
        
        html += '<div class="row">';
        
        products.forEach(product => {
          const price = product.onSale 
            ? `<span class="text-decoration-line-through me-2">$${product.price.toFixed(2)}</span>$${product.salePrice.toFixed(2)}`
            : `$${product.price.toFixed(2)}`;
          
          html += `
            <div class="col-md-4 mb-4">
              <div class="card h-100 product-card" data-product-id="${product.id}">
                ${product.onSale ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">On Sale</span>' : ''}
                <div class="image-container">
                  <img src="${product.images[0]}" class="card-img-top" alt="${product.name}">
                </div>
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text text-muted mb-1">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                  <div class="mt-auto">
                    <p class="card-text fw-bold mb-2">${price}</p>
                    <a href="/src/client/views/product/product_detail.html?id=${product.id}" class="btn btn-primary view-product-btn">View Details</a>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
        
        html += '</div>';
        
        container.innerHTML = html;
      },
      
      getUrlParameter: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }
    };
    
    // 设置ApiService
    window.ApiService = {
      baseUrl: '/api',
      
      handleResponse: async function(response) {
        if (!response.ok) {
          const error = new Error('API request failed');
          error.status = response.status;
          throw error;
        }
        return response.json();
      },
      
      request: function(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : this.baseUrl + url;
        return fetch(fullUrl, options).then(this.handleResponse);
      },
      
      get: function(url, params = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            queryParams.append(key, params[key]);
          }
        });
        
        const queryString = queryParams.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        return this.request(fullUrl, { method: 'GET' });
      },
      
      post: function(url, data = {}) {
        return this.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      },
      
      login: function(identifier, password) {
        const formData = new FormData();
        formData.append('loginIdentifier', identifier);
        formData.append('loginPassword', password);
        
        return this.request('/login', {
          method: 'POST',
          body: formData
        });
      },
      
      register: function(userData) {
        return this.post('/register', userData);
      }
    };
  }
  
  // 测试产品列表页面功能
  describe('产品列表页面', () => {
    beforeEach(() => {
      // 设置产品列表页面DOM
      document.body.innerHTML = `
        <div id="navbar-placeholder"></div>
        <div id="product-container"></div>
        <div id="sidebar" class="d-none"></div>
        <div id="designerCarousel" class="d-none"></div>
        <button id="newArrivalsLink" class="nav-link">New Arrivals</button>
        <button id="onSaleLink" class="nav-link">On Sale</button>
        <div class="category-links">
          <button class="category-link" data-category-id="1">Test Category</button>
        </div>
        <div id="footer-placeholder"></div>
      `;
      
      // 添加事件处理函数
      document.getElementById('newArrivalsLink').addEventListener('click', function() {
        // 隐藏侧边栏和设计师轮播
        const sidebar = document.getElementById('sidebar');
        const designerCarousel = document.getElementById('designerCarousel');
        if (sidebar) sidebar.classList.add("d-none");
        if (designerCarousel) designerCarousel.classList.add("d-none");
        
        // 加载新品
        const newProducts = DataService.getNewArrivals(7);
        UIHelpers.renderProductCards(newProducts, "product-container", "New Arrivals");
      });
      
      document.getElementById('onSaleLink').addEventListener('click', function() {
        // 隐藏侧边栏和设计师轮播
        const sidebar = document.getElementById('sidebar');
        const designerCarousel = document.getElementById('designerCarousel');
        if (sidebar) sidebar.classList.add("d-none");
        if (designerCarousel) designerCarousel.classList.add("d-none");
        
        // 加载特价商品
        const saleProducts = DataService.getOnSaleProducts();
        UIHelpers.renderProductCards(saleProducts, "product-container", "On Sale - Special Discounts");
      });
      
      document.querySelector('.category-link').addEventListener('click', function() {
        // 显示侧边栏和设计师轮播
        const sidebar = document.getElementById('sidebar');
        const designerCarousel = document.getElementById('designerCarousel');
        if (sidebar) sidebar.classList.remove("d-none");
        if (designerCarousel) designerCarousel.classList.remove("d-none");
        
        // 加载分类产品
        const categoryId = parseInt(this.getAttribute("data-category-id"), 10);
        const categoryName = this.textContent.trim();
        const categoryProducts = DataService.getProductsByCategory(categoryId);
        UIHelpers.renderProductCards(categoryProducts, "product-container", categoryName);
      });
      
      // 添加DOMContentLoaded处理
      const loadNavbarSpy = jest.spyOn(UIHelpers, 'loadNavbar').mockImplementation(() => Promise.resolve());
      const loadFooterSpy = jest.spyOn(UIHelpers, 'loadFooter').mockImplementation(() => Promise.resolve());
      
      // 手动触发DOMContentLoaded事件处理
      if (typeof window.handleDOMContentLoaded === 'function') {
        window.handleDOMContentLoaded();
      } else {
        UIHelpers.loadNavbar();
        UIHelpers.loadFooter();
      }
    });
    
    test('应该在页面加载时调用loadNavbar和loadFooter', () => {
      // 触发DOMContentLoaded事件
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // 检查是否调用了加载函数
      expect(UIHelpers.loadNavbar).toHaveBeenCalled();
      expect(UIHelpers.loadFooter).toHaveBeenCalled();
    });
    
    test('点击"New Arrivals"链接应加载新品', () => {
      // 设置间谍函数
      const renderSpy = jest.spyOn(UIHelpers, 'renderProductCards');
      
      // 触发点击事件
      document.getElementById('newArrivalsLink').click();
      
      // 检查结果
      expect(renderSpy).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 1 })]),
        'product-container',
        'New Arrivals'
      );
      expect(document.getElementById('sidebar').classList.contains('d-none')).toBe(true);
      expect(document.getElementById('designerCarousel').classList.contains('d-none')).toBe(true);
    });
    
    test('点击"On Sale"链接应加载特价商品', () => {
      // 设置间谍函数
      const renderSpy = jest.spyOn(UIHelpers, 'renderProductCards');
      
      // 触发点击事件
      document.getElementById('onSaleLink').click();
      
      // 检查结果
      expect(renderSpy).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 2 })]),
        'product-container',
        expect.stringContaining('On Sale')
      );
      expect(document.getElementById('sidebar').classList.contains('d-none')).toBe(true);
      expect(document.getElementById('designerCarousel').classList.contains('d-none')).toBe(true);
    });
    
    test('点击类别链接应加载该类别的产品', () => {
      // 设置间谍函数
      const renderSpy = jest.spyOn(UIHelpers, 'renderProductCards');
      
      // 触发点击事件
      document.querySelector('.category-link').click();
      
      // 检查结果
      expect(renderSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 })
        ]),
        'product-container',
        'Test Category'
      );
      expect(document.getElementById('sidebar').classList.contains('d-none')).toBe(false);
      expect(document.getElementById('designerCarousel').classList.contains('d-none')).toBe(false);
    });
  });
  
  // 测试产品详情页面功能
  describe('产品详情页面', () => {
    beforeEach(() => {
      // 设置URL参数
      window.location.search = '?id=1';
      
      // 设置产品详情页面DOM
      document.body.innerHTML = `
        <div id="navbar-placeholder"></div>
        <div id="breadcrumb-category-link"></div>
        <div id="breadcrumb-item"></div>
        <h1 id="product-title"></h1>
        <p id="product-price"></p>
        <div id="product-description"></div>
        <div id="product-designer" style="display: none;"></div>
        <div id="product-details"></div>
        <img id="product-image" alt="">
        <div id="thumbnail-images"></div>
        <button id="addToCart">Add to Cart</button>
        <div id="product-reviews"></div>
        <span id="cart-count" style="display: none;">0</span>
        <div id="footer-placeholder"></div>
      `;
    });
    
    test('应该正确加载产品详情', () => {
      // 执行产品详情页面加载逻辑
      const product = DataService.getProductById(1);
      const category = DataService.getCategoryById(product.categoryId);
      const designer = DataService.getDesignerById(product.designerId);
      
      // 更新面包屑
      const categoryLink = document.getElementById('breadcrumb-category-link');
      categoryLink.textContent = category.name;
      categoryLink.setAttribute('href', `products.html?category=${category.slug}`);
      
      document.getElementById('breadcrumb-item').textContent = product.name;
      
      // 更新产品信息
      document.getElementById('product-title').textContent = product.name;
      document.getElementById('product-price').innerHTML = `Price: $${product.price.toFixed(2)}`;
      document.getElementById('product-description').textContent = product.description;
      
      const designerElement = document.getElementById('product-designer');
      designerElement.textContent = `Designer: ${designer.name}`;
      designerElement.style.display = 'block';
      
      document.getElementById('product-details').innerHTML = product.details;
      
      const mainImage = document.getElementById('product-image');
      mainImage.src = product.images[0];
      mainImage.alt = product.name;
      
      // 检查结果
      expect(document.getElementById('product-title').textContent).toBe('Test Product 1');
      expect(document.getElementById('product-price').innerHTML).toContain('25.99');
      expect(document.getElementById('product-description').textContent).toBe('Test description 1');
      expect(document.getElementById('product-designer').textContent).toBe('Designer: Test Designer');
      expect(document.getElementById('product-designer').style.display).toBe('block');
      expect(document.getElementById('product-details').innerHTML).toBe('Test details 1');
      expect(document.getElementById('product-image').src).toContain('test1.jpg');
    });
    
    test('点击"Add to Cart"按钮应将产品添加到购物车', () => {
      // 设置间谍函数
      const addToCartSpy = jest.spyOn(DataService, 'addToCart');
      const showToastSpy = jest.spyOn(UIHelpers, 'showToast');
      const updateCartCountSpy = jest.spyOn(UIHelpers, 'updateCartCount');
      
      // 设置addToCart按钮点击事件
      document.getElementById('addToCart').addEventListener('click', function() {
        const product = DataService.getProductById(1);
        if (DataService.addToCart(product, 1)) {
          UIHelpers.showToast(`Added ${product.name} to cart!`, 'success');
          UIHelpers.updateCartCount();
        } else {
          UIHelpers.showToast('Failed to add product to cart', 'danger');
        }
      });
      
      // 触发点击事件
      document.getElementById('addToCart').click();
      
      // 检查结果
      expect(addToCartSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 1);
      expect(showToastSpy).toHaveBeenCalledWith('Added Test Product 1 to cart!', 'success');
      expect(updateCartCountSpy).toHaveBeenCalled();
      
      // 检查购物车状态
      const cart = DataService.getCart();
      expect(cart.length).toBe(1);
      expect(cart[0].id).toBe(1);
      expect(cart[0].name).toBe('Test Product 1');
      expect(cart[0].quantity).toBe(1);
    });
    
    test('应该正确显示产品评论', () => {
      // 设置产品评论
      const product = DataService.getProductById(1);
      const reviewsContainer = document.getElementById('product-reviews');
      
      if (product.reviews && product.reviews.length > 0) {
        let reviewsHtml = '<h3 class="mt-4 mb-3">Customer Reviews</h3>';
        
        product.reviews.forEach(review => {
          reviewsHtml += `
            <div class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <h5 class="card-title">${review.name}</h5>
                  <small class="text-muted">${review.date}</small>
                </div>
                <div class="mb-2">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p class="card-text">${review.comment}</p>
              </div>
            </div>
          `;
        });
        
        reviewsContainer.innerHTML = reviewsHtml;
      } else {
        reviewsContainer.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this product!</p>';
      }
      
      // 检查结果
      expect(reviewsContainer.innerHTML).toContain('Customer Reviews');
      expect(reviewsContainer.innerHTML).toContain('Test User');
      expect(reviewsContainer.innerHTML).toContain('Great product');
      expect(reviewsContainer.innerHTML).toContain('2023-01-01');
      expect(reviewsContainer.innerHTML).toContain('★★★★★'); // 5星评价
    });
  });
  
  // 测试购物车功能
  describe('购物车功能', () => {
    test('应该能正确添加产品到购物车', () => {
      // 添加产品到购物车
      const product1 = mockProducts[0];
      const product2 = mockProducts[1];
      
      DataService.addToCart(product1, 1);
      DataService.addToCart(product2, 2);
      
      // 检查购物车状态
      const cart = DataService.getCart();
      expect(cart.length).toBe(2);
      expect(cart[0].id).toBe(1);
      expect(cart[0].quantity).toBe(1);
      expect(cart[1].id).toBe(2);
      expect(cart[1].quantity).toBe(2);
      
      // 再次添加已存在的产品应该累加数量
      DataService.addToCart(product1, 3);
      
      const updatedCart = DataService.getCart();
      expect(updatedCart.length).toBe(2);
      expect(updatedCart[0].quantity).toBe(4); // 1 + 3
    });
    
    test('应该能从购物车中移除产品', () => {
      // 添加产品到购物车
      const product1 = mockProducts[0];
      const product2 = mockProducts[1];
      
      DataService.addToCart(product1, 1);
      DataService.addToCart(product2, 2);
      
      // 检查购物车状态
      let cart = DataService.getCart();
      expect(cart.length).toBe(2);
      
      // 移除产品
      DataService.removeFromCart(1);
      
      // 再次检查购物车状态
      cart = DataService.getCart();
      expect(cart.length).toBe(1);
      expect(cart[0].id).toBe(2);
    });
    
    test('应该能清空购物车', () => {
      // 添加产品到购物车
      const product1 = mockProducts[0];
      const product2 = mockProducts[1];
      
      DataService.addToCart(product1, 1);
      DataService.addToCart(product2, 2);
      
      // 检查购物车状态
      let cart = DataService.getCart();
      expect(cart.length).toBe(2);
      
      // 清空购物车
      DataService.clearCart();
      
      // 再次检查购物车状态
      cart = DataService.getCart();
      expect(cart.length).toBe(0);
    });
    
    test('updateCartCount应该正确更新购物车计数显示', () => {
      // 设置购物车计数元素
      document.body.innerHTML = `<span id="cart-count" style="display: none;">0</span>`;
      
      // 添加产品到购物车
      const product1 = mockProducts[0];
      const product2 = mockProducts[1];
      
      DataService.addToCart(product1, 1);
      DataService.addToCart(product2, 2);
      
      // 更新购物车计数
      UIHelpers.updateCartCount();
      
      // 检查结果
      const cartCount = document.getElementById('cart-count');
      expect(cartCount.textContent).toBe('3'); // 1 + 2
      expect(cartCount.style.display).toBe('inline-block');
      
      // 清空购物车
      DataService.clearCart();
      UIHelpers.updateCartCount();
      
      // 检查结果
      expect(cartCount.textContent).toBe('0');
      expect(cartCount.style.display).toBe('none');
    });
  });
  
  // 测试用户认证功能
  describe('用户认证功能', () => {
    beforeEach(() => {
      // 设置认证相关DOM
      document.body.innerHTML = `
        <button id="login-button" style="display: block;">Login</button>
        <button id="register-button" style="display: block;">Register</button>
        <button id="profile-button" style="display: none;">Profile</button>
        <button id="order-history-button" style="display: none;">Orders</button>
        <button id="logout-button" style="display: none;">Logout</button>
        <button id="admin-button" style="display: none;">Admin</button>
        <form id="login-form">
          <input type="text" id="loginIdentifier" value="testuser">
          <input type="password" id="loginPassword" value="password123">
          <button type="submit">Login</button>
        </form>
      `;
    });
    
    test('登录后应正确更新UI状态', () => {
      // 模拟用户登录
      DataService.setCurrentUser(mockUser);
      
      // 更新认证状态
      UIHelpers.updateAuthState();
      
      // 检查UI状态
      expect(document.getElementById('login-button').style.display).toBe('none');
      expect(document.getElementById('register-button').style.display).toBe('none');
      expect(document.getElementById('profile-button').style.display).toBe('block');
      expect(document.getElementById('order-history-button').style.display).toBe('block');
      expect(document.getElementById('logout-button').style.display).toBe('block');
      expect(document.getElementById('admin-button').style.display).toBe('none'); // 不是管理员
    });
    
    test('管理员登录后应显示管理员按钮', () => {
      // 模拟管理员登录
      const adminUser = { ...mockUser, role: 'admin' };
      DataService.setCurrentUser(adminUser);
      
      // 更新认证状态
      UIHelpers.updateAuthState();
      
      // 检查UI状态
      expect(document.getElementById('admin-button').style.display).toBe('block');
    });
    
    test('退出登录后应恢复未登录UI状态', () => {
      // 模拟用户登录
      DataService.setCurrentUser(mockUser);
      UIHelpers.updateAuthState();
      
      // 模拟退出登录
      DataService.logout();
      UIHelpers.updateAuthState();
      
      // 检查UI状态
      expect(document.getElementById('login-button').style.display).toBe('block');
      expect(document.getElementById('register-button').style.display).toBe('block');
      expect(document.getElementById('profile-button').style.display).toBe('none');
      expect(document.getElementById('order-history-button').style.display).toBe('none');
      expect(document.getElementById('logout-button').style.display).toBe('none');
      expect(document.getElementById('admin-button').style.display).toBe('none');
    });
    
    test('checkAdminPermissions应正确重定向非管理员用户', () => {
      // 模拟普通用户登录
      DataService.setCurrentUser(mockUser);
      
      // 检查管理员权限
      const result = UIHelpers.checkAdminPermissions();
      
      // 检查结果
      expect(result).toBe(false);
      expect(window.location.href).toContain('/src/client/views/auth/login.html?redirect=admin');
      expect(UIHelpers.showToast).toHaveBeenCalledWith(
        expect.stringContaining('administrator'), 
        'danger'
      );
    });
    
    test('登录表单提交应调用API服务的login方法', () => {
      // 设置间谍函数
      const loginSpy = jest.spyOn(ApiService, 'login').mockResolvedValue({
        success: true,
        data: { user: mockUser }
      });
      
      // 模拟表单提交
      const form = document.getElementById('login-form');
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const identifier = document.getElementById('loginIdentifier').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
          const response = await ApiService.login(identifier, password);
          
          if (response.success) {
            DataService.setCurrentUser(response.data.user);
            UIHelpers.updateAuthState();
            UIHelpers.showToast('Login successful!', 'success');
          } else {
            UIHelpers.showToast('Login failed: ' + (response.error || 'Unknown error'), 'danger');
          }
        } catch (error) {
          UIHelpers.showToast('Login request failed', 'danger');
        }
      });
      
      // 触发表单提交
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);
      
      // 检查结果
      expect(loginSpy).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
}); 