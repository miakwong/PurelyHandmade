/**
 * Navbar Handler - Standardizes navbar loading and authentication across all pages
 */

// Load the navbar and handle authentication
function loadNavbar() {
  fetch('../assets/layout/navbar.html')
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
        updateCartCount();
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
          const loginButton = document.querySelector('.nav-button[href*="login.html"]');
          const logoutButton = document.querySelector('.nav-button#logout-button');
          
          if (loginButton && logoutButton) {
            if (currentUser) {
              loginButton.style.display = 'none';
              logoutButton.style.display = 'block';
              console.log('User is logged in, showing logout button');
            } else {
              loginButton.style.display = 'block';
              logoutButton.style.display = 'none';
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
  fetch('../assets/layout/footer.html')
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
function updateCartCount() {
  const cartData = localStorage.getItem('cart');
  const cartCount = document.getElementById('cart-count');
  
  if (!cartCount) return;
  
  if (cartData) {
    const cart = JSON.parse(cartData);
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'inline-block' : 'none';
  } else {
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