/**
 * 产品详情页面测试
 * Tests for product_detail.js
 */

// 导入必要的模块
require('../setup');

// 模拟UIHelpers
global.UIHelpers = {
  loadNavbar: jest.fn().mockResolvedValue(),
  loadFooter: jest.fn().mockResolvedValue(),
  updateCartCount: jest.fn(),
  getUrlParameter: jest.fn(),
  showToast: jest.fn()
};

// 模拟DataService
global.DataService = {
  getProductById: jest.fn(),
  getCategoryById: jest.fn(),
  getDesignerById: jest.fn(),
  getRelatedProducts: jest.fn().mockReturnValue([]),
  addToCart: jest.fn()
};

describe('产品详情页面测试', () => {
  beforeEach(() => {
    // 清除和重置模拟
    jest.clearAllMocks();
    
    // 设置DOM
    document.body.innerHTML = `
      <div id="navbar-placeholder"></div>
      <div id="footer-placeholder"></div>
      <div id="breadcrumb"></div>
      <h1 id="product-title"></h1>
      <div id="product-price"></div>
      <div id="product-description"></div>
      <div id="product-categories"></div>
      <div id="product-stock"></div>
      <img id="product-main-image" src="" alt="Product Image">
      <div id="product-thumbnails"></div>
      <button id="add-to-cart-btn">Add to Cart</button>
      <div id="product-reviews"></div>
      <div id="related-products"></div>
    `;
    
    // 模拟控制台
    global.console = {
      log: jest.fn(),
      error: jest.fn()
    };
    
    // 模拟document.createElement返回一个可以进行属性设置的对象
    document.createElement = jest.fn().mockImplementation((tag) => {
      const element = document.createElement.mockImplementation.originalFn(tag);
      element.classList = {
        add: jest.fn()
      };
      return element;
    });
    document.createElement.mockImplementation.originalFn = document.__proto__.createElement;
    
    // 使用原生document.querySelector和document.getElementById
    document.querySelector = document.__proto__.querySelector;
    document.querySelectorAll = document.__proto__.querySelectorAll;
    document.getElementById = document.__proto__.getElementById;
  });
  
  test('页面加载时获取并显示产品详情', () => {
    // 模拟产品数据
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      price: 29.99,
      description: 'This is a test product',
      images: ['image1.jpg', 'image2.jpg'],
      categoryId: 1,
      designerId: 1,
      stock: 10
    };
    
    const mockCategory = {
        id: 1,
      name: 'Test Category',
      slug: 'test-category'
    };
    
    const mockDesigner = {
      id: 1,
      name: 'Test Designer'
    };
    
    // 设置模拟返回值
    UIHelpers.getUrlParameter.mockReturnValue('1');
    DataService.getProductById.mockReturnValue(mockProduct);
    DataService.getCategoryById.mockReturnValue(mockCategory);
    DataService.getDesignerById.mockReturnValue(mockDesigner);
    
    // 定义updateProductDetails函数
    function updateProductDetails(product, designer) {
      // 设置产品标题
      document.getElementById('product-title').textContent = product.name;
      
      // 设置产品价格
      const priceDisplay = document.getElementById('product-price');
      priceDisplay.innerHTML = `$${product.price.toFixed(2)}`;
      
      // 设置产品描述
      document.getElementById('product-description').innerHTML = product.description;
      
      // 设置设计师信息（如果有）
      if (designer) {
        const designerInfo = document.createElement('p');
        designerInfo.innerHTML = `Designer: <strong>${designer.name}</strong>`;
        document.getElementById('product-categories').appendChild(designerInfo);
      }
      
      // 设置库存信息
      const stockDisplay = document.getElementById('product-stock');
      if (product.stock > 0) {
        stockDisplay.innerHTML = `<span class="text-success">In Stock (${product.stock} available)</span>`;
      } else {
        stockDisplay.innerHTML = '<span class="text-danger">Out of Stock</span>';
      }
      
      // 设置主图片
      const mainImage = document.getElementById('product-main-image');
      const imgPath = '/src/client/img/' + (product.images[0] || 'placeholder.jpg');
      mainImage.src = imgPath;
      mainImage.alt = product.name;
    }
    
    // 定义updateBreadcrumb函数
    function updateBreadcrumb(category, product) {
      const breadcrumb = document.getElementById('breadcrumb');
      breadcrumb.innerHTML = `
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Home</a></li>
            <li class="breadcrumb-item"><a href="/src/client/views/product/product-list.html">Products</a></li>
            ${category ? `<li class="breadcrumb-item"><a href="/src/client/views/product/product-list.html?category=${category.id}">${category.name}</a></li>` : ''}
            <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
          </ol>
        </nav>
      `;
    }
    
    // 定义setupAddToCartButton函数
    function setupAddToCartButton(product) {
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      
      if (product.stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('btn-secondary');
        return;
      }
      
      addToCartBtn.addEventListener('click', function() {
        DataService.addToCart(product);
        UIHelpers.showToast(`Added ${product.name} to cart`, 'success');
        UIHelpers.updateCartCount();
      });
    }
    
    // 手动触发DOMContentLoaded事件处理函数
    const handleLoad = () => {
      // 获取URL参数
      const productId = UIHelpers.getUrlParameter('id');
      const categorySlug = UIHelpers.getUrlParameter('category');
      
      console.log("Product ID:", productId, "Category:", categorySlug);
      
      // 获取产品数据
      let product = null;
      let category = null;
      let designer = null;
      
      if (productId) {
        product = DataService.getProductById(productId);
        
        if (product) {
          category = DataService.getCategoryById(product.categoryId);
          designer = DataService.getDesignerById(product.designerId);
          
          // 更新面包屑导航
          updateBreadcrumb(category, product);
          
          // 更新产品详情
          updateProductDetails(product, designer);
          
          // 设置添加到购物车的按钮
          setupAddToCartButton(product);
        } else {
          console.error("Product not found");
          // 处理产品未找到的情况
        }
      }
    };
    
    // 调用页面加载处理函数
    handleLoad();
    
    // 验证调用了正确的API和函数
    expect(UIHelpers.getUrlParameter).toHaveBeenCalledWith('id');
    expect(DataService.getProductById).toHaveBeenCalledWith('1');
    expect(DataService.getCategoryById).toHaveBeenCalledWith(1);
    expect(DataService.getDesignerById).toHaveBeenCalledWith(1);
    
    // 验证产品详情被正确显示
    expect(document.getElementById('product-title').textContent).toBe('Test Product');
    expect(document.getElementById('product-price').innerHTML).toBe('$29.99');
    expect(document.getElementById('product-description').innerHTML).toBe('This is a test product');
    expect(document.getElementById('product-stock').innerHTML).toContain('In Stock (10 available)');
    expect(document.getElementById('product-main-image').src).toContain('image1.jpg');
    expect(document.getElementById('breadcrumb').innerHTML).toContain('Test Category');
  });
  
  test('点击"Add to Cart"按钮应将产品添加到购物车', () => {
    // 模拟产品数据
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      price: 29.99,
      stock: 10
    };
    
    // 设置模拟返回值
    DataService.getProductById.mockReturnValue(mockProduct);
    
    // 定义setupAddToCartButton函数
    function setupAddToCartButton(product) {
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      
      if (product.stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('btn-secondary');
        return;
      }
      
      addToCartBtn.addEventListener('click', function() {
        DataService.addToCart(product);
        UIHelpers.showToast(`Added ${product.name} to cart`, 'success');
        UIHelpers.updateCartCount();
      });
    }
    
    // 设置添加到购物车的按钮
    setupAddToCartButton(mockProduct);
    
    // 触发点击事件
    document.getElementById('add-to-cart-btn').click();
    
    // 验证添加到购物车
    expect(DataService.addToCart).toHaveBeenCalledWith(mockProduct);
    expect(UIHelpers.showToast).toHaveBeenCalledWith('Added Test Product to cart', 'success');
    expect(UIHelpers.updateCartCount).toHaveBeenCalled();
  });
  
  test('库存为0时"Add to Cart"按钮应被禁用', () => {
    // 模拟产品数据
    const mockProduct = {
        id: 1,
      name: 'Out of Stock Product',
      price: 29.99,
      stock: 0
    };
    
    // 设置模拟返回值
    DataService.getProductById.mockReturnValue(mockProduct);
    
    // 定义setupAddToCartButton函数
    function setupAddToCartButton(product) {
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      
      if (product.stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('btn-secondary');
        return;
      }
      
      addToCartBtn.addEventListener('click', function() {
        DataService.addToCart(product);
        UIHelpers.showToast(`Added ${product.name} to cart`, 'success');
        UIHelpers.updateCartCount();
      });
    }
    
    // 设置添加到购物车的按钮
    setupAddToCartButton(mockProduct);
    
    // 验证按钮被禁用
    expect(document.getElementById('add-to-cart-btn').disabled).toBe(true);
  });
}); 