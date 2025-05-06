import { getActiveRoute } from "../routes/url-parser";

class BackToTopHandler {
  constructor(backToTopButton) {
    this._backToTopButton = backToTopButton;

    if (this._backToTopButton) {
      this._initBackToTop();
    }
  }

  /**
   * Sets up event listeners for back-to-top button and handles initial visibility
   */
  _initBackToTop() {
    window.addEventListener('scroll', () => this._toggleBackToTopVisibility());

    window.addEventListener('hashchange', () => {
      if (!this._isHomePage()) {
        this._backToTopButton.style.display = 'none';
        this._backToTopButton.classList.remove('visible');
      }
      setTimeout(() => this._toggleBackToTopVisibility(), 50);
    });

    this._toggleBackToTopVisibility();

    this._backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  _isHomePage() {
    const route = getActiveRoute();
    return route === '/' || route === '/page/:page';
  }

  /**
   * Controls button visibility with fade animation based on page and scroll position
   * Uses a delay to ensure smooth transitions between states
   */
  _toggleBackToTopVisibility() {
    if (!this._isHomePage()) {
      this._backToTopButton.classList.remove('visible');
      setTimeout(() => {
        this._backToTopButton.style.display = 'none';
      }, 300);
      return;
    }

    if (this._backToTopButton.style.display !== 'flex') {
      this._backToTopButton.style.display = 'flex';
      this._backToTopButton.offsetHeight;
    }

    if (window.scrollY > 800) {
      this._backToTopButton.classList.add('visible');
    } else {
      this._backToTopButton.classList.remove('visible');
    }
  }

  /**
   * Updates button visibility when navigating between pages
   */
  updateBackToTopButton(route) {
    if (!this._backToTopButton) return;

    const isHomePage = route === '/' || route.startsWith('/page/');
    if (isHomePage) {
      this._backToTopButton.style.display = 'flex';
      this._backToTopButton.offsetHeight;

      if (window.scrollY > 800) {
        this._backToTopButton.classList.add('visible');
      } else {
        this._backToTopButton.classList.remove('visible');
      }
    }
  }
}

export default BackToTopHandler;
