import { formatSimpleDate } from '../utils/index';

class DetailStoryView {
  constructor() {
    this.formatSimpleDate = formatSimpleDate;
  }

  getTemplate() {
    return `
      <div class="container">
        <div class="detail-story-container">
          <a href="#/" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
          </a>
          <div class="detail-story-content-container">
            <!-- Detail story content will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  getLoadingTemplate() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading story details...</p>
      </div>
    `;
  }

  getErrorTemplate(message = 'Failed to load story details. Please try again later.') {
    return `
      <div class="error-container">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="#/" class="btn">Back to Home</a>
      </div>
    `;
  }

  getDetailTemplate(story) {
    return `
      <div class="detail-story" style="view-transition-name: story-card-${story.id}">
        <div class="detail-story-header">
          <h1 class="detail-story-title" style="view-transition-name: story-title-${story.id}">${story.title}</h1>
          <div class="detail-story-meta">
            ${story.location ? `
              <div class="detail-story-location">
                <i class="fas fa-map-marker-alt"></i> ${story.location}
              </div>
            ` : ''}
            <div class="detail-story-date">
              <i class="fas fa-calendar-alt"></i> ${this.formatSimpleDate(story.createdAt)}
            </div>
          </div>
        </div>

        ${story.photo ? `
          <div class="detail-story-image" style="view-transition-name: story-image-${story.id}">
            <img src="${story.photo}" alt="${story.title}" loading="lazy">
          </div>
        ` : ''}

        <div class="detail-story-content" style="view-transition-name: story-content-${story.id}">
          <div class="detail-story-description">
            <p>${this._formatDescription(story.description)}</p>
          </div>

          ${story.lat && story.lon ? `
            <div class="detail-story-map-container">
              <h2>Location</h2>
              <div id="detail-map" class="detail-map"></div>
            </div>
          ` : ''}
        </div>

        <div class="detail-story-actions">
          <a href="#/" class="btn btn-back" id="back-to-stories">
            <i class="fas fa-arrow-left"></i> Back to Stories
          </a>
        </div>
      </div>
    `;
  }

  _formatDescription(text) {
    if (!text) return '';

    // Replace newlines with paragraph breaks
    return text
      .split('\n')
      .filter(paragraph => paragraph.trim() !== '')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }
}

export default DetailStoryView;