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
  
  // Function to load the user profile data from localStorage
  window.loadUserProfile = function() {
    console.log('Loading user profile data...');
    
    try {
      // 尝试从localStorage中获取用户数据
      const currentUserData = localStorage.getItem('currentUser');
      if (!currentUserData) {
        console.log('No user data found in localStorage');
        // 显示更友好的消息
        return;
      }
      
      let userData;
      try {
        userData = JSON.parse(currentUserData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        throw new Error('User data format is invalid');
      }
      
      console.log('User data loaded successfully');
      
      // 更新DOM元素
      updateProfileUI(userData);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      alert('加载用户资料时出错: ' + error.message);
    }
  };
  
  // 更新用户界面的辅助函数
  function updateProfileUI(user) {
    if (!user) {
      console.warn('No user data provided to updateProfileUI');
      return;
    }
    
    // 更新个人资料字段（如果存在）
    const elementsToUpdate = {
      'profile-username': user.username,
      'profile-email': user.email,
      'profile-full-name': user.firstName && user.lastName ? 
        `${user.firstName} ${user.lastName}` : user.username,
      'profile-role': user.role || 'User',
      'profile-joined': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
    };
    
    for (const [elementId, value] of Object.entries(elementsToUpdate)) {
      const element = document.getElementById(elementId);
      if (element && value) {
        element.textContent = value;
      }
    }
    
    // 同时更新任何表单字段
    const formFields = {
      'inputUsername': user.username,
      'inputEmail': user.email,
      'inputFullName': user.firstName && user.lastName ? 
        `${user.firstName} ${user.lastName}` : user.username
    };
    
    for (const [fieldId, value] of Object.entries(formFields)) {
      const field = document.getElementById(fieldId);
      if (field && value) {
        field.value = value;
      }
    }
  }
  
  // Add handler for profile update form submission
  window.setupProfileForm = function() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
          const formData = new FormData(profileForm);
          const currentUserData = localStorage.getItem('currentUser');
          
          if (!currentUserData) {
            alert('用户未登录，无法更新个人资料');
            return;
          }
          
          let userData = JSON.parse(currentUserData);
          
          // 从表单收集数据并更新用户对象
          for (const [key, value] of formData.entries()) {
            userData[key] = value;
          }
          
          // 保存回localStorage
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // 显示成功消息
          alert('个人资料已更新');
          
          // 重新加载个人资料
          window.loadUserProfile();
        } catch (error) {
          console.error('Error updating profile:', error);
          alert('更新个人资料时出错: ' + error.message);
        }
      });
    }
  };
  
  // Check for initialization functions
  window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded for profile page - checking initialization');
    
    // Load the user profile data
    window.loadUserProfile();
    
    // Setup the profile update form
    window.setupProfileForm();
    
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