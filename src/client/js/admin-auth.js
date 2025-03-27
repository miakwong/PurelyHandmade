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
    
    // 检查DataService是否存在，不存在则安全处理
    if (typeof window.DataService === 'undefined') {
      console.error('DataService is not defined. Make sure data-service.js is loaded before admin-auth.js');
      
      // 尝试从localStorage直接获取用户信息
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        const authToken = localStorage.getItem('authToken');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        
        console.log('Direct localStorage access - Current user:', currentUser ? 'Found' : 'Not found');
        console.log('Direct localStorage access - Auth token:', authToken ? 'Found' : 'Not found');
        
        if (!authToken) {
          if (typeof onFailure === 'function') {
            onFailure('请先登录');
          } else {
            this.redirectToLogin();
          }
          return;
        }
        
        if (currentUser && (currentUser.isAdmin === true || currentUser.role === 'admin')) {
          this.validateToken(authToken)
            .then(isValid => {
              if (isValid) {
                if (typeof onSuccess === 'function') {
                  onSuccess(currentUser);
                }
              } else {
                if (typeof onFailure === 'function') {
                  onFailure('登录已过期，请重新登录');
                } else {
                  this.redirectToLogin();
                }
              }
            })
            .catch(error => {
              console.error('Error validating token:', error);
              if (typeof onFailure === 'function') {
                onFailure('验证登录状态时出错');
              } else {
                this.redirectToLogin();
              }
            });
          return;
        }
        
        if (typeof onFailure === 'function') {
          onFailure('您没有管理员权限或DataService未定义');
        } else {
          this.redirectToLogin();
        }
        return;
      } catch (error) {
        console.error('Error accessing localStorage directly:', error);
        if (typeof onFailure === 'function') {
          onFailure('无法验证管理员身份: DataService未定义');
        } else {
          this.redirectToLogin();
        }
        return;
      }
    }
    
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
    
    // 添加一个标志变量，避免重复调用onSuccess
    let successCallbackCalled = false;
    
    // 验证令牌有效性
    this.validateToken(authToken)
      .then(isValid => {
        if (!isValid) {
          console.warn('Token validation failed');
          if (typeof onFailure === 'function') {
            onFailure('登录已过期，请重新登录');
          } else {
            this.redirectToLogin();
          }
          return;
        }
        
        // 如果有用户信息并且已经是管理员，直接成功
        if (currentUser && (currentUser.isAdmin === true || currentUser.role === 'admin')) {
          console.log('User is already verified as admin in local storage');
          if (typeof onSuccess === 'function' && !successCallbackCalled) {
            successCallbackCalled = true;
            onSuccess(currentUser);
          }
          return;
        }
        
        // 如果DataService中没有getUserProfile方法，报错并尝试使用fetchUserProfile
        const profileMethod = DataService.getUserProfile || DataService.fetchUserProfile;
        
        if (!profileMethod) {
          console.error('Neither getUserProfile nor fetchUserProfile method found in DataService');
          if (typeof onFailure === 'function') {
            onFailure('系统错误: 缺少用户资料方法');
          } else {
            this.redirectToLogin();
          }
          return;
        }
        
        // 否则，尝试从API获取用户信息
        console.log('Trying to verify admin status with API...');
        profileMethod.call(DataService)
          .then(userData => {
            console.log('API user profile response:', userData);
            
            if (userData && (userData.isAdmin || userData.role === 'admin')) {
              console.log('API verified user as admin');
              if (typeof onSuccess === 'function' && !successCallbackCalled) {
                successCallbackCalled = true;
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
      })
      .catch(error => {
        console.error('Error validating token:', error);
        if (typeof onFailure === 'function') {
          onFailure('验证登录状态时出错');
        } else {
          this.redirectToLogin();
        }
      });
  },
  
  /**
   * 验证令牌是否有效
   * Validate if the auth token is still valid
   * @param {string} token - 要验证的令牌
   * @returns {Promise<boolean>} 令牌是否有效
   */
  validateToken: function(token) {
    // 如果没有token，则无效
    if (!token) {
      return Promise.resolve(false);
    }
    
    // 尝试请求需要身份验证的API端点来验证令牌
    return fetch(ApiService.baseUrl + '/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      // 如果响应成功，则令牌有效
      return response.ok;
    })
    .catch(error => {
      console.error('Error validating token:', error);
      // 出错则假设令牌无效
      return false;
    });
  },
  
  /**
   * 重定向到登录页面
   * Redirect to login page
   */
  redirectToLogin: function() {
    window.location.href = '/~xzy2020c/PurelyHandmade/src/client/views/auth/login.html?redirect=admin';
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
          <a href="/~xzy2020c/PurelyHandmade/src/client/views/auth/login.html?redirect=admin" class="btn btn-primary">登录管理员账户</a>
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
      if (typeof loadNavbar === 'function') {
        // 使用common.js中的loadNavbar函数
        loadNavbar();
        console.log('Navbar loading function called');
      } else {
        console.warn('loadNavbar function not found, trying alternatives');
        // 备用方法1：使用UIHelpers
        if (typeof UIHelpers !== 'undefined' && UIHelpers.loadNavbar) {
          UIHelpers.loadNavbar().then(() => {
            console.log('Navbar loaded via UIHelpers');
          });
        } else {
          console.warn('UIHelpers not found, trying direct fetch');
          // 备用方法2：直接加载
          fetch('/~xzy2020c/PurelyHandmade/src/client/assets/layout/navbar.html')
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load navbar (${response.status})`);
              }
              return response.text();
            })
            .then(html => {
              document.getElementById('navbar-placeholder').innerHTML = html;
              console.log('Navbar loaded via direct fetch');
            })
            .catch(error => {
              console.error('Error loading navbar:', error);
              document.getElementById('navbar-placeholder').innerHTML =
                '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
            });
        }
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
} else if (typeof window !== 'undefined') {
  window.AdminAuth = AdminAuth;
} 