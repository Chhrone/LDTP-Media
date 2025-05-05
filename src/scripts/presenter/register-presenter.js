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
    const registerForm = document.getElementById('register-form');
    const guestPostButton = document.getElementById('guest-post-button');

    // Add event listener for the guest post button
    if (guestPostButton) {
      guestPostButton.addEventListener('click', () => {
        // Navigate to the guest story page
        if (document.startViewTransition) {
          // Use View Transitions API if available
          window.location.hash = '#/guest-story';
        } else {
          window.location.hash = '#/guest-story';
        }
      });
    }

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      this._view.clearError();

      const formData = new FormData(registerForm);
      const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      };

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

        // Update navigation UI to show nav links and user button after successful registration and login
        const navList = document.getElementById('nav-list');
        const userButton = document.getElementById('user-button');
        const usernameText = document.getElementById('username-text');
        const userData = AuthHelper.getUserData();

        // Show navigation links
        if (navList) {
          navList.style.display = 'flex';
        }

        // Show and update user button
        if (userButton && userData) {
          userButton.style.display = 'block';
          if (usernameText) {
            usernameText.textContent = userData.name;
          }

          // Show logout option in dropdown
          const logoutLink = document.getElementById('logout-link');
          if (logoutLink) {
            logoutLink.style.display = 'block';
          }
        }

        // Use View Transitions API if available for smooth transition to homepage
        if (document.startViewTransition) {
          // Change the hash without reloading
          window.location.hash = '#/';

          // Don't reload the page - the app's hashchange handler will take care of rendering
          // The view transition will be handled by the app.js renderPage method
        } else {
          // Fallback for browsers that don't support View Transitions API
          window.location.hash = '#/';
          window.location.reload();
        }
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

    // Remove "Creating your account..." from the array to avoid duplication
    const remainingMessages = this._loadingMessages.filter(msg => msg !== 'Creating your account...');

    // Shuffle the remaining loading messages to display them in random order
    const shuffledMessages = shuffleArray(remainingMessages);
    let messageIndex = 0;

    // Update loading message every 1 second
    while (messageIndex < shuffledMessages.length) {
      this._view.updateLoadingText(shuffledMessages[messageIndex]);
      await sleep(1500);
      messageIndex = (messageIndex + 1) % shuffledMessages.length;
    }
  }
}

export default RegisterPage;
