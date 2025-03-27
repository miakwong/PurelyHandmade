/**
 * API Loader Helper
 * 
 * This script can be included in any page that needs to use the API functions.
 * It ensures that all required scripts are loaded and sets up the needed functionality.
 */

// Log when this script loads
console.log('API Loader Helper loaded at', new Date().toISOString());

// Define base URL for scripts - this ensures paths work in all environments
let API_HELPER_BASE_URL = '/~xzy2020c/PurelyHandmade';

// Function to load a script and return a promise that resolves when it's loaded
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Load scripts in order
    script.defer = false; // Don't defer loading
    
    script.onload = () => {
      console.log(`Script loaded successfully: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Error loading script: ${src}`, error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}

// Function to ensure all API-related scripts are loaded
function ensureApiScriptsLoaded() {
  // Check if CONFIG is already defined
  const configNeeded = typeof CONFIG === 'undefined';
  
  // Define the scripts we need to load in the correct order
  const scriptsToLoad = [];
  
  // First, load config.js if it's not already loaded
  if (configNeeded) {
    scriptsToLoad.push(`${API_HELPER_BASE_URL}/js/config.js`);
  }
  
  // Then load the other required scripts
  scriptsToLoad.push(
    `${API_HELPER_BASE_URL}/js/data-service.js`,
    `${API_HELPER_BASE_URL}/js/api-data-loader.js`
  );
  
  // Check if scripts are already loaded
  const loadedScripts = Array.from(document.querySelectorAll('script')).map(script => script.src);
  
  // Load scripts in sequence
  return scriptsToLoad.reduce((promise, scriptSrc) => {
    return promise.then(() => {
      const fullSrc = new URL(scriptSrc, window.location.origin).href;
      
      // Skip already loaded scripts
      if (loadedScripts.some(src => src === fullSrc || src.includes(scriptSrc))) {
        console.log(`Script already loaded: ${scriptSrc}`);
        return Promise.resolve();
      }
      
      console.log(`Loading script: ${scriptSrc}`);
      return loadScript(scriptSrc);
    });
  }, Promise.resolve())
  .then(() => {
    console.log('All API scripts loaded successfully');
    // Verify critical objects are available
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG is not defined after loading scripts');
      return false;
    }
    if (typeof DataService === 'undefined') {
      console.error('DataService is not defined after loading scripts');
      return false;
    }
    return true;
  })
  .catch(error => {
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