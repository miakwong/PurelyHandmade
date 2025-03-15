/**
 * Common functions for Purely Handmade
 * This file contains shared functions used across multiple pages
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
      
      // Update authentication button state after navbar is loaded
      setTimeout(() => {
        updateAuthState();
        // Update cart count if function exists
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
      }, 100);
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
      document.getElementById('navbar-placeholder').innerHTML =
        '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
    });
}

// Load the footer
function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  fetch('/src/client/assets/layout/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load footer (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      footerPlaceholder.innerHTML = html;
      console.log('Footer loaded successfully');
    })
    .catch(error => {
      console.error('Error loading footer:', error);
      footerPlaceholder.innerHTML =
        '<div class="alert alert-danger">Failed to load footer. Please check console for details.</div>';
    });
}

// Update authentication state in the navbar
function updateAuthState() {
  const currentUserStr = localStorage.getItem('currentUser');
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
    if (currentUserStr) {
      // User is logged in
      const currentUser = JSON.parse(currentUserStr);
      
      loginButton.style.display = 'none';
      registerButton.style.display = 'none';
      
      if (profileButton) profileButton.style.display = 'block';
      if (orderHistoryButton) orderHistoryButton.style.display = 'block';
      
      if (logoutButton) {
        logoutButton.style.display = 'block';
        // Add logout functionality
        logoutButton.addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.removeItem('currentUser');
          window.location.href = '/';
        });
      }
      
      // Check if admin
      if (currentUser.role === 'admin' && adminButton) {
        adminButton.style.display = 'block';
      }
      
      console.log('User is logged in, showing logged-in state');
    } else {
      // User is not logged in
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
}

// Check admin permissions
function checkAdminPermissions() {
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    window.location.href = '/src/client/views/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  
  try {
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.role !== 'admin') {
      alert('You must be logged in as an administrator to access this page.');
      window.location.href = '/src/client/views/auth/login.html?redirect=admin';
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error checking admin permissions:', e);
    window.location.href = '/src/client/views/auth/login.html?redirect=admin';
    return false;
  }
}

// Helper function to show toast notifications
function showToast(message, type = 'primary') {
  // Check if toast container exists, if not create it
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
  
  const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', function() {
    toastElement.remove();
  });
} 