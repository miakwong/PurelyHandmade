
    // API service
    const ApiService = {
      baseUrl: '${CONFIG.API_BASE_URL}',

      // Handle API response
      handleResponse: async function (response) {
        if (!response.ok) {
          const error = new Error('API request failed');
          error.status = response.status;
          error.statusText = response.statusText;
          try {
            if (response.headers.get('content-type')?.includes('application/json')) {
              error.data = await response.json();
            } else {
              error.data = await response.text();
            }
          } catch (e) {
            error.data = 'Could not parse error response';
          }
          throw error;
        }

        if (response.headers.get('content-type')?.includes('application/json')) {
          return response.json();
        }
        return response.text();
      },

      // GET request
      get: function (url, params = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            queryParams.append(key, params[key]);
          }
        });

        const queryString = queryParams.toString();
        const fullUrl = this.baseUrl + url + (queryString ? `?${queryString}` : '');

        return fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token')}`
          }
        }).then(this.handleResponse);
      }
    };

    // Load order details function
    async function loadOrderDetails() {
      try {
        // Get order ID from URL
        const orderId = new URLSearchParams(window.location.search).get('id');

        if (!orderId) {
          showToast('No order ID provided', 'error');
          return;
        }

        // Check user login status
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          showToast('Please login to view order details', 'error');
          setTimeout(() => {
            window.location.href = '/src/client/views/auth/login.html?redirect=' + encodeURIComponent(window.location.href);
          }, 3000);
          return;
        }

        // Show loading indicator
        document.getElementById('loading-indicator').classList.remove('d-none');

        // Get order details from API
        const response = await ApiService.get(`/orders/${orderId}`);

        // Hide loading indicator
        document.getElementById('loading-indicator').classList.add('d-none');

        if (!response || !response.success) {
          throw new Error(response?.data || 'Failed to load order details');
        }

        const order = response.data;

        console.log("Order data:", order);

        // Ensure order items is an array
        if (!order.items || !Array.isArray(order.items)) {
          console.warn("Order items not found or not an array, using empty array");
          order.items = [];
        }

        // Update order information on the page
        document.getElementById('order-id').textContent = `Order #${order.id}`;
        document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleDateString();
        document.getElementById('order-status').textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        document.getElementById('order-status').className = `order-status status-${order.status}`;

        // Update order items
        const orderItemsContainer = document.getElementById('order-items');
        orderItemsContainer.innerHTML = '';

        let totalItems = 0;
        order.items.forEach(item => {
          totalItems += item.quantity;
          const itemHTML = `
          <div class="product-item">
            <img src="${item.product?.image || '/src/client/img/product-placeholder.jpg'}" alt="${item.product?.name || 'Product'}" class="product-image">
            <div class="product-details">
              <p class="product-name">${item.product?.name || 'Product'}</p>
              <p class="product-price">$${item.price.toFixed(2)}</p>
              <p class="product-qty mb-0">Qty: ${item.quantity}</p>
            </div>
          </div>
        `;
          orderItemsContainer.innerHTML += itemHTML;
        });

        // Update order total
        document.getElementById('order-total-items').textContent = totalItems;
        document.getElementById('order-subtotal').textContent = `$${order.totalAmount.toFixed(2)}`;

        // If there is shipping information, update
        if (order.shippingInfo) {
          try {
            const shippingInfo = typeof order.shippingInfo === 'string'
              ? JSON.parse(order.shippingInfo)
              : order.shippingInfo;

            const shippingAddressHTML = `
            ${shippingInfo.addressLine1}<br>
            ${shippingInfo.addressLine2 ? shippingInfo.addressLine2 + '<br>' : ''}
            ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}<br>
            ${shippingInfo.country}
          `;
            document.getElementById('shipping-address').innerHTML = shippingAddressHTML;
          } catch (error) {
            console.error('Error parsing shipping info:', error);
          }
        }

        console.log('Order details loaded successfully');

      } catch (error) {
        console.error('Error loading order details:', error);
        document.getElementById('loading-indicator').classList.add('d-none');
        showToast(`Error loading order details: ${error.message}`, 'error');
      }
    }

    // Show Toast notification
    function showToast(message, type = 'success') {
      const toastContainer = document.getElementById('toast-container');

      if (!toastContainer) return;

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.style.backgroundColor = '#fff';
      toast.style.color = '#333';
      toast.style.borderRadius = '4px';
      toast.style.padding = '10px 15px';
      toast.style.marginBottom = '10px';
      toast.style.minWidth = '250px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.position = 'relative';

      if (type === 'success') {
        toast.style.borderLeft = '4px solid #198754';
      } else if (type === 'error') {
        toast.style.borderLeft = '4px solid #dc3545';
      }

      // Add content
      toast.innerHTML = `
      <div style="flex: 1; padding-right: 10px;">${message}</div>
      <div style="cursor: pointer; font-size: 16px; color: #999;">&times;</div>
    `;

      // Add to container
      toastContainer.appendChild(toast);

      // Add close button event
      const closeBtn = toast.querySelector('div:last-child');
      closeBtn.addEventListener('click', function () {
        toast.remove();
      });

      // Automatically remove after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }