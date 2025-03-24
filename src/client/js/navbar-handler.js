/**
 * Navbar Handler - Standardizes navbar loading and authentication across all pages
 */

// 简单的购物车计数更新实现，确保即使UIHelpers不可用也能正常工作
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;
  
  if (typeof DataService === 'undefined' || !DataService.getAuthToken()) {
    cartCount.style.display = 'none';
    return;
  }
  
  try {
    // 尝试从localStorage获取一个简单的计数
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = Array.isArray(cart) ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
    
    cartCount.textContent = count.toString();
    cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    return Promise.resolve(); // 返回一个resolved promise
  } catch (e) {
    console.error('Error in simple updateCartCount:', e);
    cartCount.style.display = 'none';
    return Promise.resolve(); // 错误时也返回resolved promise
  }
}

// Load the navbar and handle authentication
function loadNavbar() {
  fetch('/src/client/assets/layout/navbar.html')
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
        // 优先使用UIHelpers中的方法
        if (typeof UIHelpers !== 'undefined' && typeof UIHelpers.updateCartCount === 'function') {
          UIHelpers.updateCartCount();
        } else {
          // 使用内置简单实现
          updateCartCount();
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
                  window.location.href = '/src/client/html/index.html';
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
  fetch('/src/client/assets/layout/footer.html')
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

