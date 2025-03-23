/**
 * Admin Authentication Module for Purely Handmade
 * 
 * 提供管理员身份验证和权限检查功能
 * Provides admin authentication and authorization functionality
 */

const AdminAuth = {
  /**
   * 检查用户是否已登录且是管理员
   * Check if the user is logged in and is an admin
   * @param {Function} onSuccess - 身份验证成功时调用的回调
   * @param {Function} onFailure - 身份验证失败时调用的回调
   */
  checkAdminAccess: function(onSuccess, onFailure) {
    console.log('Checking admin access...');
    
    // 首先检查本地存储的用户信息
    const currentUser = DataService.getCurrentUser();
    const authToken = localStorage.getItem('authToken');
    
    console.log('Current user info:', currentUser ? 'Found' : 'Not found');
    console.log('Auth token:', authToken ? 'Found' : 'Not found');
    
    // 如果没有令牌，直接失败
    if (!authToken) {
      console.error('No auth token found');
      if (typeof onFailure === 'function') {
        onFailure('请先登录');
      } else {
        this.redirectToLogin();
      }
      return;
    }
    
    // 如果有用户信息并且已经是管理员，直接成功
    if (currentUser && (currentUser.isAdmin === true || currentUser.role === 'admin')) {
      console.log('User is already verified as admin in local storage');
      if (typeof onSuccess === 'function') {
        onSuccess(currentUser);
      }
      return;
    }
    
    // 否则，尝试从API获取用户信息
    console.log('Trying to verify admin status with API...');
    DataService.getUserProfile()
      .then(userData => {
        console.log('API user profile response:', userData);
        
        if (userData && (userData.isAdmin || userData.role === 'admin')) {
          console.log('API verified user as admin');
          if (typeof onSuccess === 'function') {
            onSuccess(userData);
          }
        } else {
          console.error('User is not an admin according to API');
          if (typeof onFailure === 'function') {
            onFailure('您没有管理员权限');
          } else {
            this.redirectToLogin();
          }
        }
      })
      .catch(error => {
        console.error('Error verifying admin status with API:', error);
        if (typeof onFailure === 'function') {
          onFailure('验证管理员身份时出错');
        } else {
          this.redirectToLogin();
        }
      });
  },
  
  /**
   * 重定向到登录页面
   * Redirect to login page
   */
  redirectToLogin: function() {
    window.location.href = '/src/client/views/auth/login.html?redirect=admin';
  },
  
  /**
   * 显示无权限错误消息
   * Display unauthorized error message
   * @param {string} message - 要显示的错误消息
   */
  showUnauthorized: function(message = '您需要管理员权限才能访问此页面') {
    document.body.innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-warning text-center p-5">
          <h4><i class="bi bi-exclamation-triangle me-2"></i>需要授权</h4>
          <p class="mb-4">${message}</p>
          <a href="/src/client/views/auth/login.html?redirect=admin" class="btn btn-primary">登录管理员账户</a>
        </div>
      </div>
    `;
  },
  
  /**
   * 为管理员页面初始化身份验证
   * Initialize authentication for admin pages
   * @param {Function} loadPageData - 页面加载数据的函数
   */
  initAdminPage: function(loadPageData) {
    console.log('Initializing admin page...');
    
    document.addEventListener('DOMContentLoaded', () => {
      // 加载导航栏
      if (typeof UIHelpers !== 'undefined' && UIHelpers.loadNavbar) {
        UIHelpers.loadNavbar().then(() => {
          console.log('Navbar loaded');
        });
      } else {
        console.warn('UIHelpers not found, navbar may not load correctly');
        // 尝试加载导航栏
        fetch('/src/client/assets/layout/navbar.html')
          .then(response => response.text())
          .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
          })
          .catch(error => console.error('Error loading navbar:', error));
      }
      
      // 检查管理员权限
      this.checkAdminAccess(
        // 成功回调
        (userData) => {
          console.log('Admin authentication successful');
          
          if (typeof loadPageData === 'function') {
            loadPageData(userData);
          }
        },
        // 失败回调
        (errorMessage) => {
          console.error('Admin authentication failed:', errorMessage);
          this.showUnauthorized(errorMessage);
        }
      );
    });
  }
};

// 添加全局刷新函数
window.refreshAdminPage = function() {
  location.reload();
};

// 导出模块，如果支持ES模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminAuth;
} 