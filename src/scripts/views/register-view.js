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
}

export default RegisterView;
