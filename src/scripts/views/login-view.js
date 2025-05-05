class LoginView {
  getTemplate() {
    return `
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
}

export default LoginView;
