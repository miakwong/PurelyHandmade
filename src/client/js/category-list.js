
// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.initializeData === 'function') {
        window.initializeData();
    }

    // 加载所有分类
    loadCategories();
});

// 加载分类数据
async function loadCategories() {
    const container = document.getElementById('categories-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    try {
        // 显示加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // 使用 api-data-loader 加载分类数据
        const categoryResponse = await DataService.getAllCategories();
        console.log('Category API Response:', categoryResponse);

        // 隐藏加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // 确保 API 返回的数据结构正确
        const categories = categoryResponse?.data?.categories || [];

        console.log('Categories Data:', categories);
        console.log('Full API Response:', categoryResponse);

        // 检查分类是否存在
        if (!Array.isArray(categories) || categories.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="empty-state">
                    <i class="bi bi-info-circle"></i>
                    <h3>No Categories Found</h3>
                    <p>We couldn't find any product categories.</p>
                    </div>
                </div>
            `;
            return;
        }

        // 获取产品数量的缓存数据
        let productCountsCache = JSON.parse(localStorage.getItem('productCounts')) || {};

        /// 渲染分类卡片
        const categoriesHtml = categories.map(category => {
            const categoryImage = category.image 
                ? CONFIG.getImagePath(category.image) // 使用 CONFIG.getImagePath 动态构建图片路径
                : CONFIG.getImagePath('/category/placeholder.jpg'); // 使用默认占位符图片

            // 获取分类的产品数量(featured)
            console.log('One Categoriy Data:', category);    
    
            const productCount = productCountsCache[category.id] || 0;
            
            return `
                <div class="col-md-4 col-sm-6 mb-4 fade-in">
                <a href="/~xzy2020c/PurelyHandmade/views/products/product-list.html?id=${category.id}" class="text-decoration-none">
                <div class="category-card h-100">
                    <div class="category-img-container position-relative">
                        <img src="${categoryImage}" alt="${category.name}" class="category-img">
                        <div class="category-overlay">
                            <h4 class="m-0">${category.name}</h4>
                        </div>
                    </div>
                    <div class="category-content">
                        <h3 class="category-title">${category.name}</h3>
                        <p class="category-description">${category.description || 'Explore our collection of handcrafted products.'}</p>
                        <div class="category-products-count">
                            <i class="bi bi-box-seam me-1"></i> ${category.productCount || 0} product${category.productCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                </a>
                </div>
            `;
        })
        
        container.innerHTML = categoriesHtml;
    } catch (error) {
            WINDOW.error('Error loading categories:', error);
        
        // 显示错误信息
        container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="empty-state">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Error Loading Categories</h3>
            <p>There was a problem loading the categories. Please try again later.</p>
            </div>
        </div>
        `;
        
        // 显示错误信息
        container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="empty-state">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Error Loading Categories</h3>
            <p>There was a problem loading the categories. Please try again later.</p>
            </div>
        </div>
        `;

        // 隐藏加载指示器
        if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
        }
    }
    }