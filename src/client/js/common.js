/**
 * Common functions for Purely Handmade
 * This file contains shared functions used across multiple pages
 */

/**
 * Load the navbar and handle authentication
 */
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
          updateCartCount().catch(err => {
            console.error('Error updating cart count:', err);
          });
        }
      }, 100);
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
      document.getElementById('navbar-placeholder').innerHTML =
        '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
    });
}

/**
 * Load the footer
 */
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

/**
 * Update authentication state in the navbar
 */
function updateAuthState() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const registerButton = document.getElementById('register-button');
  const profileButton = document.getElementById('profile-button');
  const adminButton = document.getElementById('admin-dashboard-button');
  
  if (!loginButton || !logoutButton) {
    console.log('Login/logout buttons not found in this page');
    return;
  }
  
  if (currentUser) {
    // User is logged in
    loginButton.style.display = 'none';
    if (registerButton) registerButton.style.display = 'none';
    logoutButton.style.display = 'block';
    if (profileButton) profileButton.style.display = 'block';
    
    // Show admin dashboard button for admins
    if (currentUser.isAdmin === true && adminButton) {
      adminButton.style.display = 'block';
    } else if (adminButton) {
      adminButton.style.display = 'none';
    }
    
    // Update username display if available
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = currentUser.username || currentUser.name || 'User';
    }
  } else {
    // User is not logged in
    loginButton.style.display = 'block';
    if (registerButton) registerButton.style.display = 'block';
    logoutButton.style.display = 'none';
    if (profileButton) profileButton.style.display = 'none';
    if (adminButton) adminButton.style.display = 'none';
  }
}

/**
 * Check admin permissions
 * @returns {boolean} True if the user is an admin, false otherwise
 */
function checkAdminPermissions() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    // User not logged in, redirect to login page
    window.location.replace('/src/client/views/auth/login.html');
    return false;
  }
  
  if (currentUser.isAdmin !== true) {
    // User is not an admin, redirect to home page
    window.location.replace('/');
    alert('You do not have permission to access this page.');
    return false;
  }
  
  return true; // User is an admin
}

/**
 * Helper function to show toast notifications
 * @param {string} message - The message to display in the toast
 * @param {string} [type='primary'] - The type of the toast ('primary', 'success', 'danger', etc.)
 */
function showToast(message, type = 'primary') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found');
    return;
  }
  
  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-${type} text-white">
        <strong class="me-auto">Purely Handmade</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  
  // Automatically remove toast after it's hidden
  toastElement.addEventListener('hidden.bs.toast', function () {
    toastElement.remove();
  });
}