import routes from "./routes/routes";
import { getActiveRoute } from "./routes/url-parser";
import AuthHelper from "./utils/auth-helper";
import authPresenter from "./presenter/auth-presenter";

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

    this._initialAppShell();
    this._updateUserUI();
    this._initBackToTop();
    this._initFabVisibility();
    this._initAccessibility();
  }

  // Helper method to close dropdown
  _closeDropdown() {
    if (this._dropdownContent && this._dropdownContent.classList.contains("show")) {
      this._dropdownContent.classList.remove("show");

      // Reset the rotation of the dropdown icon
      const dropdownIcon = this._userButton.querySelector("i");
      if (dropdownIcon) {
        dropdownIcon.classList.remove("rotated");
      }
    }
  }

  _initialAppShell() {
    // Navigation drawer toggle
    this._drawerButton.addEventListener("click", (event) => {
      this._navigationDrawer.classList.toggle("open");

      // Close dropdown if it's open when drawer button is clicked
      this._closeDropdown();

      event.stopPropagation();
    });

    // User dropdown toggle
    if (this._userButton) {
      this._userButton.addEventListener("click", (event) => {
        this._dropdownContent.classList.toggle("show");
        // Toggle the rotation of the dropdown icon
        const dropdownIcon = this._userButton.querySelector("i");
        if (dropdownIcon) {
          dropdownIcon.classList.toggle("rotated");
        }
        event.stopPropagation();
      });
    }

    // Logout functionality
    if (this._logoutLink) {
      this._logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        // Implement actual logout logic
        authPresenter.logout();
        this._closeDropdown();
        // Redirect to login page
        window.location.hash = "#/login";
        window.location.reload(); // Reload to update UI
      });
    }

    // Add event listeners to all navigation links to close dropdown
    const navLinks = document.querySelectorAll('.nav-list a, .dropdown-content a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (link.id === 'logout-link') return;

        // Close dropdown if it's open
        this._closeDropdown();

        // Close navigation drawer on mobile
        this._navigationDrawer.classList.remove("open");
      });
    });

    // Close navigation drawer when clicking outside
    document.addEventListener("click", (event) => {
      // Close navigation drawer if clicking outside
      if (
        !this._navigationDrawer.contains(event.target) &&
        !this._drawerButton.contains(event.target)
      ) {
        this._navigationDrawer.classList.remove("open");
        // Also close dropdown when drawer is closed
        this._closeDropdown();
      }
    });
  }

  _updateUserUI() {
    const isLoggedIn = AuthHelper.isLoggedIn();
    const userData = AuthHelper.getUserData();
    const usernameText = document.getElementById("username-text");
    const isAuthPage = this._isAuthPage();

    // Update user button text/display based on login status
    if (this._userButton && isLoggedIn && userData) {
      if (usernameText) {
        usernameText.textContent = userData.name;
      }
      this._userButton.style.display = "block";

      // Show logout option in dropdown
      if (this._logoutLink) {
        this._logoutLink.style.display = "block";
      }

      // Show navigation links when logged in
      if (this._navList) {
        this._navList.style.display = "flex";
      }
    } else if (this._userButton) {
      this._userButton.style.display = "none";

      // Hide logout option in dropdown
      if (this._logoutLink) {
        this._logoutLink.style.display = "none";
      }

      // Hide navigation links on auth pages when not logged in
      if (this._navList && isAuthPage) {
        this._navList.style.display = "none";
      } else if (this._navList) {
        this._navList.style.display = "flex";
      }
    }
  }

  // Helper method to check if we're on auth pages
  _isAuthPage() {
    const route = getActiveRoute();
    return route === '/login' || route === '/register';
  }

  _initBackToTop() {
    if (!this._backToTopButton) return;

    // Function to check if we're on the homepage
    const isHomePage = () => {
      const route = getActiveRoute();
      return route === '/' || route === '/page/:page';
    };

    // Function to toggle button visibility based on scroll position
    const toggleBackToTopVisibility = () => {
      if (!isHomePage()) {
        // First remove the visible class to trigger the fade-out animation
        this._backToTopButton.classList.remove('visible');
        // Then hide the button completely after the animation completes
        setTimeout(() => {
          this._backToTopButton.style.display = 'none';
        }, 300); // Match the transition duration in CSS
        return;
      }

      // Only set display to flex if it's not already visible
      if (this._backToTopButton.style.display !== 'flex') {
        this._backToTopButton.style.display = 'flex';
        // Force a reflow to ensure the display change takes effect before adding the visible class
        this._backToTopButton.offsetHeight;
      }

      if (window.scrollY > 800) {
        this._backToTopButton.classList.add('visible');
      } else {
        this._backToTopButton.classList.remove('visible');
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleBackToTopVisibility);

    // Add hashchange event listener to check if we're on the homepage
    window.addEventListener('hashchange', () => {
      // On hashchange, immediately hide the button to prevent the glitch
      if (!isHomePage()) {
        this._backToTopButton.style.display = 'none';
        this._backToTopButton.classList.remove('visible');
      }
      // Then check visibility after a short delay to allow the page to render
      setTimeout(toggleBackToTopVisibility, 50);
    });

    // Initial check
    toggleBackToTopVisibility();

    // Add click event listener to scroll to top
    this._backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  _initFabVisibility() {
    if (!this._createStoryFab) return;

    // Function to check if we're on auth pages (login or register)
    const isAuthPage = () => {
      const route = getActiveRoute();
      return route === '/login' || route === '/register';
    };

    // Function to check if we're on the create-story page
    const isCreateStoryPage = () => {
      const route = getActiveRoute();
      return route === '/create-story';
    };

    // Function to check if we're on the settings page
    const isSettingsPage = () => {
      const route = getActiveRoute();
      return route === '/settings';
    };

    // Function to check if we're on the about page
    const isAboutPage = () => {
      const route = getActiveRoute();
      return route === '/about';
    };

    // Function to toggle header buttons, navigation links, and FAB visibility
    const toggleElementsVisibility = () => {
      if (isAuthPage()) {
        // Hide header buttons, navigation links, and FAB on auth pages
        if (this._headerActions) {
          this._headerActions.style.display = 'none';
        }
        if (this._createStoryFab) {
          this._createStoryFab.style.display = 'none';
        }
        if (this._navList) {
          this._navList.style.display = 'none';
        }
      } else {
        // Show header buttons on non-auth pages
        if (this._headerActions) {
          this._headerActions.style.display = 'flex';
        }

        // Show navigation links on non-auth pages if logged in
        if (this._navList && AuthHelper.isLoggedIn()) {
          this._navList.style.display = 'flex';
        }

        // Show FAB only on home and detail story pages
        // Hide on auth, create-story, settings, and about pages
        if (this._createStoryFab) {
          const shouldHideFab = isCreateStoryPage() || isSettingsPage() || isAboutPage();
          this._createStoryFab.style.display = shouldHideFab ? 'none' : 'flex';
        }
      }
    };

    // Add hashchange event listener to check current page
    window.addEventListener('hashchange', toggleElementsVisibility);

    // Initial check
    toggleElementsVisibility();
  }



  _initAccessibility() {
    // Handle skip to content functionality
    const skipLink = document.querySelector('.skip-to-content');

    if (skipLink) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();

        // Get the target element
        const targetId = skipLink.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Set focus to the target element
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();

          // Remove tabindex after focus to prevent keyboard navigation issues
          setTimeout(() => {
            targetElement.removeAttribute('tabindex');
          }, 1000);

          // Scroll to the target element with offset
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });

      // Update skip link href when page changes
      window.addEventListener('hashchange', () => {
        // Only show skip link on home page
        const route = getActiveRoute();
        const isHomePage = route === '/' || route === '/page/:page';

        skipLink.style.display = isHomePage ? 'block' : 'none';
      });

      // Initial check
      const route = getActiveRoute();
      const isHomePage = route === '/' || route === '/page/:page';
      skipLink.style.display = isHomePage ? 'block' : 'none';
    }
  }


  async renderPage() {
    try {
      const route = getActiveRoute();
      const page = routes[route];

      if (!page) {
        this._content.innerHTML =
          '<div class="container"><h2>404 - Page Not Found</h2></div>';
        return;
      }

      // Check if we're on auth pages (login or register)
      const isAuthPage = route === '/login' || route === '/register';

      // Check if we're on the create-story page
      const isCreateStoryPage = route === '/create-story';

      // Check if we're on the detail-story page
      const isDetailStoryPage = route.startsWith('/story/');

      // Get the previous route to determine transition type
      const previousRoute = this._previousRoute || '';

      // Check if we're transitioning from home to story detail or vice versa
      const isHomeToDetailTransition = (previousRoute === '/' || previousRoute.startsWith('/page/')) && isDetailStoryPage;
      const isDetailToHomeTransition = previousRoute.startsWith('/story/') && (route === '/' || route.startsWith('/page/'));

      // Check if we're transitioning from login to home
      const isLoginToHomeTransition = previousRoute === '/login' && (route === '/' || route.startsWith('/page/'));

      // Check if we're transitioning from register to home
      const isRegisterToHomeTransition = previousRoute === '/register' && (route === '/' || route.startsWith('/page/'));

      // Check if we're transitioning to settings or about page
      const isToSettingsTransition = route === '/settings';
      const isToAboutTransition = route === '/about';

      // Check if we're transitioning from settings or about back to home
      const isFromSettingsTransition = previousRoute === '/settings' && (route === '/' || route.startsWith('/page/'));
      const isFromAboutTransition = previousRoute === '/about' && (route === '/' || route.startsWith('/page/'));

      // Check if we're transitioning from create-story page
      const isFromCreateStoryTransition = previousRoute === '/create-story' && (route === '/' || route.startsWith('/page/'));

      // Before rendering a new page, immediately hide the back-to-top button
      // to prevent it from showing during page transitions
      if (this._backToTopButton) {
        const isHomePage = route === '/' || route.startsWith('/page/');
        if (!isHomePage) {
          this._backToTopButton.style.display = 'none';
          this._backToTopButton.classList.remove('visible');
        }
      }

      // Handle header buttons visibility
      if (this._headerActions) {
        this._headerActions.style.display = isAuthPage ? 'none' : 'flex';
      }

      // Handle navigation links visibility
      if (this._navList) {
        // Hide navigation links on auth pages, show on other pages if logged in
        const isLoggedIn = AuthHelper.isLoggedIn();
        if (isAuthPage) {
          this._navList.style.display = 'none';
        } else if (isLoggedIn) {
          this._navList.style.display = 'flex';
        }
      }

      // Handle FAB button visibility
      if (this._createStoryFab) {
        // Check if we're on settings or about page
        const isSettingsPage = route === '/settings';
        const isAboutPage = route === '/about';

        // Show FAB only on home and detail story pages
        // Hide on auth, create-story, settings, and about pages
        const shouldHideFab = isAuthPage || isCreateStoryPage || isSettingsPage || isAboutPage;
        this._createStoryFab.style.display = shouldHideFab ? 'none' : 'flex';
      }

      // Clean up previous page if it has a destroy method
      // This is important for pages like create-story that need to clean up resources
      if (this._currentPage && typeof this._currentPage.destroy === 'function') {
        console.log('Calling destroy on previous page');
        this._currentPage.destroy();
      }

      // Store the current page for cleanup on next navigation
      this._currentPage = page;

      // Use View Transitions API if available
      const shouldUseViewTransition = document.startViewTransition && (
        isHomeToDetailTransition ||
        isDetailToHomeTransition ||
        isLoginToHomeTransition ||
        isRegisterToHomeTransition ||
        isToSettingsTransition ||
        isToAboutTransition ||
        isFromSettingsTransition ||
        isFromAboutTransition ||
        // Removed create-story transitions
        isFromCreateStoryTransition
      );

      if (shouldUseViewTransition) {
        // Use View Transitions API for smooth transitions
        const transition = document.startViewTransition(async () => {
          this._content.innerHTML = await page.render();
          await page.afterRender();
          this._navigationDrawer.classList.remove("open");
          this._updateBackToTopButton(route);
          this._updateUserUI(); // Ensure user UI is updated after page render
        });



        transition.ready.catch(error => {
          console.warn('View transition failed:', error);
        });
      } else {
        // Regular page rendering without transitions
        this._content.innerHTML = await page.render();
        await page.afterRender();
        this._navigationDrawer.classList.remove("open");
        this._updateBackToTopButton(route);
        this._updateUserUI(); // Ensure user UI is updated after page render


      }

      // Store the current route for next navigation
      this._previousRoute = route;
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML =
        '<div class="container"><h2>Something went wrong</h2><p>Please try again later</p></div>';
    }
  }

  // Helper method to update back-to-top button visibility
  _updateBackToTopButton(route) {
    if (!this._backToTopButton) return;

    const isHomePage = route === '/' || route.startsWith('/page/');
    if (isHomePage) {
      // Only set display to flex if we're on the homepage
      this._backToTopButton.style.display = 'flex';
      // Force a reflow to ensure the display change takes effect
      this._backToTopButton.offsetHeight;

      // Only show the button if we've scrolled down
      if (window.scrollY > 800) {
        this._backToTopButton.classList.add('visible');
      } else {
        this._backToTopButton.classList.remove('visible');
      }
    }
  }
}

export default App;
