import LoginView from '../views/login-view';
import AuthHelper from '../utils/auth-helper';
import { sleep, shuffleArray } from '../utils/index';
import authPresenter from './auth-presenter';
import notificationPresenter from './notification-presenter';

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
    this._view.initializeGuestPostButton(() => {
      this._view.navigateTo('#/guest-story');
    });

    this._view.initializeLoginForm(async (loginData) => {
      try {
        this._view.showLoading();
        this._startLoadingAnimation();

        await authPresenter.login(loginData);
        await sleep(1500);

        const userData = AuthHelper.getUserData();
        this._view.updateNavigationUI(userData);

        // Ask for notification permission after successful login
        try {
          await notificationPresenter.requestPermissionAndSubscribe();
        } catch (notificationError) {
          console.error('Notification subscription error:', notificationError);
        }

        this._view.navigateTo('#/', true);
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