
// Load order history
async function loadOrderHistory() {
 try {
   // 检查用户登录状态
   const token = localStorage.getItem('authToken') || localStorage.getItem('token');
   if (!token) {
     showToast('Please login to view your order history', 'error');
     return;
   }
   
   // 显示加载指示器
   const ordersContainer = document.getElementById('orders-container');
   const emptyState = document.getElementById('empty-state');
   
   ordersContainer.innerHTML = `
     <div class="text-center my-5">
       <div class="spinner-border text-primary" role="status">
         <span class="visually-hidden">Loading...</span>
       </div>
       <p class="mt-3">Loading your orders...</p>
     </div>
   `;
   
   // 从API获取订单数据
   const response = await fetch(`${CONFIG.getApiPath('/orders')}`, {
     method: 'GET',
     headers: {
       'Accept': 'application/json',
       'Authorization': `Bearer ${token}`
     }
   });
   
   if (!response.ok) {
     throw new Error('Failed to load orders');
   }
   
   const data = await response.json();
   console.log('API response:', data);
   
   if (!data.success) {
     throw new Error(data.message || 'Invalid response from server');
   }
   
   // Handle different response formats
   let orders;
   if (data.data && Array.isArray(data.data)) {
     // Format: { success: true, data: [...] }
     orders = data.data;
   } else if (data.data && data.data.orders && Array.isArray(data.data.orders)) {
     // Format: { success: true, data: { orders: [...] } }
     orders = data.data.orders;
   } else if (data.orders && Array.isArray(data.orders)) {
     // Format: { success: true, orders: [...] }
     orders = data.orders;
   } else {
     // Fallback for any other format
     orders = data.data || [];
   }
   
   // 检查是否有订单
   if (!orders || orders.length === 0) {
     ordersContainer.style.display = 'none';
     emptyState.style.display = 'block';
     return;
   }
   
   // 显示订单容器，隐藏空状态
   ordersContainer.style.display = 'block';
   emptyState.style.display = 'none';
   
   // 清空订单容器
   ordersContainer.innerHTML = '';
   
   // 按日期降序排序订单
   if (Array.isArray(orders)) {
     orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   } else {
     console.warn('Orders data is not an array:', orders);
     // If orders is not an array, try to extract orders from the response
     if (orders && typeof orders === 'object') {
       if (orders.orders && Array.isArray(orders.orders)) {
         console.log('Using orders.orders array instead');
         orders = orders.orders;
         orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       } else {
         console.error('Could not find orders array in response');
         throw new Error('Invalid orders data format');
       }
     }
   }
   
   // 渲染每个订单
   orders.forEach(order => {
     const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     });
     
     // 计算总商品数量
     let totalItems = 0;
     if (order.items) {
       order.items.forEach(item => {
         totalItems += item.quantity;
       });
     }
     
     // 创建订单卡片HTML
     const orderCard = document.createElement('div');
     orderCard.className = 'order-card';
     orderCard.dataset.status = order.status;
     
     // 格式化订单状态显示
     const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
     
     orderCard.innerHTML = `
       <div class="order-header">
         <div class="row">
           <div class="col-md-6">
             <h5 class="mb-1">Order #${order.id}</h5>
             <p class="order-date mb-0">Placed on ${orderDate}</p>
           </div>
           <div class="col-md-6 text-md-end">
             <span class="order-status status-${order.status}">${statusText}</span>
           </div>
         </div>
       </div>
       <div class="order-body">
         <div class="product-list">
           ${renderOrderItems(order.items)}
         </div>
         <div class="row">
           <div class="col-6">
             <p class="mb-0"><strong>Total Items:</strong> ${totalItems}</p>
           </div>
           <div class="col-6 text-md-end">
             <p class="mb-0"><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
           </div>
         </div>
       </div>
       <div class="order-footer">
         <div>
           <span class="text-muted">Order ID: ${order.id}</span>
         </div>
         <a href="order-details.html?id=${order.id}" class="btn btn-outline-primary">View Details</a>
       </div>
     `;
     
     ordersContainer.appendChild(orderCard);
   });
   
   // 应用当前过滤器
   const activeFilter = document.querySelector('.nav-pills .nav-link.active');
   if (activeFilter) {
     filterOrders(activeFilter.dataset.status);
   }
   
 } catch (error) {
   console.error('Error loading order history:', error);
   document.getElementById('orders-container').innerHTML = `
     <div class="alert alert-danger" role="alert">
       <i class="bi bi-exclamation-triangle-fill me-2"></i>
       Error loading orders: ${error.message}
     </div>
     <button class="btn btn-outline-primary mt-3" onclick="loadOrderHistory()">
       <i class="bi bi-arrow-clockwise me-1"></i>Try Again
     </button>
   `;
 }
}

