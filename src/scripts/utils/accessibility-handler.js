import { getActiveRoute } from "../routes/url-parser";

class AccessibilityHandler {
  constructor() {
    this._initAccessibility();
  }

  /**
   * Sets up skip-to-content functionality and manages its visibility
   * Handles focus management and smooth scrolling to target content
   */
  _initAccessibility() {
    const skipLink = document.querySelector('.skip-to-content');

    if (skipLink) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = skipLink.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();

          setTimeout(() => {
            targetElement.removeAttribute('tabindex');
          }, 1000);

          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });

      window.addEventListener('hashchange', () => {
        const route = getActiveRoute();
        const isHomePage = route === '/' || route === '/page/:page';
        skipLink.style.display = isHomePage ? 'block' : 'none';
      });

      const route = getActiveRoute();
      const isHomePage = route === '/' || route === '/page/:page';
      skipLink.style.display = isHomePage ? 'block' : 'none';
    }
  }
}

export default AccessibilityHandler;
