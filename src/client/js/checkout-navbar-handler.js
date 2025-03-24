/**
 * Checkout Navbar Handler - Standardizes navbar loading and authentication for checkout pages
 * Uses a different path (../../) to access assets
 */

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
      if (typeof updateCartCount === 'function') {
        updateCartCount().catch(err => {
          console.error('Error updating cart count:', err);
        });
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
          const logoutButton = document.getElementById('logout-button');
          const adminButton = document.getElementById('admin-button');
          
          if (loginButton && registerButton) {
            if (currentUser) {
              // User is logged in
              loginButton.style.display = 'none';
              registerButton.style.display = 'none';
              if (profileButton) profileButton.style.display = 'block';
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
            } else {
              // User is not logged in
              loginButton.style.display = 'block';
              registerButton.style.display = 'block';
              if (profileButton) profileButton.style.display = 'none';
              if (logoutButton) logoutButton.style.display = 'none';
              if (adminButton) adminButton.style.display = 'none';
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

// Handle cart count updates
async function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  
  if (!cartCount) return;

  try {
    // 检查用户是否登录并且DataService可用
    if (!window.DataService) {
      console.warn('DataService is not available');
      cartCount.style.display = 'none';
      return;
    }
    
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) {
      cartCount.style.display = 'none';
      return;
    }
    
    // 使用DataService的getCart方法获取购物车数据
    const cart = await DataService.getCart();
    
    // 确保cart是数组
    if (!Array.isArray(cart)) {
      console.warn('Cart is not an array:', cart);
      cartCount.textContent = '0';
      cartCount.style.display = 'none';
      return;
    }
    
    const itemCount = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
    
    // 更新购物车数量显示
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? 'inline-block' : 'none';
  } catch (error) {
    console.error('Error updating cart count:', error);
    cartCount.textContent = '0';
    cartCount.style.display = 'none';
  }
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