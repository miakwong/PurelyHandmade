/**
 * Index Page Script
 * 主页脚本
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
