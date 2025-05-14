import { getActiveRoute } from "../routes/url-parser";

class PageTransitionHandler {
  constructor() {
    this._previousRoute = null;
  }

  /**
   * Determines if navigation is between pagination pages or between home and pagination
   */
  isPaginationNavigation(previousRoute, currentRoute) {
    const isPreviousPagination = previousRoute && previousRoute.startsWith('/page/');
    const isCurrentPagination = currentRoute && currentRoute.startsWith('/page/');
    const isFromHomeToPagination = (previousRoute === '/' && isCurrentPagination);
    const isFromPaginationToHome = (isPreviousPagination && currentRoute === '/');

    return (isPreviousPagination && isCurrentPagination) ||
           isFromHomeToPagination ||
           isFromPaginationToHome;
  }

  isHomeToDetailTransition(previousRoute, currentRoute) {
    return (previousRoute === '/' || previousRoute.startsWith('/page/')) &&
           currentRoute.startsWith('/story/');
  }

  isDetailToHomeTransition(previousRoute, currentRoute) {
    return previousRoute.startsWith('/story/') &&
           (currentRoute === '/' || currentRoute.startsWith('/page/'));
  }

  /**
   * Determines if view transitions API should be used based on navigation type
   * Checks various transition patterns to apply appropriate animations
   */
  shouldUseViewTransition(previousRoute, currentRoute) {
    if (!document.startViewTransition) return false;

    const isHomeToDetailTransition = this.isHomeToDetailTransition(previousRoute, currentRoute);
    const isDetailToHomeTransition = this.isDetailToHomeTransition(previousRoute, currentRoute);
    const isLoginToHomeTransition = previousRoute === '/login' &&
                                   (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isRegisterToHomeTransition = previousRoute === '/register' &&
                                      (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isToSettingsTransition = currentRoute === '/settings';
    const isToAboutTransition = currentRoute === '/about';
    const isToArchiveTransition = currentRoute === '/archive';
    const isFromSettingsTransition = previousRoute === '/settings' &&
                                    (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isFromAboutTransition = previousRoute === '/about' &&
                                 (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isFromArchiveTransition = previousRoute === '/archive' &&
                                   (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isToCreateStoryTransition = currentRoute === '/create-story';
    const isFromCreateStoryTransition = previousRoute === '/create-story' &&
                                       (currentRoute === '/' || currentRoute.startsWith('/page/'));

    return isHomeToDetailTransition ||
           isDetailToHomeTransition ||
           isLoginToHomeTransition ||
           isRegisterToHomeTransition ||
           isToSettingsTransition ||
           isToAboutTransition ||
           isToArchiveTransition ||
           isFromSettingsTransition ||
           isFromAboutTransition ||
           isFromArchiveTransition ||
           isToCreateStoryTransition ||
           isFromCreateStoryTransition;
  }

  /**
   * Adds appropriate CSS classes to body based on transition type
   * These classes control transition animations in CSS
   */
  updateBodyClasses(previousRoute, currentRoute) {
    document.body.classList.remove('from-settings', 'from-about', 'from-archive', 'from-detail');

    const isFromSettingsTransition = previousRoute === '/settings' &&
                                    (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isFromAboutTransition = previousRoute === '/about' &&
                                 (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isFromArchiveTransition = previousRoute === '/archive' &&
                                   (currentRoute === '/' || currentRoute.startsWith('/page/'));
    const isDetailToHomeTransition = this.isDetailToHomeTransition(previousRoute, currentRoute);

    if (isFromSettingsTransition) {
      document.body.classList.add('from-settings');
    } else if (isFromAboutTransition) {
      document.body.classList.add('from-about');
    } else if (isFromArchiveTransition) {
      document.body.classList.add('from-archive');
    } else if (isDetailToHomeTransition) {
      document.body.classList.add('from-detail');
    }
  }

  getPreviousRoute() {
    return this._previousRoute;
  }

  setPreviousRoute(route) {
    this._previousRoute = route;
  }
}

export default PageTransitionHandler;
