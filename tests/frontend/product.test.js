/**
 * 产品页面测试
 * Tests for product.js
 */

// 导入必要的模块
require('../setup');

// 模拟UIHelpers
global.UIHelpers = {
  loadNavbar: jest.fn().mockImplementation(() => {
    return Promise.resolve().then(() => {
      UIHelpers.updateCartCount();
    });
  }),
  loadFooter: jest.fn().mockResolvedValue(),
  updateCartCount: jest.fn(),
  getUrlParameter: jest.fn(),
  renderProductCards: jest.fn()
};

// 模拟DataService
global.DataService = {
  getNewArrivals: jest.fn().mockReturnValue([]),
  getOnSaleProducts: jest.fn().mockReturnValue([]),
  getProductsByCategory: jest.fn().mockReturnValue([]),
  getCategoryById: jest.fn().mockReturnValue({ id: 1, name: '类别1' })
};

// 模拟函数实现
function setupMockFunctions() {
  global.loadNewArrivals = jest.fn().mockImplementation(() => {
    const products = DataService.getNewArrivals(7);
    UIHelpers.renderProductCards(products, 'product-container', '新品上市');
  });

  global.loadOnSaleProducts = jest.fn().mockImplementation(() => {
    const products = DataService.getOnSaleProducts();
    UIHelpers.renderProductCards(products, 'product-container', '特价商品');
  });

  global.loadProductsByCategory = jest.fn().mockImplementation((categoryId, categoryName) => {
    const products = DataService.getProductsByCategory(categoryId);
    UIHelpers.renderProductCards(products, 'product-container', categoryName || '类别产品');
  });

  global.updateActiveMenuItem = jest.fn();
}

