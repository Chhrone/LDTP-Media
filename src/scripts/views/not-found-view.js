class NotFoundView {
  getTemplate() {
    return `
      <div class="container">
        <div class="not-found-page">
          <div class="not-found-content">
            <h1 class="not-found-title">404</h1>
            <h2 class="not-found-subtitle">Page Not Found</h2>
            <p class="not-found-description">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <div class="not-found-actions">
              <a href="#/" class="btn btn-primary">Go to Homepage</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export default NotFoundView;
