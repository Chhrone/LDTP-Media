import LoginView from '../views/login-view';
import AuthHelper from '../utils/auth-helper';
import { sleep, shuffleArray } from '../utils/index';
import authPresenter from './auth-presenter';

class LoginPage {
  constructor() {
    this._view = new LoginView();
    this._loadingMessages = [
      'Logging in...',
      'Checking the weather...',
      'Folding your journal...',
      'Sticking a pin on the map...',
      'Zipping up your backpack...',
      'Loading the city lights...',
      'Sweeping sand out of your shoes...',
      'Unpacking your story...',
      'Charging the camera...',
      'Charging the camera... again...',
      'Tucking your passport...',
      'Recording the sound of waves...',
      'Smoothing out the map wrinkles...',
      'Dusting off the hiking boots...',
      'Snapping one last photo...',
      'Fueling up for the next adventure...',
      'Brushing off the trail dust...',
      'Waiting for the next train...',
      'Uploading your legends...',
      'Saving your sunburned memories...'
    ];
  }

  async render() {
    if (AuthHelper.redirectIfLoggedIn()) {
      return '';
    }

    return this._view.getTemplate();
  }
  async afterRender() {
    const loginForm = document.getElementById('login-form');
    const guestPostButton = document.getElementById('guest-post-button');

    if (guestPostButton) {
      guestPostButton.addEventListener('click', () => {
        if (document.startViewTransition) {
          window.location.hash = '#/guest-story';
        } else {
          window.location.hash = '#/guest-story';
        }
      });
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      this._view.clearError();

      const formData = new FormData(loginForm);
      const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      try {
        this._view.showLoading();
        this._startLoadingAnimation();

        await authPresenter.login(loginData);
        await sleep(1500);

        const navList = document.getElementById('nav-list');
        const userButton = document.getElementById('user-button');
        const usernameText = document.getElementById('username-text');
        const userData = AuthHelper.getUserData();

        if (navList) {
          navList.style.display = 'flex';
        }

        if (userButton && userData) {
          userButton.style.display = 'block';
          if (usernameText) {
            usernameText.textContent = userData.name;
          }

          const logoutLink = document.getElementById('logout-link');
          if (logoutLink) {
            logoutLink.style.display = 'block';
          }
        }
        if (document.startViewTransition) {
          window.location.hash = '#/';
        } else {
          window.location.hash = '#/';
          window.location.reload();
        }
      } catch (error) {
        console.error('Login error:', error);
        this._view.hideLoading();
        this._view.showError(error.message);
      }
    });
  }

  async _startLoadingAnimation() {
    this._view.updateLoadingText('Logging in...');
    await sleep(1500);

    const remainingMessages = this._loadingMessages.filter(msg => msg !== 'Logging in...');
    const shuffledMessages = shuffleArray(remainingMessages);
    let messageIndex = 0;

    while (messageIndex < shuffledMessages.length) {
      this._view.updateLoadingText(shuffledMessages[messageIndex]);
      await sleep(1500);
      messageIndex = (messageIndex + 1) % shuffledMessages.length;
    }
  }
}

export default LoginPage;
