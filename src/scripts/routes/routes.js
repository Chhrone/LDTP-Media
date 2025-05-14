import HomePage from '../presenter/home-presenter';
import AboutPage from '../presenter/about-presenter';
import SettingsPage from '../presenter/settings-presenter';
import CreateStoryPage from '../presenter/create-story-presenter';
import DetailStoryPage from '../presenter/detail-story-presenter';
import LoginPage from '../presenter/login-presenter';
import RegisterPage from '../presenter/register-presenter';
import GuestStoryPage from '../presenter/guest-story-presenter';
import NotFoundPage from '../presenter/not-found-presenter';
import ArchivePage from '../presenter/archive-presenter';

const routes = {
  '/': new HomePage(),
  '/page/:page': new HomePage(),
  '/about': new AboutPage(),
  '/settings': new SettingsPage(),
  '/create-story': new CreateStoryPage(),
  '/guest-story': new GuestStoryPage(),
  '/story/:id': new DetailStoryPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/not-found': new NotFoundPage(),
  '/archive': new ArchivePage(),
};

export default routes;
