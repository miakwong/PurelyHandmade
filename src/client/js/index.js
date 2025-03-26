/**
 * Main homepage script
 */

console.log('Index.js loaded successfully');

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded in index.js');
  
  // Load featured designers
  if (typeof window.loadDesigners === 'function') {
    console.log('Loading featured designers...');
    window.loadDesigners('designers-container', { featured: true, limit: 4 });
  } else {
    console.error('loadDesigners function not available');
  }
});

// Ensure data initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('index.html: DOM content loaded');
    console.log('DataService exists:', typeof DataService !== 'undefined');
    console.log('window.loadProducts exists:', typeof window.loadProducts === 'function');
    console.log('window.loadCategories exists:', typeof window.loadCategories === 'function');
    console.log('window.loadDesigners exists:', typeof window.loadDesigners === 'function');
    
    // Verify all containers exist in the DOM
    console.log('Checking containers:');
    console.log('- category-cards-container exists:', !!document.getElementById('category-cards-container'));
    console.log('- new-arrivals-container exists:', !!document.getElementById('new-arrivals-container'));
    console.log('- best-sellers-container exists:', !!document.getElementById('best-sellers-container'));
    console.log('- designers-container exists:', !!document.getElementById('designers-container'));
    
    // Wait a short delay to ensure all scripts are fully loaded
    setTimeout(() => {
        console.log('Executing main initialization with delay');
        console.log('DataService exists after delay:', typeof DataService !== 'undefined');
        console.log('window.loadProducts exists after delay:', typeof window.loadProducts === 'function');
        console.log('window.loadCategories exists after delay:', typeof window.loadCategories === 'function');
        console.log('window.loadDesigners exists after delay:', typeof window.loadDesigners === 'function');
        
        if (typeof window.initializeData === 'function') {
            window.initializeData();
        }

        // Load featured categories
        loadFeaturedCategories();

        // Load new arrivals
        loadNewArrivals();
        
        // Load best sellers
        loadBestSellers();
        
        // Try updating auth state and cart count again to ensure correct state
        setTimeout(() => {
            console.log("Document fully loaded, updating auth state again");
            if (typeof window.updateAuthButton === 'function') {
                window.updateAuthButton();
            }
            
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }
        }, 500);
    }, 300);  
});

// Load featured categories
function loadFeaturedCategories() {
    console.log('Calling loadFeaturedCategories()');
    
    // Get a direct reference to the container element
    const categoriesContainer = document.getElementById('category-cards-container');
    if (!categoriesContainer) {
        console.error('category-cards-container element not found in DOM');
        return;
    }
    
    // Check if the API function exists
    if (typeof window.loadCategories !== 'function') {
        console.error('window.loadCategories is not defined!');
        return;
    }
    
    // Pass the container ID directly - ensure it's a string
    console.log('Calling window.loadCategories with container ID:', 'category-cards-container');
    window.loadCategories('category-cards-container', {
        limit: 6,
        featured: true
    });
    console.log('loadCategories() called with container ID: category-cards-container');
}

// Load new arrivals
function loadNewArrivals() {
    console.log('Calling loadNewArrivals()');
    
    // Get a direct reference to the container element
    const newArrivalsContainer = document.getElementById('new-arrivals-container');
    if (!newArrivalsContainer) {
        console.error('new-arrivals-container element not found in DOM');
        return;
    }
    
    // Check if the API function exists
    if (typeof window.loadProducts !== 'function') {
        console.error('window.loadProducts is not defined!');
        return;
    }
    
    // Pass the container ID directly - ensure it's a string
    console.log('Calling window.loadProducts with container ID:', 'new-arrivals-container');
    window.loadProducts('new-arrivals-container', {
        limit: 4,
        newArrivals: true
    });
    console.log('loadProducts() called with container ID: new-arrivals-container');
}

// Load best sellers
function loadBestSellers() {
    console.log('Calling loadBestSellers()');
    console.log('window.loadProducts exists:', typeof window.loadProducts === 'function');
    
    // Get a direct reference to the container element
    const bestSellersContainer = document.getElementById('best-sellers-container');
    if (!bestSellersContainer) {
        console.error('best-sellers-container element not found in DOM');
        return;
    }
    
    if (typeof window.loadProducts !== 'function') {
        console.error('window.loadProducts is not defined yet!');
        // Try again after a small delay
        setTimeout(() => {
            console.log('Retrying loadBestSellers after delay');
            if (typeof window.loadProducts === 'function') {
                // Pass the DOM element directly to avoid ID resolution issues
                window.loadProducts('best-sellers-container', {
                    limit: 4,
                    featured: true
                });
            } else {
                console.error('window.loadProducts is still not defined after delay');
                // Fallback: Use the container element directly
                bestSellersContainer.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p class="text-danger">Error loading best sellers: API function not available</p>
                    </div>
                `;
            }
        }, 500);
        return;
    }
    
    // Pass the container ID directly
    console.log('Calling window.loadProducts with container ID:', 'best-sellers-container');
    window.loadProducts('best-sellers-container', {
        limit: 4,
        featured: true
    });
    console.log('loadProducts() called with container ID: best-sellers-container');
}

// Add to cart
async function addToCart(productId, quantity) {
    try {
        // Get product details from the API
        const result = await DataService.getProductById(productId);
        
        if (!result || !result.success) {
            console.error(`Failed to get product with ID ${productId}`);
            showToast('Product not found', 'error');
            return;
        }
        
        const product = result.product;
        
        // Add product to cart using DataService
        DataService.addToCart(product, quantity);
        
        // Update cart count in navbar
        updateCartCount();
        
        // Show success message
        showToast(`${product.name} added to cart!`);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showToast('Failed to add product to cart', 'error');
    }
}

// Show toast message
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `modern-toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
            <div class="message">${message}</div>
        </div>
        <button class="close-btn"><i class="bi bi-x"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Automatically disappear after 3 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Update cart count
function updateCartCount() {
    const badge = document.querySelector('#cart-badge');
    
    if (!badge) return;
    
    // Get cart count using DataService
    const count = DataService.getCartItemCount();
    
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}
