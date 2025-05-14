import { getActiveRoute } from "../routes/url-parser";
import AuthHelper from "./auth-helper";

class FabVisibilityHandler {
  constructor({ createStoryFab, headerActions, navList }) {
    this._createStoryFab = createStoryFab;
    this._headerActions = headerActions;
    this._navList = navList;

    if (this._createStoryFab) {
      this._initFabVisibility();
    }
  }

  _initFabVisibility() {
    window.addEventListener('hashchange', () => this._toggleElementsVisibility());
    this._toggleElementsVisibility();
  }

  _isAuthPage() {
    const route = getActiveRoute();
    return route === '/login' || route === '/register';
  }

  _isCreateStoryPage() {
    const route = getActiveRoute();
    return route === '/create-story';
  }

  _isSettingsPage() {
    const route = getActiveRoute();
    return route === '/settings';
  }

  _isAboutPage() {
    const route = getActiveRoute();
    return route === '/about';
  }

  _isArchivePage() {
    const route = getActiveRoute();
    return route === '/archive';
  }

  /**
   * Manages visibility of UI elements based on current page
   * Shows/hides header buttons, navigation links, and FAB button
   */
  _toggleElementsVisibility() {
    if (this._isAuthPage()) {
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
      if (this._headerActions) {
        this._headerActions.style.display = 'flex';
      }

      if (this._navList && AuthHelper.isLoggedIn()) {
        this._navList.style.display = 'flex';
      }

      if (this._createStoryFab) {
        const shouldHideFab = this._isCreateStoryPage() || this._isSettingsPage() || this._isAboutPage() || this._isArchivePage();
        this._createStoryFab.style.display = shouldHideFab ? 'none' : 'flex';
      }
    }
  }

  /**
   * Updates FAB visibility for a specific route without checking other UI elements
   */
  updateFabVisibility(route) {
    if (!this._createStoryFab) return;

    const isAuthPage = route === '/login' || route === '/register';
    const isCreateStoryPage = route === '/create-story';
    const isSettingsPage = route === '/settings';
    const isAboutPage = route === '/about';
    const isArchivePage = route === '/archive';

    const shouldHideFab = isAuthPage || isCreateStoryPage || isSettingsPage || isAboutPage || isArchivePage;
    this._createStoryFab.style.display = shouldHideFab ? 'none' : 'flex';
  }
}

export default FabVisibilityHandler;