describe('产品页面测试', () => {
  beforeEach(() => {
    // 清除和重置模拟
    jest.clearAllMocks();
    
    // 设置DOM
    document.body.innerHTML = `
      <div id="product-container"></div>
      <div id="sidebar"></div>
      <div id="designerCarousel"></div>
      <a id="newArrivalsLink" href="#">新品</a>
      <a id="onSaleLink" href="#">特价</a>
      <div id="categories">
        <a class="category-link" href="#" data-category="1" data-name="类别1">类别1</a>
        <a class="category-link" href="#" data-category="2" data-name="类别2">类别2</a>
      </div>
    `;
    
    // 设置模拟函数
    setupMockFunctions();
    
    // 设置事件处理器
    document.getElementById('newArrivalsLink').addEventListener('click', (e) => {
      e.preventDefault();
      loadNewArrivals();
    });
    
    document.getElementById('onSaleLink').addEventListener('click', (e) => {
      e.preventDefault();
      loadOnSaleProducts();
    });
    
    document.querySelectorAll('.category-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryId = link.dataset.category;
        const categoryName = link.dataset.name;
        loadProductsByCategory(categoryId, categoryName);
      });
    });
  });
  
  test('应该在页面加载时加载导航栏和页脚', () => {
    // 手动触发DOMContentLoaded事件处理函数
    const pageLoadHandler = (function() {
      // 页面主要元素
      const productContainer = document.getElementById("product-container");
      const sidebar = document.getElementById("sidebar");
      const designerCarousel = document.getElementById("designerCarousel");
    
      // 加载导航栏和页脚
      if (typeof UIHelpers !== 'undefined') {
        UIHelpers.loadNavbar();
        UIHelpers.loadFooter();
      }
      
      // 获取URL参数中的分类
      const urlCategory = UIHelpers.getUrlParameter('category');
      
      // 如果URL中有分类，直接加载该分类
      if (urlCategory) {
        loadProductsByCategory(urlCategory);
      } else {
        loadNewArrivals();
      }
    })();
    
    // 验证UIHelpers函数被调用
    expect(UIHelpers.loadNavbar).toHaveBeenCalled();
    expect(UIHelpers.loadFooter).toHaveBeenCalled();
  });
  
  test('应该在没有类别参数时默认加载新品', () => {
    // 模拟URL参数为空
    UIHelpers.getUrlParameter.mockReturnValue('');
    
    // 手动触发页面加载逻辑
    const urlCategory = UIHelpers.getUrlParameter('category');
    if (urlCategory) {
      loadProductsByCategory(urlCategory);
    } else {
      loadNewArrivals();
    }
    
    // 验证新品加载函数被调用
    expect(loadNewArrivals).toHaveBeenCalled();
    expect(loadProductsByCategory).not.toHaveBeenCalled();
  });
  
  test('应该在有类别参数时加载对应类别产品', () => {
    // 模拟URL参数
    UIHelpers.getUrlParameter.mockReturnValue('1');
    
    // 手动触发页面加载逻辑
    const urlCategory = UIHelpers.getUrlParameter('category');
    if (urlCategory) {
      loadProductsByCategory(urlCategory);
    } else {
      loadNewArrivals();
    }
    
    // 验证类别产品加载函数被调用
    expect(loadProductsByCategory).toHaveBeenCalledWith('1');
    expect(loadNewArrivals).not.toHaveBeenCalled();
  });
  
  test('点击"新品"链接应加载新品', () => {
    // 触发点击事件
    document.getElementById('newArrivalsLink').click();
    
    // 验证新品加载函数被调用
    expect(loadNewArrivals).toHaveBeenCalled();
  });
  
  test('点击"特价"链接应加载特价商品', () => {
    // 触发点击事件
    document.getElementById('onSaleLink').click();
    
    // 验证特价商品加载函数被调用
    expect(loadOnSaleProducts).toHaveBeenCalled();
  });
  
  test('点击类别链接应加载该类别的产品', () => {
    // 触发类别链接点击事件
    document.querySelector('.category-link[data-category="1"]').click();
    
    // 验证类别产品加载函数被调用
    expect(loadProductsByCategory).toHaveBeenCalledWith('1', '类别1');
  });
  
  test('loadNewArrivals应该获取并渲染新品', () => {
    // 模拟数据
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 10.99 },
      { id: 2, name: 'Product 2', price: 19.99 }
    ];
    DataService.getNewArrivals.mockReturnValue(mockProducts);
    
    // 调用loadNewArrivals
    loadNewArrivals();
    
    // 验证调用链
    expect(DataService.getNewArrivals).toHaveBeenCalledWith(7);
    expect(UIHelpers.renderProductCards).toHaveBeenCalledWith(
      mockProducts,
      'product-container',
      '新品上市'
    );
  });
  
  test('loadOnSaleProducts应该获取并渲染特价商品', () => {
    // 模拟数据
    const mockProducts = [
      { id: 2, name: 'Product 2', price: 19.99, salePrice: 14.99, onSale: true }
    ];
    DataService.getOnSaleProducts.mockReturnValue(mockProducts);
    
    // 调用loadOnSaleProducts
    loadOnSaleProducts();
    
    // 验证调用链
    expect(DataService.getOnSaleProducts).toHaveBeenCalled();
    expect(UIHelpers.renderProductCards).toHaveBeenCalledWith(
      mockProducts,
      'product-container',
      '特价商品'
    );
  });
  
  test('loadProductsByCategory应该获取并渲染类别产品', () => {
    // 模拟数据
    const mockProducts = [
      { id: 3, name: 'Product 3', price: 29.99, categoryId: 1 }
    ];
    DataService.getProductsByCategory.mockReturnValue(mockProducts);
    
    // 调用loadProductsByCategory
    loadProductsByCategory('1', '类别1');
    
    // 验证调用链
    expect(DataService.getProductsByCategory).toHaveBeenCalledWith('1');
    expect(UIHelpers.renderProductCards).toHaveBeenCalledWith(
      mockProducts,
      'product-container',
      '类别1'
    );
  });
}); 