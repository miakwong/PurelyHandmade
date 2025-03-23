// Initialize product data in localStorage
window.initializeData = function() {
  console.log('Data initialization is disabled. Using API data instead.');
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
  
  // Categories
  const categories = [
    { id: 1, name: 'Ceramics', slug: 'ceramics', description: 'Handcrafted ceramic items', image: '/src/client/img/ceramics-bg.JPG' },
    { id: 2, name: 'Wood Crafts', slug: 'wood-crafts', description: 'Handmade wooden items and carvings', image: '/src/client/img/wood-bg.JPG' },
    { id: 3, name: 'Textiles', slug: 'textiles', description: 'Handwoven and textile-based products', image: '/src/client/img/textiles-bg.JPG' }
  ];
  
  // Store categories
  localStorage.setItem('categories', JSON.stringify(categories));
  */
};

// Auto-initialize data when script loads
window.initializeData();
console.log('init-data.js script completed'); 