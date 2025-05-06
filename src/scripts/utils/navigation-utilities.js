/**
 * Navigation utilities for handling page navigation and story focus
 * Provides functions for pagination, story focus, and page transitions
 */
class NavigationUtilities {
  /**
   * Focuses on a story card by ID with optional highlighting
   * @param {string} storyId - ID of the story to focus on
   * @param {number} currentPage - Current page number
   * @param {boolean} highlight - Whether to highlight the story card
   * @returns {boolean} Whether the story was found and focused
   */
  static focusOnStory(storyId, currentPage) {
    if (!storyId) return false;

    const storyCard = document.querySelector(`.story-card[data-story-id="${storyId}"]`);
    if (!storyCard) return false;

    const cardPosition = storyCard.getBoundingClientRect().top + window.pageYOffset;
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const adjustedPosition = cardPosition - headerHeight - 20;

    window.scrollTo({
      top: adjustedPosition,
      behavior: 'auto'
    });

    storyCard.classList.add('highlight-card');
    setTimeout(() => {
      storyCard.classList.remove('highlight-card');
    }, 2000);

    return true;
  }

  /**
   * Handles returning to a story from the detail page
   * @param {number} currentPage 
   */
  static handleReturnToStory(currentPage) {
    const lastViewedStoryId = sessionStorage.getItem('lastViewedStoryId');
    const lastViewedPage = sessionStorage.getItem('lastViewedPage');

    if (!lastViewedStoryId) return;

    requestAnimationFrame(() => {
      if (lastViewedPage && parseInt(lastViewedPage) !== currentPage) {
        window.location.hash = `#/page/${lastViewedPage}`;
        return;
      }

      const focused = NavigationUtilities.focusOnStory(lastViewedStoryId, currentPage);

      if (focused) {
        sessionStorage.removeItem('lastViewedStoryId');
        console.log(`Focused on story ${lastViewedStoryId} on page ${currentPage}`);
      } else {
        console.log(`Story with ID ${lastViewedStoryId} not found on page ${currentPage}`);
      }
    });
  }

  /**
   * Sets up pagination links with proper event handling
   * @param {Function} onPageChange - Callback for page change events
   */
  static setupPaginationLinks(onPageChange) {
    const paginationLinks = document.querySelectorAll('.pagination-link');

    paginationLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = parseInt(link.dataset.page, 10);

        if (onPageChange) {
          onPageChange(page);
        }
      });
    });
  }

  /**
   * Sets up smooth scrolling for anchor links
   * @param {string} buttonSelector 
   * @param {string} targetSelector 
   */
  static setupSmoothScrolling(buttonSelector, targetSelector) {
    const button = document.querySelector(buttonSelector);
    if (!button) return;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
}

export default NavigationUtilities;
