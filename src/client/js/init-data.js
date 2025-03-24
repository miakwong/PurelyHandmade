// Initialize product data in localStorage
window.initializeData = function() {
  console.log('Data initialization is disabled. Using API data instead.');
  
  // Check that API base URL is correctly set
  if (typeof DataService !== 'undefined') {
    console.log('API Base URL is set to:', DataService.apiRequest ? '/api' : 'undefined');
    
    // Test API endpoints accessibility
    testApiEndpoints();
  } else {
    console.error('DataService is not defined. Cannot initialize data.');
  }
  
  return;
  
  // The code below is no longer used since we're using API data
  /*
  console.log('Initializing data...');
  
  // Get today's date for recent listings
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
};

// Test if API endpoints are accessible
async function testApiEndpoints() {
  console.log('Testing API endpoints...');
  
  // List of important endpoints to test
  const endpoints = [
    '/products',
    '/categories',
    '/designers'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing API endpoint: ${endpoint}`);
      const response = await fetch(`/api${endpoint}`);
      const status = response.status;
      console.log(`API endpoint ${endpoint} status: ${status}`);
      
      if (status === 200) {
        try {
          const data = await response.json();
          console.log(`API endpoint ${endpoint} data:`, data);
          
          // Analyze response structure
          if (data.success) {
            console.log(`API endpoint ${endpoint} success: true`);
            
            // Check specific data structures based on endpoint
            if (endpoint === '/products' && data.data && data.data.products) {
              const products = data.data.products;
              console.log(`Products count: ${products.length}`);
              if (products.length > 0) {
                console.log(`Sample product:`, products[0]);
                console.log(`Product has 'featured' field: ${products[0].hasOwnProperty('featured')}`);
              }
            }
            
            if (endpoint === '/designers' && data.data && data.data.designers) {
              const designers = data.data.designers;
              console.log(`Designers count: ${designers.length}`);
              if (designers.length > 0) {
                console.log(`Sample designer:`, designers[0]);
                console.log(`Designer has 'featured' field: ${designers[0].hasOwnProperty('featured')}`);
              }
            }
            
            if (endpoint === '/categories' && data.data && data.data.categories) {
              const categories = data.data.categories;
              console.log(`Categories count: ${categories.length}`);
              if (categories.length > 0) {
                console.log(`Sample category:`, categories[0]);
                console.log(`Category has 'featured' field: ${categories[0].hasOwnProperty('featured')}`);
              }
            }
          } else {
            console.error(`API endpoint ${endpoint} success: false, message: ${data.message || 'No message'}`);
          }
        } catch (jsonError) {
          console.error(`API endpoint ${endpoint} returned non-JSON response:`, jsonError);
        }
      } else {
        console.error(`API endpoint ${endpoint} returned status ${status}`);
      }
    } catch (error) {
      console.error(`API endpoint ${endpoint} is not accessible:`, error);
    }
  }
}

// Auto-initialize data when script loads
window.initializeData();
console.log('init-data.js script completed'); 