import AuthModel from '../models/auth-model';

class AuthPresenter {
  constructor() {
    this._model = new AuthModel();
  }

  isLoggedIn() {
    return this._model.isLoggedIn();
  }

  getUserData() {
    return this._model.getUserData();
  }

  logout() {
    this._model.logout();
  }

  getToken() {
    return this._model.getToken();
  }

  async login(loginData) {
    return await this._model.login(loginData);
  }

  async register(registerData) {
    return await this._model.register(registerData);
  }

  /**
   * Check if a route requires authentication
   * @param {string} route - The route to check
   * @returns {boolean} - True if the route requires authentication
   */
  requiresAuth(route) {
    const publicRoutes = ['/login', '/register', '/guest-story', '/not-found'];
    return !publicRoutes.includes(route);
  }

  /**
   * Check if user is authenticated and redirect to login if not
   * @param {string} route - The current route
   * @returns {boolean} - True if user is authenticated
   */
  checkAuth(route) {
    if (this.requiresAuth(route) && !this.isLoggedIn()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      // Don't redirect if we're on the login or register page
      const currentHash = window.location.hash;
      if (currentHash !== '#/login' && currentHash !== '#/register') {
        window.location.hash = '#/';
      }
      return true;
    }
    return false;
  }
}

const authPresenter = new AuthPresenter();
export default authPresenter;
