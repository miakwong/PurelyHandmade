/**
 * Navbar Handler - Standardizes navbar loading and authentication across all pages
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

// Handle cart count updates
async function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  
  if (!cartCount) return;

  // Check if user is logged in
  const currentUser = window.DataService ? DataService.getCurrentUser() : null;
  if (!currentUser) {
    cartCount.style.display = 'none';
    return;
  }
  
  try {
    // Call the cart API to get current cart items
    const response = await fetch(`/api/cart?userId=${currentUser.id}`, {
      headers: {
        'Authorization': `Bearer ${DataService.getAuthToken()}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      let cartItems = [];
      
      // Handle different response structures
      if (Array.isArray(result.data)) {
        cartItems = result.data;
      } else if (result.data && Array.isArray(result.data.items)) {
        cartItems = result.data.items;
      } else if (Array.isArray(result.items)) {
        cartItems = result.items;
      }
      
      if (cartItems.length > 0) {
        const count = cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
      } else {
        cartCount.style.display = 'none';
      }
    } else {
      cartCount.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
    cartCount.style.display = 'none';
    
    // Fallback to localStorage if API fails
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
      } catch (e) {
        console.error('Error parsing cart data from localStorage:', e);
      }
    }
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

