// Global cart variable to store cart items from API
let cart = [];

// Fetch cart items from API
async function fetchCartItems() {
  try {
    showLoading('Loading cart...');

    const currentUser = DataService.getCurrentUser();
    if (!currentUser) {
      hideLoading();
      console.log('No user logged in, returning empty cart');
      return [];
    }

    const response = await fetch(CONFIG.getApiPath(`/cart?userId=${currentUser.id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DataService.getAuthToken()}`
      }
    });

    const result = await response.json();
    hideLoading();

    if (response.ok && result.success) {
      return result.data || [];
    } else {
      console.error('Failed to fetch cart:', result.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    hideLoading();
    console.error('Error fetching cart:', error);
    return [];
  }
}

function calculateTotals() {
  try {
    if (!Array.isArray(cart)) {
      console.error('Cart is not an array in calculateTotals', cart);
      updateTotals(0);
      return;
    }

    const checkedItems = document.querySelectorAll('.cart-item-checkbox:not(#select-all):checked');
    let subtotal = 0;
    let shippingCost = 0;

    checkedItems.forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index);
      if (index >= 0 && index < cart.length) {
        subtotal += cart[index].price * cart[index].quantity;
      }
    });

    shippingCost = subtotal > 0 ? 5.99 : 0;
    updateTotals(subtotal, shippingCost);
  } catch (error) {
    console.error('Error calculating totals:', error);
    updateTotals(0);
  }
}

function updateTotals(subtotal = 0, shippingCost = 0) {
  const total = subtotal + shippingCost;
  subtotalEl.textContent = '$' + subtotal.toFixed(2);
  shippingCostEl.textContent = shippingCost > 0 ? '$' + shippingCost.toFixed(2) : 'Free';
  totalCostEl.textContent = '$' + total.toFixed(2);
}

function showLoading(message = 'Loading...') {
  const loadingEl = document.createElement('div');
  loadingEl.id = 'loading-overlay';
  loadingEl.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-message">${message}</div>
  `;
  document.body.appendChild(loadingEl);
}

function hideLoading() {
  const loadingEl = document.getElementById('loading-overlay');
  if (loadingEl) {
    loadingEl.remove();
  }
}

async function loadCart() {
  cart = await fetchCartItems();
  renderCartItems();
  calculateTotals();
}

document.addEventListener('DOMContentLoaded', async function () {
  fetch(CONFIG.getLayoutPath('navbar.html'))
    .then(response => response.text())
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;
      if (typeof window.initNavbar === 'function') window.initNavbar();
      if (typeof window.updateCartCount === 'function') window.updateCartCount();
    });

  fetch(CONFIG.getLayoutPath('footer.html'))
    .then(response => response.text())
    .then(html => {
      document.getElementById('footer-placeholder').innerHTML = html;
    });

  const currentUser = DataService.getCurrentUser();
  if (!currentUser) {
    cartContainer.innerHTML = `
      <div class="empty-cart-message">
        <h5>Please log in to view your cart</h5>
        <p class="text-muted">You need to be logged in to manage your shopping cart.</p>
        <a href="${CONFIG.getViewPath('auth/login.html')}?returnUrl=${encodeURIComponent(window.location.href)}" class="btn btn-primary mt-3">Log In</a>
      </div>
    `;
    updateTotals(0);
  } else {
    await loadCart();
  }
});