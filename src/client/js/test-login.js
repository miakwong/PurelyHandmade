// Test script to identify alerts during login
(function() {
  // Override the alert function to track calls
  const originalAlert = window.alert;
  let alertCalls = [];
  
  window.alert = function(message) {
    console.log('[ALERT INTERCEPTED]:', message);
    alertCalls.push({
      message: message,
      time: new Date().toISOString(),
      stack: new Error().stack
    });
    
    // Log to both console and storage
    localStorage.setItem('interceptedAlerts', JSON.stringify(alertCalls));
    
    // Call the original alert
    originalAlert.call(window, message);
  };
  
  console.log('Alert interceptor installed - login test ready');
  
  // Function to run the test
  window.runLoginTest = function() {
    console.log('Starting login test...');
    
    // Clear previous test results
    localStorage.removeItem('interceptedAlerts');
    alertCalls = [];
    
    // Attempt login
    const identifier = 'admin';
    const password = 'admin123';
    
    document.getElementById('loginIdentifier').value = identifier;
    document.getElementById('loginPassword').value = password;
    
    console.log('Submitting login form...');
    
    // Submit the form
    const form = document.getElementById('login-form');
    if (form) {
      // Prevent default form submission and use AJAX instead
      const formData = new FormData(form);
      
      fetch('/login', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Login response:', data);
        if (data.success) {
          window.location.href = data.redirect;
        } else {
          alert(data.message || '登录失败');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('登录请求失败，请稍后再试');
      });
      
      console.log('Login form submitted via AJAX');
    } else {
      console.error('Login form not found');
    }
  };
  
  // Add a button to the page to run the test
  const button = document.createElement('button');
  button.innerText = 'Run Login Test';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.left = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '10px';
  button.style.backgroundColor = '#ff5722';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  
  button.onclick = window.runLoginTest;
  
  // Add the button to the page after it loads
  window.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(button);
    console.log('Test button added to page');
    
    // 拦截表单默认提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        window.runLoginTest();
      });
    }
  });
})(); 