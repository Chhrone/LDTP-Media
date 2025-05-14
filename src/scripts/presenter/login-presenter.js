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
    // Always render the login form
    const template = this._view.getTemplate();
    console.log('Login form template:', template); // Debug log
    return template;
  }

  async afterRender() {
    // Check if user is already logged in
    if (AuthHelper.isLoggedIn()) {
      const userData = AuthHelper.getUserData();
      if (userData) {
        this._view.showInfo(`You are already logged in as ${userData.name}. You can continue to the home page or log out first.`);
      }
    }

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

  _startLoadingAnimation() {
    let currentIndex = 0;
    const messages = shuffleArray([...this._loadingMessages]);

    const updateMessage = () => {
      if (currentIndex < messages.length) {
        this._view.updateLoadingText(messages[currentIndex]);
        currentIndex++;
        setTimeout(updateMessage, 2000);
      }
    };

    updateMessage();
  }
}

export default LoginPage;