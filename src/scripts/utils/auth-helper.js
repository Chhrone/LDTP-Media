import authPresenter from '../presenter/auth-presenter';

const AuthHelper = {
  isLoggedIn() {
    return authPresenter.isLoggedIn();
  },

  getUserData() {
    return authPresenter.getUserData();
  },

  checkAuth() {
    return authPresenter.checkAuth();
  },

  redirectIfLoggedIn() {
    return authPresenter.redirectIfLoggedIn();
  },
};

export default AuthHelper;
