/**
 * Navbar handler for managing navigation bar interactions
 * Handles drawer toggle, dropdown menus, and authentication UI updates
 */
import { getActiveRoute } from "../routes/url-parser";
import AuthHelper from "./auth-helper";

class NavbarHandler {
  /**
   * Initializes the navbar handler with required DOM elements
   * @param {Object} options
   * @param {HTMLElement} options.drawerButton 
   * @param {HTMLElement} options.navigationDrawer 
   * @param {HTMLElement} options.userButton 
   * @param {HTMLElement} options.dropdownContent 
   * @param {HTMLElement} options.logoutLink 
   * @param {HTMLElement} options.navList
   */
  constructor({ drawerButton, navigationDrawer, userButton, dropdownContent, logoutLink, navList }) {
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._userButton = userButton;
    this._dropdownContent = dropdownContent;
    this._logoutLink = logoutLink;
    this._navList = navList;

    this._initNavbarEvents();
  }

  /**
   * Initializes event listeners for navbar interactions
   */
  _initNavbarEvents() {
    this._drawerButton.addEventListener("click", (event) => {
      this._navigationDrawer.classList.toggle("open");
      this._closeDropdown();
      event.stopPropagation();
    });

    if (this._userButton) {
      this._userButton.addEventListener("click", (event) => {
        this._dropdownContent.classList.toggle("show");
        const dropdownIcon = this._userButton.querySelector("i");
        if (dropdownIcon) {
          dropdownIcon.classList.toggle("rotated");
        }
        event.stopPropagation();
      });
    }

    const navLinks = document.querySelectorAll('.nav-list a, .dropdown-content a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (link.id === 'logout-link') return;
        this._closeDropdown();
        this._navigationDrawer.classList.remove("open");
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !this._navigationDrawer.contains(event.target) &&
        !this._drawerButton.contains(event.target)
      ) {
        this._navigationDrawer.classList.remove("open");
        this._closeDropdown();
      }
    });
  }

  /**
   * Closes the user dropdown menu
   */
  _closeDropdown() {
    if (this._dropdownContent && this._dropdownContent.classList.contains("show")) {
      this._dropdownContent.classList.remove("show");
      const dropdownIcon = this._userButton.querySelector("i");
      if (dropdownIcon) {
        dropdownIcon.classList.remove("rotated");
      }
    }
  }

  closeDropdown() {
    this._closeDropdown();
  }

  /**
   * Updates UI elements based on user authentication status
   * Shows/hides user button, logout link, and navigation links
   */
  updateUserUI() {
    const isLoggedIn = AuthHelper.isLoggedIn();
    const userData = AuthHelper.getUserData();
    const usernameText = document.getElementById("username-text");
    const isAuthPage = this.isAuthPage();

    if (this._userButton && isLoggedIn && userData) {
      if (usernameText) {
        usernameText.textContent = userData.name;
      }
      this._userButton.style.display = "block";

      if (this._logoutLink) {
        this._logoutLink.style.display = "block";
      }

      if (this._navList) {
        this._navList.style.display = "flex";
      }
    } else if (this._userButton) {
      this._userButton.style.display = "none";

      if (this._logoutLink) {
        this._logoutLink.style.display = "none";
      }

      if (this._navList && isAuthPage) {
        this._navList.style.display = "none";
      } else if (this._navList) {
        this._navList.style.display = "flex";
      }
    }
  }

  /**
   * Checks if current page is an authentication page
   * @returns {boolean} True if current page is login or register
   */
  isAuthPage() {
    const route = getActiveRoute();
    return route === '/login' || route === '/register';
  }

  closeNavigationDrawer() {
    this._navigationDrawer.classList.remove("open");
  }
}

export default NavbarHandler;
