class LoginView {
  getTemplate() {
    const template = `
      <div class="container auth-container">
        <div class="auth-card" style="view-transition-name: login-card">
          <h1 class="auth-title">Login to Loughshinny Dublinn Travel Post</h1>

          <form id="login-form" class="auth-form">
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
                placeholder="Enter your password"
                required
              >
            </div>

            <div id="error-container" class="error-container"></div>

            <div class="auth-loading-container loading-container" id="loading-container" style="display: none;">
              <div class="loading-spinner"></div>
              <div class="loading-text" id="loading-text">Logging in...</div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="login-button">Login</button>
          </form>

          <div class="guest-post-container">
            <button type="button" class="btn btn-secondary btn-block" id="guest-post-button">Post as Guest</button>
          </div>

          <div class="auth-footer">
            <p>Don't have an account? <a href="#/register">Register</a></p>
          </div>
        </div>
      </div>
    `;
    console.log('LoginView template generated:', template); // Debug log
    return template;
  }

  showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      errorContainer.classList.add('error');
      errorContainer.classList.remove('info');
    }
  }

  showInfo(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      errorContainer.classList.add('info');
      errorContainer.classList.remove('error');
    }
  }

  clearError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
      errorContainer.classList.remove('error');
      errorContainer.classList.remove('info');
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    const loginButton = document.getElementById('login-button');
    const authFooter = document.querySelector('.auth-footer');
    const guestPostContainer = document.querySelector('.guest-post-container');

    if (loadingContainer && loginButton) {
      loadingContainer.style.display = 'flex';
      loginButton.style.display = 'none';

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
    const loginButton = document.getElementById('login-button');
    const authFooter = document.querySelector('.auth-footer');
    const guestPostContainer = document.querySelector('.guest-post-container');

    if (loadingContainer && loginButton) {
      loadingContainer.style.display = 'none';
      loginButton.style.display = 'block';

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

  initializeLoginForm(onSubmit) {
    const loginForm = document.getElementById('login-form');
    console.log('Login form element:', loginForm); // Debug log

    if (loginForm && onSubmit) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.clearError();

        const formData = new FormData(loginForm);
        const loginData = {
          email: formData.get('email'),
          password: formData.get('password'),
        };

        onSubmit(loginData);
      });
    }
  }

  initializeGuestPostButton(onClick) {
    const guestPostButton = document.getElementById('guest-post-button');
    if (guestPostButton && onClick) {
      guestPostButton.addEventListener('click', onClick);
    }
  }

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

  navigateTo(path, replace = false) {
    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }
  }
}

export default LoginView;
