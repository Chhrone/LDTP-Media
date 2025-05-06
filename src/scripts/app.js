import routes from "./routes/routes";
import { getActiveRoute } from "./routes/url-parser";
import authPresenter from "./presenter/auth-presenter";
import NavbarHandler from "./utils/navbar-handler";
import BackToTopHandler from "./utils/back-to-top-handler";
import FabVisibilityHandler from "./utils/fab-visibility-handler";
import AccessibilityHandler from "./utils/accessibility-handler";
import PageTransitionHandler from "./utils/page-transition-handler";

class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._userButton = document.getElementById("user-button");
    this._dropdownContent = document.getElementById("dropdown-content");
    this._logoutLink = document.getElementById("logout-link");
    this._backToTopButton = document.getElementById("back-to-top");
    this._createStoryFab = document.querySelector(".create-story-fab");
    this._headerActions = document.querySelector(".header-actions");
    this._navList = document.getElementById("nav-list");

    this._initHandlers();
    this._initLogoutFunctionality();
  }

  _initHandlers() {
    this._navbarHandler = new NavbarHandler({
      drawerButton: this._drawerButton,
      navigationDrawer: this._navigationDrawer,
      userButton: this._userButton,
      dropdownContent: this._dropdownContent,
      logoutLink: this._logoutLink,
      navList: this._navList
    });

    this._backToTopHandler = new BackToTopHandler(this._backToTopButton);

    this._fabVisibilityHandler = new FabVisibilityHandler({
      createStoryFab: this._createStoryFab,
      headerActions: this._headerActions,
      navList: this._navList
    });

    this._accessibilityHandler = new AccessibilityHandler();
    this._pageTransitionHandler = new PageTransitionHandler();
  }

  _initLogoutFunctionality() {
    if (this._logoutLink) {
      this._logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        authPresenter.logout();
        this._navbarHandler.closeDropdown();
        window.location.hash = "#/login";
        window.location.reload();
      });
    }
  }

  /**
   * Renders the appropriate page based on current route
   * Handles page transitions, UI updates, and navigation state
   */
  async renderPage() {
    try {
      const route = getActiveRoute();
      const page = routes[route];

      if (!page) {
        this._content.innerHTML =
          '<div class="container"><h2>404 - Page Not Found</h2></div>';
        return;
      }

      const previousRoute = this._pageTransitionHandler.getPreviousRoute() || '';
      const isDetailToHomeTransition = this._pageTransitionHandler.isDetailToHomeTransition(previousRoute, route);

      if (isDetailToHomeTransition && route === '/') {
        const lastViewedPage = sessionStorage.getItem('lastViewedPage');
        if (lastViewedPage && lastViewedPage !== '1') {
          window.location.hash = `#/page/${lastViewedPage}`;
          return;
        }
      }

      const isPaginationNavigation = this._pageTransitionHandler.isPaginationNavigation(previousRoute, route);

      this._fabVisibilityHandler.updateFabVisibility(route);
      this._navbarHandler.updateUserUI();

      if (this._currentPage && typeof this._currentPage.destroy === 'function') {
        this._currentPage.destroy();
      }

      this._currentPage = page;
      this._pageTransitionHandler.updateBodyClasses(previousRoute, route);

      const shouldUseViewTransition = this._pageTransitionHandler.shouldUseViewTransition(previousRoute, route);

      if (shouldUseViewTransition) {
        const transition = document.startViewTransition(async () => {
          this._content.innerHTML = await page.render();
          this._handleScrolling(isDetailToHomeTransition, isPaginationNavigation);

          await page.afterRender();
          this._navbarHandler.closeNavigationDrawer();
          this._backToTopHandler.updateBackToTopButton(route);
          this._navbarHandler.updateUserUI();
        });

        transition.ready.catch(error => {
          console.warn('View transition failed:', error);
        });
      } else {
        this._content.innerHTML = await page.render();
        this._handleScrolling(isDetailToHomeTransition, isPaginationNavigation);

        await page.afterRender();
        this._navbarHandler.closeNavigationDrawer();
        this._backToTopHandler.updateBackToTopButton(route);
        this._navbarHandler.updateUserUI();
      }

      this._pageTransitionHandler.setPreviousRoute(route);
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML =
        '<div class="container"><h2>Something went wrong</h2><p>Please try again later</p></div>';
    }
  }

  /**
   * Controls scrolling behavior based on navigation type
   * Prevents scrolling for detail-to-home transitions to maintain focus on story cards
   */
  _handleScrolling(isDetailToHomeTransition, isPaginationNavigation) {
    if (!isDetailToHomeTransition && !isPaginationNavigation) {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  }
}

export default App;
