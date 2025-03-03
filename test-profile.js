// Test script to identify alerts during profile page load
(function() {
  // Override the alert function to track calls
  const originalAlert = window.alert;
  let alertCalls = [];
  
  window.alert = function(message) {
    console.log('[ALERT INTERCEPTED]:', message);
    alertCalls.push({
      message: message,
      time: new Date().toISOString(),
      stack: new Error().stack,
      page: window.location.href
    });
    
    // Log to both console and storage
    localStorage.setItem('interceptedProfileAlerts', JSON.stringify(alertCalls));
    
    // Call the original alert
    originalAlert.call(window, message);
  };
  
  console.log('Alert interceptor installed for profile page');
  
  // Record the page load event
  const pageLoadInfo = {
    time: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent
  };
  localStorage.setItem('profilePageLoad', JSON.stringify(pageLoadInfo));
  
  // Check for initialization functions
  window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded for profile page - checking initialization');
    
    // Record which initialization functions are called
    const initFunctions = [];
    
    // Monitor key functions
    const originalInitializeData = window.initializeData;
    if (typeof originalInitializeData === 'function') {
      window.initializeData = function() {
        console.log('initializeData called');
        initFunctions.push({
          name: 'initializeData',
          time: new Date().toISOString()
        });
        localStorage.setItem('profileInitFunctions', JSON.stringify(initFunctions));
        return originalInitializeData.apply(this, arguments);
      };
    }
    
    const originalLoadUserProfile = window.loadUserProfile;
    if (typeof originalLoadUserProfile === 'function') {
      window.loadUserProfile = function() {
        console.log('loadUserProfile called');
        initFunctions.push({
          name: 'loadUserProfile',
          time: new Date().toISOString()
        });
        localStorage.setItem('profileInitFunctions', JSON.stringify(initFunctions));
        return originalLoadUserProfile.apply(this, arguments);
      };
    }
    
    // Add the test info panel
    const infoPanel = document.createElement('div');
    infoPanel.style.position = 'fixed';
    infoPanel.style.top = '10px';
    infoPanel.style.right = '10px';
    infoPanel.style.backgroundColor = 'rgba(255, 87, 34, 0.9)';
    infoPanel.style.color = 'white';
    infoPanel.style.padding = '10px';
    infoPanel.style.borderRadius = '5px';
    infoPanel.style.zIndex = '9999';
    infoPanel.style.maxWidth = '300px';
    infoPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    infoPanel.innerHTML = `
      <h3 style="margin-top: 0; font-size: 16px;">Profile Test Running</h3>
      <p style="font-size: 12px; margin-bottom: 5px;">Monitoring for alerts...</p>
      <p style="font-size: 12px; margin-bottom: 5px;">Alerts found: <span id="alert-count">0</span></p>
      <button id="view-alerts" style="font-size: 12px; padding: 5px; background: white; color: #ff5722; border: none; border-radius: 3px; cursor: pointer;">View Alerts</button>
    `;
    
    document.body.appendChild(infoPanel);
    
    // Update alert count periodically
    setInterval(function() {
      const alertCountElement = document.getElementById('alert-count');
      if (alertCountElement) {
        alertCountElement.textContent = alertCalls.length;
      }
    }, 1000);
    
    // Set up view alerts button
    document.getElementById('view-alerts').addEventListener('click', function() {
      if (alertCalls.length > 0) {
        console.table(alertCalls);
        alert(`Found ${alertCalls.length} alert(s). Check console for details.`);
      } else {
        alert('No alerts have been detected so far.');
      }
    });
  });
})(); 