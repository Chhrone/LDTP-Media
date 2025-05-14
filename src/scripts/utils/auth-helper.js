import authPresenter from '../presenter/auth-presenter';
import { getActiveRoute } from '../routes/url-parser';

const AuthHelper = {
  isLoggedIn() {
    return authPresenter.isLoggedIn();
  },

  getUserData() {
    return authPresenter.getUserData();
  },

  checkAuth() {
    const route = getActiveRoute();
    return authPresenter.checkAuth(route);
  },

  redirectIfLoggedIn() {
    return authPresenter.redirectIfLoggedIn();
  },

  requiresAuth(route) {
    return authPresenter.requiresAuth(route);
  }
};

export default AuthHelper;
