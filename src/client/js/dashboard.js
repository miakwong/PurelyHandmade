// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 首先初始化导航栏
    if (typeof initNavbar === 'function') {
        initNavbar().catch(err => {
            console.error('Navbar initialization error:', err);
        });
    }

    // 检查用户权限并加载数据
    checkAdminAccess();
});

// 检查管理员访问权限
function checkAdminAccess() {
    const user = DataService.getCurrentUser();
    if (!user || !(user.isAdmin === 1 || user.role === 'admin')) {
        window.location.href = CONFIG.getViewPath('auth/login.html');
        return;
    }
    loadDashboardData();
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        // 获取统计数据
        const statsResponse = await fetch(`${CONFIG.getApiPath('admin/statistics')}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DataService.getAuthToken()}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        if (!statsResponse.ok) {
            throw new Error(`Statistics API error: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        if (statsData.success) {
            updateDashboardStats(statsData.data);
        }

        // 加载最近订单
        const ordersResponse = await fetch(`${CONFIG.getApiPath('admin/orders')}?limit=5`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DataService.getAuthToken()}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        if (!ordersResponse.ok) {
            throw new Error(`Orders API error: ${ordersResponse.status}`);
        }

        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
            updateOrdersTable(ordersData.data.orders);
        }

    } catch (error) {
        console.error('Dashboard data loading error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger mt-3';
        errorMessage.textContent = '加载数据失败: ' + error.message;
        
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertBefore(errorMessage, container.firstChild);
        }
    }
}

// 更新统计数据
function updateDashboardStats(data) {
    try {
        // 产品统计
        const totalProducts = document.getElementById('total-products');
        const activeProducts = document.getElementById('active-products');
        if (totalProducts) totalProducts.textContent = data.products?.total || '0';
        if (activeProducts) activeProducts.textContent = `(${data.products?.active || '0'} active)`;

        // 订单统计
        const totalOrders = document.getElementById('total-orders');
        const pendingOrders = document.getElementById('pending-orders');
        if (totalOrders) totalOrders.textContent = data.orders?.total || '0';
        if (pendingOrders) pendingOrders.textContent = `(${data.orders?.pending || '0'} pending)`;

        // 收入统计
        const totalRevenue = document.getElementById('total-revenue');
        if (totalRevenue) totalRevenue.textContent = formatCurrency(data.orders?.revenue || 0);

        // 用户统计
        const totalUsers = document.getElementById('total-users');
        const adminUsers = document.getElementById('admin-users');
        if (totalUsers) totalUsers.textContent = data.users?.total || '0';
        if (adminUsers) adminUsers.textContent = `(${data.users?.admins || '0'} admins)`;
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// 更新订单表格
function updateOrdersTable(orders) {
    try {
        const tableBody = document.getElementById('recent-orders-table');
        if (!tableBody) return;

        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No orders found</td>
                </tr>
            `;
            return;
        }

        const html = orders.map(order => {
            const date = new Date(order.orderDate).toLocaleDateString();
            const status = order.status || 'pending';
            const statusClass = getStatusClass(status);
            
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.username || 'Unknown'}</td>
                    <td>${date}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td>${formatCurrency(order.totalAmount)}</td>
                    <td>
                        <a href="${CONFIG.getViewPath('admin/orders.html')}?id=${order.id}" 
                           class="btn btn-sm btn-primary">
                            <i class="bi bi-eye"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = html;
    } catch (error) {
        console.error('Error updating orders table:', error);
    }
}

// 辅助函数
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function getStatusClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'shipped': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return classes[status.toLowerCase()] || 'bg-secondary';
}

// 刷新仪表盘数据
function refreshDashboard() {
    loadDashboardData();
}