// 渲染订单商品
function renderOrderItems(items) {
 if (!items || items.length === 0) {
   return '<p>No items in this order</p>';
 }
 
 // 限制显示的商品数量
 const displayItems = items.slice(0, 2);
 let html = '';
 
 displayItems.forEach(item => {
   const productName = item.product ? item.product.name : 'Product';
   const productImage = item.product && item.product.image 
     ? item.product.image 
     : '/src/client/img/product-placeholder.jpg';
   
   html += `
     <div class="product-item">
       <img src="${productImage}" alt="${productName}" class="product-image">
       <div class="product-details">
         <p class="product-name">${productName}</p>
         <p class="product-qty mb-0">Qty: ${item.quantity}</p>
       </div>
     </div>
   `;
 });
 
 // 如果有更多商品，显示提示
 if (items.length > 2) {
   html += `
     <div class="more-items">
       <span>+${items.length - 2} more items</span>
     </div>
   `;
 }
 
 return html;
}

// Initialize filters
function initializeFilters() {
 // Status filtering
 document.querySelectorAll('.nav-pills .nav-link').forEach(link => {
   link.addEventListener('click', function(e) {
     e.preventDefault();
     
     // Update active state
     document.querySelectorAll('.nav-pills .nav-link').forEach(el => {
       el.classList.remove('active');
     });
     this.classList.add('active');
     
     // Get filter value
     const filter = this.getAttribute('data-status');
     
     // Filter orders
     filterOrders(filter);
   });
 });
 
 // Sorting
 document.getElementById('sortDropdown').addEventListener('change', function() {
   sortOrders(this.value);
 });
}

// Filter orders
function filterOrders(status) {
 console.log("Filtering orders with status:", status);
 const orderCards = document.querySelectorAll('.order-card');
 console.log("Total order cards found:", orderCards.length);
 
 let visibleCount = 0;
 
 // Hide all empty state messages first
 document.querySelectorAll('[id^="empty-state-"]').forEach(el => {
   el.style.display = 'none';
 });
 
 orderCards.forEach(card => {
   const cardStatus = card.getAttribute('data-status');
   console.log("Card status:", cardStatus, "Comparing with:", status);
   
   if (status === 'all' || cardStatus === status) {
     card.style.display = 'block';
     visibleCount++;
     console.log("Showing card, visible count now:", visibleCount);
   } else {
     card.style.display = 'none';
     console.log("Hiding card");
   }
 });
 
 console.log("Final visible count:", visibleCount);
 
 // Show the appropriate empty state if no visible orders
 if (visibleCount === 0) {
   if (status !== 'all') {
     // Show status-specific empty state message
     const emptyStateElement = document.getElementById(`empty-state-${status}`);
     if (emptyStateElement) {
       emptyStateElement.style.display = 'block';
       console.log(`Showing empty state for ${status}`);
     }
     
     // Also show toast notification
     console.log("Showing 'no orders' toast for status:", status);
     showToast(`No ${getStatusText(status)} orders found`, 'info');
   } else {
     // If "all" is selected and no orders, show the main empty state
     document.getElementById('empty-state').style.display = 'block';
   }
 }
}

// Get status text based on status value
function getStatusText(status) {
 switch(status) {
   case 'processing': return 'processing';
   case 'shipped': return 'shipped';
   case 'delivered': return 'delivered';
   case 'cancelled': return 'cancelled';
   default: return '';
 }
}

// Sort orders
function sortOrders(sortBy) {
 const ordersContainer = document.getElementById('orders-container');
 const orderCards = Array.from(ordersContainer.querySelectorAll('.order-card'));
 
 // Sort based on sort value
 orderCards.sort((a, b) => {
   if (sortBy === 'date-desc') {
     // Sort by date descending (newest first)
     const dateA = a.querySelector('.order-date').textContent.replace('Placed on ', '');
     const dateB = b.querySelector('.order-date').textContent.replace('Placed on ', '');
     return new Date(dateB) - new Date(dateA);
   } else if (sortBy === 'date-asc') {
     // Sort by date ascending (oldest first)
     const dateA = a.querySelector('.order-date').textContent.replace('Placed on ', '');
     const dateB = b.querySelector('.order-date').textContent.replace('Placed on ', '');
     return new Date(dateA) - new Date(dateB);
   } else if (sortBy === 'price-desc') {
     // Sort by price descending (highest first)
     const priceA = parseFloat(a.querySelector('.text-md-end strong').nextSibling.textContent.replace('$', ''));
     const priceB = parseFloat(b.querySelector('.text-md-end strong').nextSibling.textContent.replace('$', ''));
     return priceB - priceA;
   } else if (sortBy === 'price-asc') {
     // Sort by price ascending (lowest first)
     const priceA = parseFloat(a.querySelector('.text-md-end strong').nextSibling.textContent.replace('$', ''));
     const priceB = parseFloat(b.querySelector('.text-md-end strong').nextSibling.textContent.replace('$', ''));
     return priceA - priceB;
   }
   return 0;
 });
 
 // Reappend sorted order cards
 orderCards.forEach(card => {
   ordersContainer.appendChild(card);
 });
}

// Show toast notification
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
 } else if (type === 'info') {
   toast.style.borderLeft = '4px solid #0dcaf0';
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
 closeBtn.addEventListener('click', function() {
   toast.remove();
 });
 
 // Auto remove after 3 seconds
 setTimeout(() => {
   toast.remove();
 }, 3000);
}