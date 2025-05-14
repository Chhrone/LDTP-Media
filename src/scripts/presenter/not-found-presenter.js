import NotFoundView from '../views/not-found-view';

class NotFoundPage {
  constructor() {
    this._view = new NotFoundView();
  }

  async render() {
    return this._view.getTemplate();
  }

  async afterRender() {
    // Add any additional functionality after rendering
    document.title = '404 - Page Not Found | Loughshinny Dublinn Travel Post';
  }
}

export default NotFoundPage;
