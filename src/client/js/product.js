/**
 * Products Page Script
 * 产品列表页面脚本
 */

document.addEventListener("DOMContentLoaded", function () {
  // 页面主要元素
  const productContainer = document.getElementById("product-container");
  const sidebar = document.getElementById("sidebar");
  const designerCarousel = document.getElementById("designerCarousel");

  // 导航链接
  const newArrivalsLink = document.getElementById("newArrivalsLink");
  const onSaleLink = document.getElementById("onSaleLink");

  // 分类筛选链接
  const categoryLinks = document.querySelectorAll(".category-link");
  
  // 加载导航栏和页脚
  if (typeof UIHelpers !== 'undefined') {
    UIHelpers.loadNavbar().then(() => UIHelpers.updateCartCount());
    UIHelpers.loadFooter();
  }
  
  // 获取URL参数中的分类
  const urlCategory = UIHelpers.getUrlParameter('category');
  
  // 如果URL中有分类，直接加载该分类
  if (urlCategory) {
    const categoryLink = document.querySelector(`.category-link[data-category="${urlCategory}"]`);
    if (categoryLink) {
      setTimeout(() => categoryLink.click(), 100);
    } else {
      loadNewArrivals();
    }
  } else {
    loadNewArrivals();
  }
  
  // 点击"新品"链接
  if (newArrivalsLink) {
    newArrivalsLink.addEventListener("click", function (event) {
      event.preventDefault();
      loadNewArrivals();
    });
  }

  // 点击"特价"链接
  if (onSaleLink) {
    onSaleLink.addEventListener("click", function (event) {
      event.preventDefault();
      loadOnSaleProducts();
    });
  }

  // 设置分类筛选点击事件
  categoryLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const categoryId = parseInt(this.getAttribute("data-category-id"), 10);
      const categoryName = this.textContent.trim();
      
      if (isNaN(categoryId)) {
        console.error("Invalid category ID");
        return;
      }
      
      loadProductsByCategory(categoryId, categoryName);
    });
  });
  
  /**
   * 加载新品
   * Load new arrivals
   */
  function loadNewArrivals() {
    // 隐藏侧边栏和设计师轮播
    if (sidebar) sidebar.classList.add("d-none");
    if (designerCarousel) designerCarousel.classList.add("d-none");
    
    // 获取新品
    const newProducts = DataService.getNewArrivals(7);
    
    // 渲染产品
    UIHelpers.renderProductCards(newProducts, "product-container", "New Arrivals");
    
    // 更新活动菜单项
    updateActiveMenuItem(newArrivalsLink);
  }
  
  /**
   * 加载特价商品
   * Load on sale products
   */
  function loadOnSaleProducts() {
    // 隐藏侧边栏和设计师轮播
    if (sidebar) sidebar.classList.add("d-none");
    if (designerCarousel) designerCarousel.classList.add("d-none");
    
    // 获取特价商品
    const saleProducts = DataService.getOnSaleProducts();
    
    // 渲染产品
    UIHelpers.renderProductCards(saleProducts, "product-container", "On Sale - Special Discounts");
    
    // 更新活动菜单项
    updateActiveMenuItem(onSaleLink);
  }
  
  /**
   * 按分类加载产品
   * Load products by category
   * @param {number} categoryId 分类ID
   * @param {string} categoryName 分类名称
   */
  function loadProductsByCategory(categoryId, categoryName) {
    // 显示侧边栏和设计师轮播
    if (sidebar) sidebar.classList.remove("d-none");
    if (designerCarousel) designerCarousel.classList.remove("d-none");
    
    // 获取分类产品
    const categoryProducts = DataService.getProductsByCategory(categoryId);
    
    // 渲染产品
    UIHelpers.renderProductCards(categoryProducts, "product-container", categoryName);
    
    // 更新活动菜单项
    const categoryLink = document.querySelector(`.category-link[data-category-id="${categoryId}"]`);
    updateActiveMenuItem(categoryLink);
  }
  
  /**
   * 更新活动菜单项
   * Update active menu item
   * @param {HTMLElement} activeLink 活动链接元素
   */
  function updateActiveMenuItem(activeLink) {
    if (!activeLink) return;
    
    // 移除所有菜单项的活动状态
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // 添加当前活动链接的活动状态
    activeLink.classList.add('active');
  }
});
