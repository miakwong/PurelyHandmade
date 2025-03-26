
// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded - starting designers page initialization");
  
  // DataService可用性
  if (typeof DataService === 'undefined') {
    console.error('DataService is undefined, cannot get API data');
    showToast('Data service unavailable, please refresh the page or contact the administrator', 'danger');
    return;
  }
  
  console.log("DataService Loaded:", typeof DataService);
  
  // 确保数据初始化
  if (typeof window.initializeData === 'function') {
    window.initializeData();
  }
  
  // 加载设计师数据
  loadDesignersFromAPI();
  
  // 加载特色产品
  loadFeaturedDesigns();
});

// 从API加载设计师数据并渲染
async function loadDesignersFromAPI() {
  console.log("Loading designers from API");
  try {
    const designersContainer = document.getElementById('designers-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (!designersContainer) {
      console.error('Designer container element not found');
      return;
    }
    
    // 显示加载状态
    designersContainer.innerHTML = `
      <div class="col-12 text-center" id="loading-indicator">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading designers from API...</p>
      </div>
    `;
    
    console.log("Requesting API data...");
    // 从API获取设计师数据
    const designersResponse = await DataService.getAllDesigners();
    console.log("API response:", designersResponse);
    
    // 提取设计师数据
    let designers = [];
    
    if (designersResponse && designersResponse.success) {
      // 直接获取 data.designers 数组
      if (designersResponse.data && Array.isArray(designersResponse.data.designers)) {
        designers = designersResponse.data.designers;
      }
    }
    
    console.log(`Successfully retrieved ${designers.length} designers:`, designers);
    
    // 移除加载指示器
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    // 如果没有找到设计师数据，显示空状态
    if (!designers || designers.length === 0) {
      designersContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="bi bi-person-x fs-1 d-block mb-3"></i>
            <h3>No designers data available</h3>
            <p>We are adding more talented artisans to the platform.</p>
          </div>
        </div>
      `;
      return;
    }
    
    // 生成设计师卡片
    let designersHTML = '';
    designers.forEach(designer => {
      // 准备社交媒体链接 - 使用默认空对象避免错误
      const social = designer.social || {};
      const instagramUrl = social.instagram || '#';
      const pinterestUrl = social.pinterest || '#';
      const etsyUrl = social.etsy || '#';
      
      // 确定是否显示每个社交媒体图标
      const showInstagram = social.instagram ? '' : 'style="display:none"';
      const showPinterest = social.pinterest ? '' : 'style="display:none"';
      const showEtsy = social.etsy ? '' : 'style="display:none"';
      
      // 处理设计师图片
      const designerImage = designer.image 
        ? `/~xzy2020c/PurelyHandmade//img/designers/${designer.image}`
        : '/~xzy2020c/PurelyHandmade//img/designers/placeholder.jpg';

      
      // 处理设计师简介，确保有合适的长度
      const designerBio = designer.bio || 'No bio available';
      const shortBio = designerBio.length > 150 ? designerBio.substring(0, 150) + '...' : designerBio;
      
      designersHTML += `
        <div class="col-md-4 mb-4">
          <a href="designer-page.html?id=${designer.id}" class="text-decoration-none">
            <div class="designer-card">
              <div class="designer-image">
                <img src="${designerImage}" class="designer-img w-100" alt="${designer.name}">
              </div>
              <div class="designer-bio">
                <h3 class="designer-name">${designer.name}</h3>
                <p class="designer-specialty">${designer.specialty || 'Handmade Artist'}</p>
                <p>${shortBio}</p>
                <div class="social-icons">
                  <a href="${instagramUrl}" target="_blank" onclick="event.stopPropagation()" ${showInstagram}><i class="fab fa-instagram"></i></a>
                  <a href="${pinterestUrl}" target="_blank" onclick="event.stopPropagation()" ${showPinterest}><i class="fab fa-pinterest"></i></a>
                  <a href="${etsyUrl}" target="_blank" onclick="event.stopPropagation()" ${showEtsy}><i class="fab fa-etsy"></i></a>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;
    });
    
    designersContainer.innerHTML = designersHTML;
    console.log("Designers data rendered");
    
  } catch (error) {
    console.error('Error loading designers data:', error);
    
    const designersContainer = document.getElementById('designers-container');
    if (designersContainer) {
      designersContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
            <h3>Failed to load designers data</h3>
            <p>${error.message || 'Please try again later'}</p>
            <button class="btn btn-outline-danger mt-3" onclick="loadDesignersFromAPI()">Retry</button>
          </div>
        </div>
      `;
    }
    
    showToast('Failed to load designers data: ' + (error.message || 'Unknown error'), 'danger');
  }
}

