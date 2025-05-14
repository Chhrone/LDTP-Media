class NotFoundView {
  getTemplate() {
    return `
      <div class="container not-found-container">
        <div class="not-found-content">
          <h1 class="not-found-title">404</h1>
          <h2 class="not-found-subtitle">Page Not Found</h2>
          <p class="not-found-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div class="not-found-actions">
            <a href="#/" class="not-found-button primary-button">
              <i class="fas fa-home"></i> Go to Home
            </a>
            <button onclick="window.history.back()" class="not-found-button secondary-button">
              <i class="fas fa-arrow-left"></i> Go Back
            </button>
          </div>
        </div>
        <div class="not-found-image">
          <img src="/icon.png" alt="Not Found" />
        </div>
      </div>
    `;
  }
}

export default NotFoundView;
