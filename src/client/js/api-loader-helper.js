/**
 * API Loader Helper
 * 
 * This script can be included in any page that needs to use the API functions.
 * It ensures that all required scripts are loaded and sets up the needed functionality.
 */

// Log when this script loads
console.log('API Loader Helper loaded at', new Date().toISOString());

// Function to ensure all API-related scripts are loaded
function ensureApiScriptsLoaded() {
  const requiredScripts = [
    `${CONFIG.getJsPath('data-service.js')}`,
    `${CONFIG.getJsPath('api-data-loader.js')}`
  ];
  
  // Track which scripts we've added
  const addedScripts = [];
  
  // Check if scripts are already loaded
  const loadedScripts = Array.from(document.querySelectorAll('script')).map(script => script.src);
  
  // Add any missing scripts
  requiredScripts.forEach(scriptSrc => {
    const fullSrc = new URL(scriptSrc, window.location.origin).href;
    if (!loadedScripts.some(src => src === fullSrc)) {
      console.log(`Adding missing script: ${scriptSrc}`);
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = false; // Load scripts in order
      script.defer = false; // Don't defer loading
      addedScripts.push(new Promise((resolve, reject) => {
        script.onload = () => {
          console.log(`Script loaded successfully: ${scriptSrc}`);
          resolve();
        };
        script.onerror = (error) => {
          console.error(`Error loading script: ${scriptSrc}`, error);
          reject(error);
        };
      }));
      document.head.appendChild(script);
    }
  });
  
  // Return a promise that resolves when all scripts are loaded
  return Promise.all(addedScripts).then(() => {
    console.log('All API scripts loaded successfully');
    // Verify DataService is available
    if (typeof DataService === 'undefined') {
      console.error('DataService is not defined after loading scripts');
      return false;
    }
    return true;
  }).catch(error => {
    console.error('Error loading API scripts:', error);
    return false;
  });
}

// Fix for when the script loads after the page is complete
if (document.readyState === 'complete') {
  ensureApiScriptsLoaded().then(success => {
    if (success) {
      // Check if there are containers waiting for data
      const commonContainers = [
        'new-products-container',
        'product-container',
        'designers-container',
        'on-sale-products',
        'products-container',
        'product-detail-container'
      ];
      
      commonContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
          console.log(`Found container: ${containerId}, triggering data load`);
          // Try to trigger the appropriate load function based on the container
          if (containerId.includes('product') && typeof window.loadProducts === 'function') {
            console.log(`Auto-loading products for container: "${containerId}"`);
            window.loadProducts(containerId);
          } else if (containerId.includes('designer') && typeof window.loadDesigners === 'function') {
            console.log(`Auto-loading designers for container: "${containerId}"`);
            window.loadDesigners(containerId);
          }
        }
      });
    }
  });
} else {
  // Page is still loading, wait for it to be ready
  window.addEventListener('load', function() {
    ensureApiScriptsLoaded();
  });
}

// Make this function available globally
window.ensureApiScriptsLoaded = ensureApiScriptsLoaded; 