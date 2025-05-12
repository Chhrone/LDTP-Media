import NotFoundView from '../views/not-found-view';

class NotFoundPage {
  constructor() {
    this._view = new NotFoundView();
  }

  async render() {
    return this._view.getTemplate();
  }

  async afterRender() {
    // No additional logic needed after rendering
  }
}

export default NotFoundPage;
