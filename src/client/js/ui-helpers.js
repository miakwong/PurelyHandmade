/**
 * UI Helpers for Purely Handmade
 * 
 * 提供统一的UI操作辅助函数
 * Provides unified UI helper functions
 */

const UIHelpers = {
  /**
   * 加载导航栏
   * Load navbar
   * @param {string} containerId 容器ID Container ID
   * @returns {Promise} 加载完成的Promise Promise that resolves when loaded
   */
  loadNavbar: function(containerId = 'navbar-placeholder') {
    return new Promise((resolve, reject) => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Navbar container #${containerId} not found`);
        return reject(new Error(`Navbar container #${containerId} not found`));
      }
      
      fetch('/src/client/assets/layout/navbar.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load navbar (${response.status})`);
          }
          return response.text();
        })
        .then(html => {
          container.innerHTML = html;
          console.log('Navbar loaded successfully');
          
          // 初始化导航栏状态
          setTimeout(() => {
            this.updateAuthState();
            // 更新购物车数量（如果函数存在）
            if (typeof this.updateCartCount === 'function') {
              this.updateCartCount();
            }
          }, 100);
          
          resolve();
        })
        .catch(error => {
          console.error('Error loading navbar:', error);
          container.innerHTML =
            '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
          reject(error);
        });
    });
  },
  
  /**
   * 加载页脚
   * Load footer
   * @param {string} containerId 容器ID Container ID
   * @returns {Promise} 加载完成的Promise Promise that resolves when loaded
   */
  loadFooter: function(containerId = 'footer-placeholder') {
    return new Promise((resolve, reject) => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Footer container #${containerId} not found`);
        return resolve(); // 如果没有找到容器，静默处理
      }
      
      fetch('/src/client/assets/layout/footer.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load footer (${response.status})`);
          }
          return response.text();
        })
        .then(html => {
          container.innerHTML = html;
          console.log('Footer loaded successfully');
          resolve();
        })
        .catch(error => {
          console.error('Error loading footer:', error);
          container.innerHTML =
            '<div class="alert alert-danger">Failed to load footer. Please check console for details.</div>';
          reject(error);
        });
    });
  },
  
  /**
   * 更新导航栏认证状态
   * Update navbar authentication state
   */
  updateAuthState: function() {
    const currentUser = DataService.getCurrentUser();
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const profileButton = document.getElementById('profile-button');
    const orderHistoryButton = document.getElementById('order-history-button');
    const logoutButton = document.getElementById('logout-button');
    const adminButton = document.getElementById('admin-button');
    
    if (!loginButton || !registerButton) {
      console.warn('Could not find authentication buttons in navbar');
      return;
    }
    
    try {
      if (currentUser) {
        // 用户已登录
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        
        if (profileButton) profileButton.style.display = 'block';
        if (orderHistoryButton) orderHistoryButton.style.display = 'block';
        
        if (logoutButton) {
          logoutButton.style.display = 'block';
          // 添加退出功能
          logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            DataService.logout();
            window.location.href = '/';
          });
        }
        
        // 检查是否管理员
        if (currentUser.isAdmin === true && adminButton) {
          adminButton.style.display = 'block';
        }
        
        console.log('User is logged in, showing logged-in state');
      } else {
        // 用户未登录
        loginButton.style.display = 'block';
        registerButton.style.display = 'block';
        
        if (profileButton) profileButton.style.display = 'none';
        if (orderHistoryButton) orderHistoryButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (adminButton) adminButton.style.display = 'none';
        
        console.log('User is not logged in, showing login/register buttons');
      }
    } catch (e) {
      console.error('Error updating auth state:', e);
    }
  },
  
  /**
   * 检查管理员权限
   * Check admin permissions
   * @returns {boolean} 是否是管理员 Whether user is admin
   */
  checkAdminPermissions: function() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) {
      window.location.href = '/src/client/views/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    
    if (currentUser.isAdmin !== true) {
      this.showToast('You must be logged in as an administrator to access this page.', 'danger');
      window.location.href = '/src/client/views/auth/login.html?redirect=admin';
      return false;
    }
    return true;
  },
  
  /**
   * 显示通知消息
   * Show toast notification
   * @param {string} message 消息内容 Message content
   * @param {string} type 消息类型 Message type (primary, success, danger, warning, info)
   */
  showToast: function(message, type = 'primary') {
    // 检查toast容器是否存在，如果不存在则创建
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // 使用Bootstrap Toast API显示通知
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
      toast.show();
    } else {
      // 备用方法，防止bootstrap未加载
      toastElement.classList.add('show');
      setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 300);
      }, 3000);
    }
    
    // 监听关闭事件
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  },
  
  /**
   * 更新购物车数量
   * Update cart count in navbar
   */
  updateCartCount: function() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const cart = DataService.getCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? 'inline-block' : 'none';
  },
  
  /**
   * 渲染产品卡片
   * Render product cards
   * @param {Array} products 产品列表 Product list
   * @param {string} containerId 容器ID Container ID
   * @param {string} title 标题 Title
   */
  renderProductCards: function(products, containerId, title = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const imgBasePath = '/src/client/img/';
    
    let html = '';
    if (title) {
      html = `<h2 class="text-center mb-4">${title}</h2>`;
    }
    
    html += '<div class="row">';
    
    products.forEach(product => {
      const price = product.onSale 
        ? `<span class="text-decoration-line-through me-2">$${product.price.toFixed(2)}</span>$${product.salePrice.toFixed(2)}`
        : `$${product.price.toFixed(2)}`;
      
      const discount = product.onSale 
        ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">On Sale</span>` 
        : '';
      
      html += `