class RegisterView {
  getTemplate() {
    return `
      <div class="container auth-container">
        <div class="auth-card" style="view-transition-name: login-card">
          <h1 class="auth-title">Join Loughshinny Dublinn Travel Post</h1>

          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                required
              >
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password (min. 6 characters)"
                required
                minlength="6"
              >
            </div>

            <div id="error-container" class="error-container"></div>

            <div class="auth-loading-container loading-container" id="loading-container" style="display: none;">
              <div class="loading-spinner"></div>
              <div class="loading-text" id="loading-text">Creating your account...</div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="register-button">Register</button>
          </form>

          <div class="guest-post-container">
            <button type="button" class="btn btn-secondary btn-block" id="guest-post-button">Post as Guest</button>
          </div>

          <div class="auth-footer">
            <p>Already have an account? <a href="#/login">Login</a></p>
          </div>
        </div>
      </div>
    `;
  }

  showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }

  clearError() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }

  showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    const registerButton = document.getElementById('register-button');
    const authFooter = document.querySelector('.auth-footer');
    const guestPostContainer = document.querySelector('.guest-post-container');

    if (loadingContainer && registerButton) {
      loadingContainer.style.display = 'flex';
      registerButton.style.display = 'none';

      if (authFooter) {
        authFooter.style.display = 'none';
      }

      if (guestPostContainer) {
        guestPostContainer.style.display = 'none';
      }
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    const registerButton = document.getElementById('register-button');
    const authFooter = document.querySelector('.auth-footer');
    const guestPostContainer = document.querySelector('.guest-post-container');

    if (loadingContainer && registerButton) {
      loadingContainer.style.display = 'none';
      registerButton.style.display = 'block';

      if (authFooter) {
        authFooter.style.display = 'block';
      }

      if (guestPostContainer) {
        guestPostContainer.style.display = 'block';
      }
    }
  }

  updateLoadingText(text) {
    const loadingText = document.getElementById('loading-text');

    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  /**
   * Initializes the guest post button with a click handler
   * @param {Function} onGuestPostClick
   */
  initializeGuestPostButton(onGuestPostClick) {
    const guestPostButton = document.getElementById('guest-post-button');

    if (guestPostButton && onGuestPostClick) {
      guestPostButton.addEventListener('click', onGuestPostClick);
    }
  }

  /**
   * Initializes the register form with a submit handler
   * @param {Function} onSubmit 
   */
  initializeRegisterForm(onSubmit) {
    const registerForm = document.getElementById('register-form');

    if (registerForm && onSubmit) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.clearError();

        const formData = new FormData(registerForm);
        const registerData = {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
        };

        onSubmit(registerData);
      });
    }
  }

  /**
   * Updates the navigation UI after successful registration
   * @param {Object} userData 
   */
  updateNavigationUI(userData) {
    const navList = document.getElementById('nav-list');
    const userButton = document.getElementById('user-button');
    const usernameText = document.getElementById('username-text');
    const logoutLink = document.getElementById('logout-link');

    if (navList) {
      navList.style.display = 'flex';
    }

    if (userButton && userData) {
      userButton.style.display = 'block';

      if (usernameText) {
        usernameText.textContent = userData.name;
      }

      if (logoutLink) {
        logoutLink.style.display = 'block';
      }
    }
  }

  /**
   * Navigates to a new page with view transitions if available
   * @param {string} path 
   * @param {boolean} reload 
   */
  navigateTo(path, reload = false) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = path;
      });
    } else {
      window.location.hash = path;
      if (reload) {
        window.location.reload();
      }
    }
  }
}

export default RegisterView;
