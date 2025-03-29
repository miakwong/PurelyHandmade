
  document.addEventListener('DOMContentLoaded', () => {
    // 🍞 Toast 初始化
    const toastEl = document.getElementById('notification-toast');
    window.toast = new bootstrap.Toast(toastEl, { delay: 3000 });

    // 头像预览 & Base64 编码
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarPreview = document.getElementById('avatarPreview');
    let avatarBase64 = '';

    avatarUpload?.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showValidationError('avatar-error', 'Image size should not exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        avatarBase64 = e.target.result;
        avatarPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatarBase64;
        img.alt = "Preview";
        avatarPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });

    // 密码强度检测
    const passwordInput = document.getElementById('regPassword');
    const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
    const passwordHint = document.getElementById('passwordHint');

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

    // 表单提交
    document.getElementById('register-form')?.addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = e.target;
      clearValidationErrors();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const firstName = form.firstName.value.trim();
      const lastName = form.lastName.value.trim();
      const email = form.regEmail.value.trim();
      const username = form.username.value.trim();
      const pass = form.regPassword.value;
      const confirmPass = form.regPasswordConfirm.value;
      const termsAccepted = form.termsCheck.checked;
      const birthday = form.birthday.value;
      const gender = form.querySelector('input[name="gender"]:checked');

      let isValid = true;

      if (!gender) isValid = !showValidationError('gender-error', 'Please select your gender.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) isValid = !showValidationError('email-error', 'Please enter a valid email.');
      if (username.length < 3) isValid = !showValidationError('username-error', 'Username must be at least 3 characters.');
      if (pass.length < 8 || !/[A-Z]/.test(pass) || !/\d/.test(pass)) isValid = !showValidationError('password-error', 'Password must be at least 8 characters, with uppercase and number.');
      if (pass !== confirmPass) isValid = !showValidationError('password-match-error', 'Passwords do not match.');
      if (!termsAccepted) isValid = !showValidationError('terms-error', 'You must accept the terms.');

      if (!isValid) {
        const formError = document.getElementById('form-validation-error');
        formError.textContent = 'Please correct the errors above.';
        formError.classList.remove('d-none');
        return;
      }

      const userData = {
        firstName,
        lastName,
        email,
        username,
        password: pass,
        avatar: avatarBase64 || null,
        birthday: birthday ? (new Date(birthday)).toISOString().split('T')[0] : null,
        gender: gender.value,
        role: 'user',
        isAdmin: 0,
        status: 'active'
      };

      // Avatar 安全限制
      if (avatarBase64.length > 200000) userData.avatar = null;

      // loading 按钮效果
      const submitBtn = form.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Registering...`;
      submitBtn.disabled = true;

      try {
        const response = await fetch(CONFIG.getApiPath('/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        const text = await response.text();
        const data = JSON.parse(text);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (data.success) {
          showToast('Account created successfully! Redirecting...', 'success');
          setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
          const formError = document.getElementById('form-validation-error');
          formError.textContent = data.message || 'Registration failed.';
          formError.classList.remove('d-none');
          if (data.errors?.email) showValidationError('email-error', data.errors.email[0]);
          if (data.errors?.username) showValidationError('username-error', data.errors.username[0]);
          if (data.errors?.password) showValidationError('password-error', data.errors.password[0]);
        }
      } catch (err) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast('Server error. Please try again later.', 'danger');
        console.error('Registration error:', err);
      }
    });

    // 实时邮箱检测
    document.getElementById('regEmail')?.addEventListener('blur', async function () {
      const email = this.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

      try {
        const res = await fetch(CONFIG.getApiPath('/auth/check_email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await res.json();
        if (result.data?.exists) {
          showValidationError('email-error', result.data.message);
        } else {
          document.getElementById('email-error').classList.add('d-none');
        }
      } catch (err) {
        console.error('Email check error:', err);
      }
    });

    // 实时用户名检测
    document.getElementById('username')?.addEventListener('blur', async function () {
      const username = this.value.trim();
      if (!username || username.length < 3) return;

      try {
        const res = await fetch(CONFIG.getApiPath('/auth/check_username'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const result = await res.json();
        if (result.data?.exists) {
          showValidationError('username-error', result.data.message);
        } else {
          document.getElementById('username-error').classList.add('d-none');
        }
      } catch (err) {
        console.error('Username check error:', err);
      }
    });

    // 错误显示 & 清除
    function showValidationError(id, msg) {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      el.classList.remove('d-none');
      el.classList.add('text-danger', 'show');
    }

    function clearValidationErrors() {
      document.querySelectorAll('.validation-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('show', 'text-danger');
        el.classList.add('d-none');
      });
    }

    // Toast notification
    window.showToast = function (message, type = 'info') {
      const toastContainer = document.querySelector('.toast-container') || (() => {
        const c = document.createElement('div');
        c.className = 'toast-container position-fixed top-0 end-0 p-3';
        c.style.zIndex = 1060;
        document.body.appendChild(c);
        return c;
      })();

      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-white bg-${type} border-0`;
      toast.role = 'alert';
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
        </div>
      `;

      toastContainer.appendChild(toast);
      toast.querySelector('.btn-close')?.addEventListener('click', () => toast.remove());
      setTimeout(() => toast.remove(), 3000);
    };
  });
