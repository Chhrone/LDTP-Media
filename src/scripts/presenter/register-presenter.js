import RegisterView from '../views/register-view';
import AuthHelper from '../utils/auth-helper';
import { sleep, shuffleArray } from '../utils/index';
import authPresenter from './auth-presenter';
import notificationPresenter from './notification-presenter';

class RegisterPage {
  constructor() {
    this._view = new RegisterView();
    this._loadingMessages = [
      'Creating your account...',
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
    // Always render the register form, even if the user is logged in
    return this._view.getTemplate();
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

    this._view.initializeRegisterForm(async (registerData) => {
      try {
        this._view.showLoading();
        this._startLoadingAnimation();

        await authPresenter.register(registerData);

        await authPresenter.login({
          email: registerData.email,
          password: registerData.password,
        });

        await sleep(1000);

        const userData = AuthHelper.getUserData();
        this._view.updateNavigationUI(userData);

        // Ask for notification permission after successful registration
        try {
          await notificationPresenter.requestPermissionAndSubscribe();
        } catch (notificationError) {
          console.error('Notification subscription error:', notificationError);
          // Continue with registration flow even if notification subscription fails
        }

        this._view.navigateTo('#/', true);
      } catch (error) {
        console.error('Registration error:', error);
        this._view.hideLoading();
        this._view.showError(error.message);
      }
    });
  }

  async _startLoadingAnimation() {
    this._view.updateLoadingText('Creating your account...');
    await sleep(1500);
    const remainingMessages = this._loadingMessages.filter(msg => msg !== 'Creating your account...');

    const shuffledMessages = shuffleArray(remainingMessages);
    let messageIndex = 0;

    while (messageIndex < shuffledMessages.length) {
      this._view.updateLoadingText(shuffledMessages[messageIndex]);
      await sleep(1500);
      messageIndex = (messageIndex + 1) % shuffledMessages.length;
    }
  }
}

export default RegisterPage;
