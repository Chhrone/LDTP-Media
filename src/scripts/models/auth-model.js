import CONFIG from '../config';

class AuthModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
    this._tokenKey = CONFIG.KEY_TOKEN;
    this._userKey = CONFIG.KEY_USER;
  }

  async register({ name, email, password }) {
    try {
      const response = await fetch(`${this._baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login({ email, password }) {
    try {
      const response = await fetch(`${this._baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      this._saveToken(responseJson.loginResult.token);
      this._saveUserData({
        id: responseJson.loginResult.userId,
        name: responseJson.loginResult.name,
        email,
      });

      return responseJson;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  logout() {
    localStorage.removeItem(this._tokenKey);
    localStorage.removeItem(this._userKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getToken() {
    return localStorage.getItem(this._tokenKey);
  }

  getUserData() {
    const userData = localStorage.getItem(this._userKey);
    return userData ? JSON.parse(userData) : null;
  }

  _saveToken(token) {
    localStorage.setItem(this._tokenKey, token);
  }

  _saveUserData(userData) {
    localStorage.setItem(this._userKey, JSON.stringify(userData));
  }
}

export default AuthModel;
