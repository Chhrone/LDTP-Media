import RegisterView from '../views/register-view';
import AuthHelper from '../utils/auth-helper';
import { sleep, shuffleArray } from '../utils/index';
import authPresenter from './auth-presenter';

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
    if (AuthHelper.redirectIfLoggedIn()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    // Initialize guest post button
    this._view.initializeGuestPostButton(() => {
      this._view.navigateTo('#/guest-story');
    });

    // Initialize register form
    this._view.initializeRegisterForm(async (registerData) => {
      try {
        // Show loading animation
        this._view.showLoading();

        // Start the loading message animation
        this._startLoadingAnimation();

        // Register the user
        await authPresenter.register(registerData);

        // Auto-login after successful registration
        await authPresenter.login({
          email: registerData.email,
          password: registerData.password,
        });

        // Add a small delay for better UX
        await sleep(1000);

        // Update navigation UI
        const userData = AuthHelper.getUserData();
        this._view.updateNavigationUI(userData);

        // Navigate to homepage with view transitions
        this._view.navigateTo('#/', true);
      } catch (error) {
        console.error('Registration error:', error);
        this._view.hideLoading();
        this._view.showError(error.message);
      }
    });
  }

  async _startLoadingAnimation() {
    // Always start with "Creating your account..."
    this._view.updateLoadingText('Creating your account...');
    await sleep(1500);
    const remainingMessages = this._loadingMessages.filter(msg => msg !== 'Creating your account...');

    // Shuffle the remaining loading messages to display them in random order
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
