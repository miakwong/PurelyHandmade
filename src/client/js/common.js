/**
 * Common functions for Purely Handmade
 * This file contains shared functions used across multiple pages
 */

// Central event management system
const PurelyHandmadeEvents = {
  // Store event handlers
  handlers: {},
  
  // Register a handler for an event
  on: function(eventName, handler) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  },
  
  // Trigger an event
  trigger: function(eventName, data) {
    console.log(`PurelyHandmadeEvents: Triggered '${eventName}'`, data || '');
    if (this.handlers[eventName]) {
      this.handlers[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for event '${eventName}':`, error);
        }
      });
    }
  }
};

// Expose to window
window.PurelyHandmadeEvents = PurelyHandmadeEvents;

// Register built-in event handlers
PurelyHandmadeEvents.on('auth:login', function() {
  updateUIForAuthState(true);
});

PurelyHandmadeEvents.on('auth:logout', function() {
  updateUIForAuthState(false);
});

// Central function to update all UI elements based on auth state
function updateUIForAuthState(isLoggedIn) {
  console.log('Common.js: updateUIForAuthState called, isLoggedIn:', isLoggedIn);
  
  // Apply body class
  if (isLoggedIn) {
    document.body.classList.add('user-logged-in');
  } else {
    document.body.classList.remove('user-logged-in');
  }
  
  // Update mobile elements
  const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
  const mobileProfileButtons = document.getElementById('mobile-profile-buttons');
  
  if (mobileAuthButtons) {
    mobileAuthButtons.style.cssText = isLoggedIn ? 
      'display: none !important; visibility: hidden !important;' : 
      'display: block !important; visibility: visible !important;';
  }
  
  if (mobileProfileButtons) {
    mobileProfileButtons.style.cssText = isLoggedIn ? 
      'display: block !important; visibility: visible !important;' : 
      'display: none !important; visibility: hidden !important;';
  }
  
  // Update desktop elements
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const profileButton = document.getElementById('profile-button');
  const orderHistoryButton = document.getElementById('order-history-button');
  const logoutButton = document.getElementById('logout-button');
  
  if (loginButton) loginButton.style.cssText = isLoggedIn ? 'display: none !important' : 'display: block !important';
  if (registerButton) registerButton.style.cssText = isLoggedIn ? 'display: none !important' : 'display: block !important';
  if (profileButton) profileButton.style.cssText = isLoggedIn ? 'display: block !important' : 'display: none !important';
  if (orderHistoryButton) orderHistoryButton.style.cssText = isLoggedIn ? 'display: block !important' : 'display: none !important';
  if (logoutButton) logoutButton.style.cssText = isLoggedIn ? 'display: block !important' : 'display: none !important';
  
  // Ensure parent elements are visible
  if (mobileAuthButtons && mobileAuthButtons.parentElement) {
    mobileAuthButtons.parentElement.style.display = 'block';
  }
  if (mobileProfileButtons && mobileProfileButtons.parentElement) {
    mobileProfileButtons.parentElement.style.display = 'block';
  }
  
  // Update cart count if function exists
  if (typeof updateCartCount === 'function') {
    updateCartCount().catch(err => {
      console.error('Error updating cart count:', err);
    });
  }
}

// Check and update auth state
function checkAuthState() {
  const currentUser = localStorage.getItem('currentUser');
  const isLoggedIn = !!currentUser;
  updateUIForAuthState(isLoggedIn);
  return isLoggedIn;
}

// Load the navbar and handle authentication
function loadNavbar() {
  // Set body class immediately for CSS control
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    document.body.classList.add('user-logged-in');
  } else {
    document.body.classList.remove('user-logged-in');
  }

  fetch('/~xzy2020c/PurelyHandmade/src/client/assets/layout/navbar.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load navbar (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;
      console.log('Navbar loaded successfully');
      
      // Use MutationObserver to detect when navbar is fully inserted into DOM
      const observer = new MutationObserver(function(mutations) {
        observer.disconnect(); // Stop observing
        console.log('Navbar DOM changes detected, updating auth state');
        
        // Update UI based on current auth state
        checkAuthState();
      });
      
      // Start observing navbar-placeholder
      observer.observe(document.getElementById('navbar-placeholder'), {
        childList: true,
        subtree: true
      });
      
      // Additional safety timeout
      setTimeout(checkAuthState, 100);
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
  
  fetch('/~xzy2020c/PurelyHandmade/src/client/assets/layout/footer.html')
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

// Update authentication state in the navbar - Legacy function for backward compatibility
function updateAuthState() {
  console.log('common.js: updateAuthState called (legacy function)');
  checkAuthState();
}

// Check admin permissions
function checkAdminPermissions() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    // User not logged in, redirect to login page
    window.location.replace('/~xzy2020c/PurelyHandmade/src/client/views/auth/login.html');
    return false;
  }
  
  if (currentUser.isAdmin !== true) {
    // User is not an admin, redirect to home page
    window.location.replace('/~xzy2020c/PurelyHandmade/index.html');
    alert('You do not have permission to access this page.');
    return false;
  }
  
  return true; // User is an admin
}

// Helper function to show toast notifications
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

// Global logout handler
window.handleLogout = function(event) {
  if (event) event.preventDefault();
  console.log('Logout handler called');
  
  // Remove user data and token
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  
  // Trigger the logout event
  PurelyHandmadeEvents.trigger('auth:logout');
  
  // Redirect to home page
  window.location.href = '/~xzy2020c/PurelyHandmade/index.html';
};

// Legacy function for backward compatibility
const updateNavAfterAuthChange = function() {
  console.log('updateNavAfterAuthChange called (legacy function)');
  checkAuthState();
};

// Legacy function for backward compatibility
function updateNavbarManually() {
  console.log('updateNavbarManually called (legacy function)');
  checkAuthState();
}

// Legacy function for backward compatibility
function tryFixMobileElements() {
  console.log('tryFixMobileElements called (legacy function)');
  checkAuthState();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: Initializing auth state');
  checkAuthState();
});

// Override localStorage methods to trigger events
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  // Call original method
  originalSetItem.call(this, key, value);
  
  // Trigger events for auth-related keys
  if (key === 'currentUser' || key === 'authToken') {
    console.log(`localStorage.setItem: ${key} changed, triggering auth:login event`);
    if (key === 'currentUser' && value) {
      PurelyHandmadeEvents.trigger('auth:login');
    }
  }
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  // Call original method
  originalRemoveItem.call(this, key);
  
  // Trigger events for auth-related keys
  if (key === 'currentUser' || key === 'authToken') {
    console.log(`localStorage.removeItem: ${key} removed, triggering auth:logout event`);
    if (key === 'currentUser') {
      PurelyHandmadeEvents.trigger('auth:logout');
    }
  }
};

// Cross-tab synchronization
window.addEventListener('storage', function(e) {
  if (e.key === 'currentUser') {
    console.log('Storage event detected:', e);
    if (e.newValue) {
      PurelyHandmadeEvents.trigger('auth:login');
    } else {
      PurelyHandmadeEvents.trigger('auth:logout');
    }
  }
});

// Make these functions accessible globally for backward compatibility
window.updateAuthState = updateAuthState;
window.updateNavAfterAuthChange = updateNavAfterAuthChange;
window.updateNavbarManually = updateNavbarManually;
window.tryFixMobileElements = tryFixMobileElements;
window.checkAuthState = checkAuthState;
window.updateUIForAuthState = updateUIForAuthState; 