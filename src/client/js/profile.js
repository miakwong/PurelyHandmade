// Description: JavaScript file for 'profile.html' page.
// Single DOMContentLoaded event listener to handle all initialization
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded - initializing page');
  
    // Set up initial user data
    initUserProfile();
  
    // Set up event listeners
    setupEventListeners();
  
    // Show admin tab if user is admin
    checkAdminStatus();
  
    // Load saved addresses
    loadAddresses();
  
    // Initialize all modals with proper options
    setTimeout(() => {
      document.querySelectorAll('.modal').forEach(modal => {
        try {
          new bootstrap.Modal(modal, {
            backdrop: true,
            keyboard: true,
            focus: true
          });
        } catch (err) {
          console.error(`Failed to initialize modal #${modal.id}:`, err);
        }
      });
    }, 100);
  
    // Set up tab change handlers
    const tabEls = document.querySelectorAll('a[data-bs-toggle="tab"]');
    if (tabEls.length > 0) {
      tabEls.forEach(function (tabEl) {
        tabEl.addEventListener('shown.bs.tab', function (event) {
          const targetId = event.target.getAttribute('data-bs-target');
          if (targetId === '#users-panel') {
            loadUsers();
          } else if (targetId === '#products-panel') {
            if (typeof loadProducts === 'function') {
              loadProducts();
            }
          } else if (targetId === '#orders-panel') {
            if (typeof loadOrders === 'function') {
              loadOrders();
            }
          } else if (targetId === '#comments-panel') {
            if (typeof loadComments === 'function') {
              loadComments();
            }
          }
        });
      });
    }
  
    // Call specific functions when admin tab is shown
    const adminTab = document.getElementById('admin-tab');
    if (adminTab) {
      adminTab.addEventListener('shown.bs.tab', function (event) {
        loadUsers();
      });
    }

    // Initialize profile edit form event listener
    const profileForm = document.getElementById('profile-form'); // Updated ID to match HTML
    if (profileForm) {
      profileForm.addEventListener('submit', saveProfileChanges); // Attach event listener here
    } else {
      console.error('Profile form not found');
    }
  
    console.log('Page initialization complete');
  });
  
  function initUserProfile() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      console.log('Loading user profile data:', currentUser);
    
      if (currentUser) {
        const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        document.getElementById('user-full-name').textContent = fullName;
    
        document.getElementById('username-display').textContent = `@${currentUser.username || ''}`;
        document.getElementById('username-display-profile').textContent = `@${currentUser.username || ''}`;
        document.getElementById('email-display').textContent = currentUser.email || '';
    
        // Update the name and surname in the personal info card
        const firstNameElem = document.getElementById('first-name');
        const lastNameElem = document.getElementById('last-name');
        if (firstNameElem) firstNameElem.textContent = currentUser.firstName || '';
        if (lastNameElem) lastNameElem.textContent = currentUser.lastName || '';
    
        if (currentUser.avatar) {
          document.getElementById('profile-img').src = currentUser.avatar;
        }
    
        // Fill in edit profile form
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        const birthdayInput = document.getElementById('birthday');
    
        if (firstNameInput) firstNameInput.value = currentUser.firstName || '';
        if (lastNameInput) lastNameInput.value = currentUser.lastName || '';
        if (emailInput) emailInput.value = currentUser.email || '';
        if (usernameInput) usernameInput.value = currentUser.username || '';
        if (birthdayInput) birthdayInput.value = currentUser.birthday || ''; // Ensure birthday is set
    
        // Set gender radio buttons
        if (currentUser.gender) {
          const genderRadio = document.getElementById(
            `gender${currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1)}`
          );
          if (genderRadio) genderRadio.checked = true;
        }
    
        updateProfileDisplayFields();
      } else {
        console.error('No user data found in localStorage');
        // window.location.href = '/src/client/views/auth/login.html';
      }
    }
    
  
  async function updateProfileDisplayFields() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
    if (currentUser) {
      // Format the birthday for display if it exists
      if (currentUser.birthday) {
        // Fix date display issue: use date string splitting to avoid timezone effects
        const birthdayParts = currentUser.birthday.split('-');
        // Note: The month parameter starts from 0, so subtract 1
        const birthdayDate = new Date(
          parseInt(birthdayParts[0]), // Year
          parseInt(birthdayParts[1]) - 1, // Month (subtract 1 because JavaScript months start from 0)
          parseInt(birthdayParts[2]) // Day
        );
  
        const formattedBirthday = birthdayDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        document.getElementById('birthday-display').textContent = formattedBirthday;
      } else {
        document.getElementById('birthday-display').textContent = 'Not set';
      }
  
      // Display gender if it exists
      if (currentUser.gender) {
        document.getElementById('gender-display').textContent = currentUser.gender;
      } else {
        document.getElementById('gender-display').textContent = 'Not set';
      }
    }
  }
  
  function setupEventListeners() {
    // Avatar upload handler
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
      avatarUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const profileImg = document.getElementById('profile-img');
            profileImg.src = e.target.result;
  
            // Save the new avatar to user profile
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
              currentUser.avatar = e.target.result;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    // Setup save address button for add address modal
    const saveAddressBtn = document.getElementById('save-address');
    if (saveAddressBtn) {
      // Remove previous listeners by cloning and replacing the button
      const newSaveBtn = saveAddressBtn.cloneNode(true);
      saveAddressBtn.parentNode.replaceChild(newSaveBtn, saveAddressBtn);
  
      // Add fresh event listener
      document.getElementById('save-address').addEventListener('click', function () {
        console.log('Save address button clicked');
        saveAddress();
      });
    }
  
    // Profile edit form submission
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
      editProfileForm.addEventListener('submit', async function (event) {
        event.preventDefault();
  
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          // Update user data
          currentUser.firstName = document.getElementById('edit-first-name').value;
          currentUser.lastName = document.getElementById('edit-last-name').value;
          currentUser.fullname = `${currentUser.firstName} ${currentUser.lastName}`;
          currentUser.email = document.getElementById('edit-email').value;
          currentUser.birthday = document.getElementById('edit-birthday').value;
          currentUser.gender = document.getElementById('edit-gender').value;
  
          // Save updated user
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
          // Update users array if exists
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(user => user.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
          }
  
          // Refresh displayed profile data
          document.getElementById('user-full-name').textContent = `${currentUser.name}`;
          updateProfileDisplayFields();
  
          // Close modal
          const modalElement = document.getElementById('editProfileModal')
          modalElement.removeAttribute('aria-hidden'); // ✅ First remove aria-hidden
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal.hide();    // ✅ Now it can be properly hidden
  
          // Show success message
          alert('Profile updated successfully!');
        }
      });
    }
  
    // Password change form
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordInput = document.getElementById('new-password');
    const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
    const passwordHint = document.getElementById('passwordHint');

    // Password strength detection
    passwordInput?.addEventListener('input', function () {
      const pass = this.value;
      let strength = 0;

      passwordStrengthMeter.classList.remove('strength-weak', 'strength-medium', 'strength-strong');

      if (pass.length >= 8) strength++;
      if (/[A-Z]/.test(pass)) strength++;
      if (/\d/.test(pass)) strength++;

      if (strength === 1) {
        passwordStrengthMeter.classList.add('strength-weak');
        passwordHint.textContent = 'Weak password - add uppercase letters and numbers';
      } else if (strength === 2) {
        passwordStrengthMeter.classList.add('strength-medium');
        passwordHint.textContent = 'Medium password - add one more requirement';
      } else if (strength === 3) {
        passwordStrengthMeter.classList.add('strength-strong');
        passwordHint.textContent = 'Strong password';
      } else {
        passwordHint.textContent = 'Password must be at least 8 characters with numbers and uppercase letters';
      }
    });

    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorElement = document.getElementById('password-error');

        // Reset error message
        errorElement.classList.add('d-none');

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
          errorElement.textContent = 'New passwords do not match!';
          errorElement.classList.remove('d-none');
          return;
        }

        // Check if new password is the same as the current password
        if (newPassword === currentPassword) {
          errorElement.textContent = 'New password cannot be the same as the current password!';
          errorElement.classList.remove('d-none');
          return;
        }

        // Check new password rules
        if (!validatePassword(newPassword)) {
          errorElement.textContent = 'Password must be at least 8 characters long and include a mix of uppercase, lowercase, and numbers.';
          errorElement.classList.remove('d-none');
          return;
        }

        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          try {
            const response = await fetch(CONFIG.getApiPath('/auth/update'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: currentUser.id,
                currentPassword: currentPassword,
                newPassword: newPassword
              })
            });

            const result = await response.json();
            if (result.success) {
              currentUser.password = newPassword;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));

              // Update users array (if exists)
              const users = JSON.parse(localStorage.getItem('users') || '[]');
              const userIndex = users.findIndex(user => user.id === currentUser.id);
              if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
              }

              changePasswordForm.reset();
              showToast('Password updated', 'success');
            } else {
              errorElement.textContent = result.message || 'Password update failed, please try again.';
              errorElement.classList.remove('d-none');
            }
          } catch (error) {
            console.error('Error updating password:', error);
            errorElement.textContent = 'Error updating password, please try again.';
            errorElement.classList.remove('d-none');
          }
        }
      });
    }
  }

  function validatePassword(password) {
    // Password must be at least 8 characters long and include uppercase, lowercase, and numbers
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }
  
  function toggleUsernameEdit() {
    const usernameDisplay = document.getElementById('username-display');
  
    // Ensure usernameDisplay element exists
    if (!usernameDisplay) {
      console.error('Username display element not found');
      return;
    }
  
    const currentText = usernameDisplay.textContent;
  
    // Create input for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm d-inline-block';
    input.value = currentText.substring(1); // Remove @ symbol
    input.style.width = '120px';
  
    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-success ms-2';
    saveBtn.innerHTML = '<i class="bi bi-check"></i>';
  
    saveBtn.onclick = async function () {
      const newUsername = input.value.trim();
      if (!newUsername) {
        alert('Username cannot be empty!');
        return;
      }
  
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('User not found in localStorage!');
        return;
      }
  
      // Send update request to database
      try {
        const response = await fetch(CONFIG.getApiPath('/auth/update'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            username: newUsername
          })
        });
  
        const result = await response.json();
  
        if (result.success) {
          // Update `localStorage` data
          currentUser.username = newUsername;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
          // Update `users` array (if exists)
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(user => user.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(users));
          }
  
          // Update frontend page
          const usernameDisplayEl = document.getElementById('username-display');
          if (usernameDisplayEl) {
            usernameDisplayEl.textContent = `@${newUsername}`;
          }
  
          const profileUsernameEl = document.getElementById('username-display-profile');
          if (profileUsernameEl) {
            profileUsernameEl.textContent = `@${newUsername}`;
          }
  
          // Success message
          showToast('Username updated successfully!', 'success');
        } else {
          console.error('Failed to update username:', result.message);
          showToast('Failed to update username!', 'danger');
        }
      } catch (error) {
        console.error('Error updating username:', error);
        showToast('Error updating username!', 'danger');
      }
  
      // Restore original display
      const usernameDisplayElement = document.getElementById('username-display');
      if (usernameDisplayElement && usernameDisplayElement.nextElementSibling) {
        usernameDisplayElement.nextElementSibling.style.display = 'inline-block';
        usernameDisplayElement.innerHTML = `@${newUsername}`;
      }
    };
  
    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-sm btn-danger ms-1';
    cancelBtn.innerHTML = '<i class="bi bi-x"></i>';
    cancelBtn.onclick = function () {
      const usernameDisplayElement = document.getElementById('username-display');
      if (usernameDisplayElement) {
        usernameDisplayElement.textContent = currentText;
        if (usernameDisplayElement.nextElementSibling) {
          usernameDisplayElement.nextElementSibling.style.display = 'inline-block';
        }
      }
    };
  
    // Replace content
    usernameDisplay.textContent = '';
    usernameDisplay.appendChild(document.createTextNode('@'));
    usernameDisplay.appendChild(input);
    usernameDisplay.appendChild(saveBtn);
    usernameDisplay.appendChild(cancelBtn);
  
    // Hide edit button
    if (usernameDisplay.nextElementSibling) {
      usernameDisplay.nextElementSibling.style.display = 'none';
    }
  
    // Focus input
    input.focus();
  }
  
  function checkAdminStatus() {
    // Check if user is admin and show admin tab if yes
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const adminTabContainer = document.getElementById('admin-tab-container');
  
    if (adminTabContainer) {
      // Default hide admin button
      adminTabContainer.style.display = 'none';
  
      // Only show if user exists and is admin
      if (currentUser && (currentUser.isAdmin === true || currentUser.role === "admin")) {
        adminTabContainer.style.display = 'block';
        console.log('Admin status detected, showing admin dashboard button');
      } else {
        console.log('User is not an admin or not logged in, hiding admin dashboard button');
      }
    } else {
      console.error('Admin tab container element not found');
    }
  }
  
  // Address management functions
  function loadAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Loading addresses for user:', currentUser);
  
    if (!currentUser) {
      console.error('No user found in localStorage');
      return;
    }
  
    const addresses = currentUser.addresses || [];
    console.log('Found addresses:', addresses);
  
    const container = document.getElementById('addresses-container');
  
    if (!container) {
      console.error('Addresses container not found in the DOM');
      return;
    }
  
    if (addresses.length === 0) {
      console.log('No addresses found, showing empty state');
      container.innerHTML = `
      <div class="no-addresses text-center py-5">
        <i class="bi bi-geo-alt display-4 text-muted"></i>
        <p class="mt-3 text-muted">You don't have any saved addresses yet.</p>
        </div>
      `;
      return;
    }
  
    console.log('Rendering address cards');
    container.innerHTML = '<div class="row">' +
      addresses.map((address, index) => `
      <div class="col-md-6 mb-3">
        <div class="card h-100 ${address.isDefault ? 'border-primary' : ''}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title">${address.name || 'Address'}</h5>
              ${address.isDefault ? '<span class="badge bg-primary">Default</span>' : ''}
          </div>
              <p class="card-text mb-1"><strong>${address.fullName || ''}</strong></p>
              <p class="card-text mb-1">${address.streetAddress || address.addressLine1 || ''}</p>
              ${address.aptSuite || address.addressLine2 ? `<p class="card-text mb-1">${address.aptSuite || address.addressLine2}</p>` : ''}
              <p class="card-text mb-1">${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}</p>
              <p class="card-text mb-3">${address.country || ''}</p>
              <p class="card-text"><small class="text-muted">Phone: ${address.phone || ''}</small></p>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="editAddress(${index})">
                  <i class="bi bi-pencil me-1"></i>Edit
              </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${index})">
                  <i class="bi bi-trash me-1"></i>Delete
              </button>
                ${!address.isDefault ? `<button class="btn btn-sm btn-outline-secondary" onclick="setDefaultAddress(${index})">Set as Default</button>` : ''}
            </div>
            </div>
          </div>
        </div>
      `).join('') + '</div>';
  }
  
  let currentAddressIndex = -1;
  
  function addAddress() {
    currentAddressIndex = -1;
    document.getElementById('address-form').reset();
    document.querySelector('#addAddressModal .modal-title').textContent = 'Add New Address';
    document.getElementById('defaultAddress').checked = false;
  }
  
  function editAddress(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.addresses) return;
  
    const address = currentUser.addresses[index];
    if (!address) return;
  
    currentAddressIndex = index;
  
    // Fill form fields
    document.getElementById('edit-addressName').value = address.name || '';
    document.getElementById('edit-fullName').value = address.fullName || '';
    document.getElementById('edit-phone').value = address.phone || '';
    document.getElementById('edit-addressLine1').value = address.streetAddress || address.addressLine1 || '';
    document.getElementById('edit-addressLine2').value = address.aptSuite || address.addressLine2 || '';
    document.getElementById('edit-city').value = address.city || '';
    document.getElementById('edit-state').value = address.state || '';
    document.getElementById('edit-zipCode').value = address.zipCode || '';
    document.getElementById('edit-country').value = address.country || '';
    document.getElementById('edit-defaultAddress').checked = address.isDefault || false;
  
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editAddressModal'));
    modal.show();
  }
  
  function saveAddress() {
    console.log('Saving address');
  
    const addressForm = document.getElementById('address-form');
  
    // Validate form
    if (!addressForm) {
      console.error('Address form not found');
      return;
    }
  
    if (!addressForm.checkValidity()) {
      console.log('Form validation failed');
      addressForm.reportValidity();
      return;
    }
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      console.error('No user found in localStorage');
      return;
    }
  
    // Initialize addresses array if it doesn't exist
    if (!currentUser.addresses) {
      currentUser.addresses = [];
    }
  
    // Collect form data
    const newAddress = {
      name: document.getElementById('addressName').value,
      fullName: document.getElementById('fullName').value,
      streetAddress: document.getElementById('addressLine1').value,
      aptSuite: document.getElementById('addressLine2').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipCode: document.getElementById('zipCode').value,
      country: document.getElementById('country').value,
      phone: document.getElementById('phone').value,
      isDefault: document.getElementById('defaultAddress').checked
    };
  
    console.log('New address data:', newAddress);
  
    // If setting as default, remove default from other addresses
    if (newAddress.isDefault) {
      currentUser.addresses.forEach(addr => addr.isDefault = false);
    }
  
    // Add new address
    if (currentUser.addresses.length === 0) {
      newAddress.isDefault = true;
    }
    currentUser.addresses.push(newAddress);
  
    // Save changes
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
    // Update users array if exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].addresses = currentUser.addresses;
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addAddressModal'));
    if (modal) modal.hide();
  
    // Show success message
    showToast('Address saved successfully', 'success');
  
    // Reload addresses
    loadAddresses();
  }
  
  function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) return;
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.addresses) return;
  
    // Remove address
    currentUser.addresses.splice(index, 1);
  
    // If we deleted the default address and there are other addresses, set first as default
    if (currentUser.addresses.length > 0) {
      let hasDefault = currentUser.addresses.some(addr => addr.isDefault);
      if (!hasDefault) {
        currentUser.addresses[0].isDefault = true;
      }
    }
  
    // Save changes
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
    // Update users array if exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].addresses = currentUser.addresses;
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    // Reload addresses
    loadAddresses();
  }
  
  function setDefaultAddress(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.addresses) return;
  
    // Remove default from all addresses
    currentUser.addresses.forEach(addr => addr.isDefault = false);
  
    // Set new default
    currentUser.addresses[index].isDefault = true;
  
    // Save changes
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
    // Update users array if exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].addresses = currentUser.addresses;
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    // Reload addresses
    loadAddresses();
  }
  
  // Helper function to show loading spinner
  function showLoadingSpinner(element) {
    element.innerHTML = `
    <div class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
          </div>
          </div>
    `;
  }
  
  async function saveProfileChanges(event) {
    if (event) {
      event.preventDefault(); // Ensure event exists before calling preventDefault
    }
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      console.error('No user found in localStorage');
      return;
    }
  
    try {
      // Collect updated data from the form
      const updateData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        birthday: document.getElementById('birthday').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value
      };
  
      // Validate email format
      if (!validateEmail(updateData.email)) {
        document.getElementById('profile-error').textContent = 'Invalid email format.';
        document.getElementById('profile-error').classList.remove('d-none');
        return;
      }
  
      // Check email availability only if it has been modified
      if (updateData.email !== currentUser.email) {
        const isEmailAvailable = await checkEmailAvailability(updateData.email);
        if (!isEmailAvailable) {
          document.getElementById('profile-error').textContent = 'Email is already in use.';
          document.getElementById('profile-error').classList.remove('d-none');
          return;
        }
      }
  
      const response = await fetch(CONFIG.getApiPath('/auth/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser.id, ...updateData })
      });
  
      const result = await response.json();
      if (result.success) {
        Object.assign(currentUser, updateData);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
        // Update displayed user information
        document.getElementById('user-full-name').textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        document.getElementById('username-display').textContent = `@${currentUser.username}`;
        document.getElementById('username-display-profile').textContent = `@${currentUser.username}`;
        document.getElementById('email-display').textContent = currentUser.email;
  
        const firstNameDisplay = document.getElementById('first-name');
        const lastNameDisplay = document.getElementById('last-name');
        if (firstNameDisplay) firstNameDisplay.textContent = currentUser.firstName;
        if (lastNameDisplay) lastNameDisplay.textContent = currentUser.lastName;
  
        await updateProfileDisplayFields();
  
        // Close modal
        const modalElement = document.getElementById('editProfileModal');
        modalElement.removeAttribute('aria-hidden');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
  
        showToast('Profile updated successfully', 'success');
      } else {
        document.getElementById('profile-error').textContent = result.message || 'Update failed, please try again.';
        document.getElementById('profile-error').classList.remove('d-none');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      document.getElementById('profile-error').textContent = 'Update failed, please try again.';
      document.getElementById('profile-error').classList.remove('d-none');
    }
  }
  
  function validateEmail(email) {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async function checkEmailAvailability(email) {
    try {
      const response = await fetch(CONFIG.getApiPath('/auth/check_email.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
  
      const result = await response.json();
      if (result.success) {
        console.log('Email is available');
        return true;
      } else {
        console.log('Email is already in use');
        return false;
      }
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  }
  
  function saveEditedAddress() {
    console.log('Saving edited address');
  
    const addressForm = document.getElementById('edit-address-form');
  
    // Validate form
    if (!addressForm) {
      console.error('Edit address form not found');
      return;
    }
  
    if (!addressForm.checkValidity()) {
      console.log('Form validation failed');
      addressForm.reportValidity();
      return;
    }
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      console.error('No user found in localStorage');
      return;
    }
  
    // Initialize addresses array if it doesn't exist
    if (!currentUser.addresses) {
      currentUser.addresses = [];
    }
  
    // Collect form data
    const editedAddress = {
      name: document.getElementById('edit-addressName').value,
      fullName: document.getElementById('edit-fullName').value,
      streetAddress: document.getElementById('edit-addressLine1').value,
      aptSuite: document.getElementById('edit-addressLine2').value,
      city: document.getElementById('edit-city').value,
      state: document.getElementById('edit-state').value,
      zipCode: document.getElementById('edit-zipCode').value,
      country: document.getElementById('edit-country').value,
      phone: document.getElementById('edit-phone').value,
      isDefault: document.getElementById('edit-defaultAddress').checked
    };
  
    console.log('Edited address data:', editedAddress);
  
    // If setting as default, remove default from other addresses
    if (editedAddress.isDefault) {
      currentUser.addresses.forEach(addr => addr.isDefault = false);
    }
  
    // Update existing address
    if (currentAddressIndex >= 0 && currentAddressIndex < currentUser.addresses.length) {
      currentUser.addresses[currentAddressIndex] = editedAddress;
    } else {
      console.error('Invalid address index:', currentAddressIndex);
      return;
    }
  
    // Save changes
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
    // Update users array if exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].addresses = currentUser.addresses;
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAddressModal'));
    if (modal) modal.hide();
  
      // Show success message (after hiding modal, just feels smoother)
      setTimeout(() => {
          showToast('Address updated successfully', 'success');
      }, 200);
  
    // Reload addresses
    loadAddresses();
  }