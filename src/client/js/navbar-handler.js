/**
 * Navbar Handler - Standardizes navbar loading and authentication across all pages
 */

// 确保CONFIG对象已定义
if (typeof CONFIG === 'undefined') {
  console.warn('CONFIG is not defined. Creating default CONFIG object');
  window.CONFIG = {
    BASE_URL: '/~xzy2020c/PurelyHandmade',
    getViewPath: function(path) {
      return '/~xzy2020c/PurelyHandmade/src/client/views/' + path;
    }
  };
}

// Load the navbar and handle authentication
function loadNavbar() {
  // 使用带错误处理的方式获取BASE_URL
  const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL) 
    ? CONFIG.BASE_URL 
    : '/~xzy2020c/PurelyHandmade';
  
  fetch(`${baseUrl}/assets/layout/navbar.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load navbar (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;
      console.log('Navbar loaded successfully');
      
      // Update cart count after navbar is loaded
      try {
        if (typeof UIHelpers !== 'undefined' && typeof UIHelpers.updateCartCount === 'function') {
          // Use UIHelpers's updateCartCount method
          const result = UIHelpers.updateCartCount();
          if (result && typeof result.catch === 'function') {
            result.catch(err => {
              console.error('Error updating cart count:', err);
            });
          }
        } else if (typeof updateCartCount === 'function') {
          // Compatibility handling: If UIHelpers doesn't exist but there's a global updateCartCount function
          const result = updateCartCount();
          if (result && typeof result.catch === 'function') {
            result.catch(err => {
              console.error('Error updating cart count:', err);
            });
          }
        } else {
          console.log('No updateCartCount function available');
        }
      } catch (err) {
        console.error('Error while updating cart count:', err);
      }
      
      // Update authentication button state after navbar is loaded
      setTimeout(() => {
        console.log('Checking for updateAuthButton availability');
        if (typeof updateAuthButton === 'function') {
          console.log('Updating auth button state');
          updateAuthButton();
        } else {
          console.log('updateAuthButton function not available, using fallback');
          // Fallback: Manually update login/logout buttons
          const currentUser = localStorage.getItem('currentUser');
          const loginButton = document.getElementById('login-button');
          const registerButton = document.getElementById('register-button');
          const profileButton = document.getElementById('profile-button');
          const orderHistoryButton = document.getElementById('order-history-button');
          const logoutButton = document.getElementById('logout-button');
          const adminButton = document.getElementById('admin-button');
          
          if (loginButton && registerButton) {
            if (currentUser) {
              // User is logged in
              loginButton.style.display = 'none';
              registerButton.style.display = 'none';
              if (profileButton) profileButton.style.display = 'block';
              if (orderHistoryButton) orderHistoryButton.style.display = 'block';
              if (logoutButton) {
                logoutButton.style.display = 'block';
                logoutButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  localStorage.removeItem('currentUser');
                  // 使用安全的方式获取路径
                  const homePath = (typeof CONFIG !== 'undefined' && CONFIG.getViewPath) 
                    ? `${CONFIG.BASE_URL('index.html')}`
                    : '/~xzy2020c/PurelyHandmade/src/client/views/index.html';
                  window.location.href = homePath;
                });
              }
              
              // Check if admin
              try {
                const userData = JSON.parse(currentUser);
                if (userData.isAdmin && adminButton) {
                  adminButton.style.display = 'block';
                }
              } catch (e) {
                console.error('Error parsing user data', e);
              }
              
              console.log('User is logged in, showing logout button');
            } else {
              // User is not logged in
              loginButton.style.display = 'block';
              registerButton.style.display = 'block';
              if (profileButton) profileButton.style.display = 'none';
              if (orderHistoryButton) orderHistoryButton.style.display = 'none';
              if (logoutButton) logoutButton.style.display = 'none';
              if (adminButton) adminButton.style.display = 'none';
              
              console.log('User is not logged in, showing login button');
            }
          } else {
            console.warn('Could not find login/logout buttons in navbar');
          }
        }
      }, 300);
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
      document.getElementById('navbar-placeholder').innerHTML =
        '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
    });
}

// Load the footer
function loadFooter() {
  // 使用带错误处理的方式获取BASE_URL
  const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL) 
    ? CONFIG.BASE_URL 
    : '/~xzy2020c/PurelyHandmade';
    
  fetch(`${baseUrl}/assets/layout/footer.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load footer (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('footer-placeholder').innerHTML = html;
      console.log('Footer loaded successfully');
    })
    .catch(error => {
      console.error('Error loading footer:', error);
      document.getElementById('footer-placeholder').innerHTML =
        '<div class="alert alert-danger">Failed to load footer. Please check console for details.</div>';
    });
}

// Main initialization function
function initPage() {
  loadNavbar();
  loadFooter();
  
  // Initialize data if the function exists
  if (typeof window.initializeData === 'function') {
    window.initializeData();
  }
}

// Run initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', initPage); 

