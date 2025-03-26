

const UIHelpers = {
  // Debug 
  DEBUG_MODE: true,
  performanceRecords: [],


  recordPerformance: function(action) {
    if (!this.DEBUG_MODE) return;
    const timestamp = new Date().toISOString();
    this.performanceRecords.push(`[${timestamp}] ${action}`);
    console.log(`[DEBUG] Performance Recorded: ${action}`);
  },

  
  getPerformanceLogs: function() {
    return this.performanceRecords;
  },

  loadNavbar: function(containerId = 'navbar-placeholder') {
    this.recordPerformance('loadNavbar Called');
    return new Promise((resolve, reject) => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Navbar container #${containerId} not found`);
        return reject(new Error(`Navbar container #${containerId} not found`));
      }
      
      fetch('/src/client/assets/layout/navbar.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load navbar (${response.status})`);
          }
          return response.text();
        })
        .then(html => {
          container.innerHTML = html;
          console.log('Navbar loaded successfully');
          
          setTimeout(() => {
            this.updateAuthState();
            if (typeof this.updateCartCount === 'function') {
              this.updateCartCount().catch(err => console.error('Error updating cart count:', err));
            }
          }, 100);
          
          resolve();
        })
        .catch(error => {
          console.error('Error loading navbar:', error);
          container.innerHTML = '<div class="alert alert-danger">Failed to load navigation bar. Please check console for details.</div>';
          reject(error);
        });
    });
  },

 
  loadFooter: function(containerId = 'footer-placeholder') {
    this.recordPerformance('loadFooter Called');
    return new Promise((resolve, reject) => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Footer container #${containerId} not found`);
        return resolve(); 
      }
      
      fetch('/src/client/assets/layout/footer.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load footer (${response.status})`);
          }
          return response.text();
        })
        .then(html => {
          container.innerHTML = html;
          console.log('Footer loaded successfully');
          resolve();
        })
        .catch(error => {
          console.error('Error loading footer:', error);
          container.innerHTML = '<div class="alert alert-danger">Failed to load footer. Please check console for details.</div>';
          reject(error);
        });
    });
  },


  updateAuthState: function() {
    this.recordPerformance('updateAuthState Called');
    try {
      const currentUser = DataService.getCurrentUser();
      const loginButton = document.getElementById('login-button');
      const registerButton = document.getElementById('register-button');
      const profileButton = document.getElementById('profile-button');
      const orderHistoryButton = document.getElementById('order-history-button');
      const logoutButton = document.getElementById('logout-button');
      const adminButton = document.getElementById('admin-button');

      if (!loginButton || !registerButton) {
        console.warn('Could not find authentication buttons in navbar');
        return;
      }

      if (currentUser) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';

        if (profileButton) profileButton.style.display = 'block';
        if (orderHistoryButton) orderHistoryButton.style.display = 'block';

        if (logoutButton) {
          logoutButton.style.display = 'block';
          logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            DataService.logout();
            window.location.href = '/';
          });
        }

        if (currentUser.isAdmin === true && adminButton) {
          adminButton.style.display = 'block';
        }
        
        console.log('User is logged in, showing logged-in state');
      } else {
        loginButton.style.display = 'block';
        registerButton.style.display = 'block';

        if (profileButton) profileButton.style.display = 'none';
        if (orderHistoryButton) orderHistoryButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (adminButton) adminButton.style.display = 'none';
        
        console.log('User is not logged in, showing login/register buttons');
      }
    } catch (e) {
      console.error('Error updating auth state:', e);
    }
  }
};


Object.freeze(UIHelpers);

window.UIHelpers = UIHelpers;
