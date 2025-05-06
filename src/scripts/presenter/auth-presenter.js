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

  checkAuth() {
    if (!this.isLoggedIn()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.hash = '#/';
      return true;
    }
    return false;
  }
}

const authPresenter = new AuthPresenter();
export default authPresenter;
