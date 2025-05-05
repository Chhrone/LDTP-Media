import AboutView from '../views/about-view';

class AboutPage {
  constructor() {
    this._view = new AboutView();
  }

  async render() {
    return this._view.getTemplate();
  }

  async afterRender() {
    this._view.afterRender();
  }
}

export default AboutPage;