// 加载特色设计和展示设计师作品
async function loadFeaturedDesigns() {
  console.log("Loading featured designs");
  try {
    const featuredDesignsContainer = document.getElementById('featured-designs-container');
    
    if (!featuredDesignsContainer) {
      console.error('Featured designs container element not found');
      return;
    }
    
    // 获取特色设计师数据
    let featuredDesigners = [];
    try {
      const response = await DataService.getFeaturedDesigners();
      console.log("Featured designers API response:", response);
      
      if (response && response.success) {
        if (response.data && Array.isArray(response.data.designers)) {
          featuredDesigners = response.data.designers.filter(d => d.featured);
        } else if (response.data && typeof response.data === 'object') {
          const designers = Object.values(response.data);
          if (designers.length === 1 && Array.isArray(designers[0])) {
            featuredDesigners = designers[0].filter(d => d.featured);
          } else {
            featuredDesigners = designers.filter(d => d.featured);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to get featured designers, trying to filter from all designers:', e);
      // 失败时尝试从全部设计师中筛选特色设计师
      const allDesignersResponse = await DataService.getAllDesigners();
      
      if (allDesignersResponse && allDesignersResponse.success) {
        if (allDesignersResponse.data && Array.isArray(allDesignersResponse.data.designers)) {
          featuredDesigners = allDesignersResponse.data.designers.filter(d => d.featured);
        } else if (allDesignersResponse.data && typeof allDesignersResponse.data === 'object') {
          const allDesigners = Object.values(allDesignersResponse.data);
          if (allDesigners.length === 1 && Array.isArray(allDesigners[0])) {
            featuredDesigners = allDesigners[0].filter(d => d.featured);
          } else {
            featuredDesigners = allDesigners.filter(d => d.featured);
          }
        }
      }
    }
    
    console.log(`Found ${featuredDesigners.length} featured designers`);
    
    // 如果没有特色设计师，显示全部设计师的作品
    if (featuredDesigners.length === 0) {
      console.log("No featured designers, trying to get all designers");
      const allDesignersResponse = await DataService.getAllDesigners();
      
      if (allDesignersResponse && allDesignersResponse.success && 
          allDesignersResponse.data && Array.isArray(allDesignersResponse.data.designers)) {
        featuredDesigners = allDesignersResponse.data.designers.slice(0, 3);  // 只取前3个
      }
    }
    
    // 如果仍然没有设计师数据，显示空状态
    if (featuredDesigners.length === 0) {
      featuredDesignsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <p>No featured designs available.</p>
          </div>
        </div>
      `;
      return;
    }
    
    // 生成特色设计
    let featuredHTML = '';
    featuredDesigners.forEach(designer => {
      // 准备设计师集合描述
      const collectionDescription = designer.collectionDescription || 
        `Explore ${designer.name}'s handmade collection. Each piece is crafted with exquisite craftsmanship and unique creativity.`;
      
      featuredHTML += `
        <div class="col-md-4 mb-4">
          <div class="featured-design-card">
            <h4 class="mb-3">${designer.name}'s Collection</h4>
            <p class="mb-3">${collectionDescription}</p>
            <div class="mt-3">
              <a href="./~xzy2020c/PurelyHandmade/views/product/product-list.html?designer=${designer.id}" class="btn btn-primary">Browse Collection</a>
            </div>
          </div>
        </div>
      `;
    });
    
    featuredDesignsContainer.innerHTML = featuredHTML;
    console.log("Featured designs rendered");
    
  } catch (error) {
    console.error('Error loading featured designs:', error);
    
    const featuredDesignsContainer = document.getElementById('featured-designs-container');
    if (featuredDesignsContainer) {
      featuredDesignsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center">
            <p>Failed to load featured designer's works. Please try again later.</p>
          </div>
        </div>
      `;
    }
  }
}

// 显示通知提示
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
        console.error('Toast notification container not found');
    return;
  }
  
  const toastId = 'toast-' + Date.now();
  
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();
  
  //自动移除toast元素
  toastElement.addEventListener('hidden.bs.toast', function () {
    this.remove();
  });
}
