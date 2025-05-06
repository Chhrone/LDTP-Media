import { formatSimpleDate } from '../utils/index';

class HomeView {
  constructor() {
    this.formatSimpleDate = formatSimpleDate;
  }

  getTemplate(data) {
    const { title, description, featuredStories, pagination } = data;

    return `
      <div class="container-fluid" style="view-transition-name: home-return">
        <section class="hero" style="view-transition-name: hero-section">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <h1>${title}</h1>
            <p>${description}</p>
            <div class="hero-cta-container">
              <a href="#/create-story" class="hero-btn hero-btn-primary" style="view-transition-name: create-story-button">Create Your Story</a>
              <a href="#map-section" class="hero-btn hero-btn-secondary">Explore Map</a>
            </div>
          </div>
        </section>
      </div>
      <div class="container" style="view-transition-name: home-content">

        <section class="featured-stories">
          <h2>Featured Stories</h2>
          <div id="stories-list" class="stories-list">
            ${featuredStories.map(story => `
              <article class="story-card" data-story-id="${story.id}" style="view-transition-name: story-card-${story.id}">
                ${story.photo ? `<div class="story-image" style="view-transition-name: story-image-${story.id}">
                  <img src="${story.photo}" alt="${story.title}" loading="lazy">
                </div>` : ''}
                <div class="story-content" style="view-transition-name: story-content-${story.id}">
                  <h3 style="view-transition-name: story-title-${story.id}">${story.title}</h3>
                  <p>${story.excerpt}</p>

                  <div class="story-divider"></div>

                  <div class="story-info">
                    <div class="left-info">
                      ${story.location ? `<div class="story-location">
                        <i class="fas fa-map-marker-alt"></i> ${story.location}
                      </div>` : ''}
                      <div class="story-date">
                        <i class="fas fa-calendar-alt"></i> ${this.formatSimpleDate(story.createdAt)}
                      </div>
                    </div>
                    <div class="right-info">
                      <div class="story-actions">
                        <a href="#/story/${story.id}" class="story-action-link" data-story-id="${story.id}">Read More</a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>

          ${this._getPaginationTemplate(pagination)}
        </section>

        <section id="map-section" class="map-section" style="view-transition-name: map-section">
          <h2>Story Locations</h2>
          <div class="map-actions">
            <div class="map-style-controls">
              <button class="map-style-button active" data-style="streets">Streets</button>
              <button class="map-style-button" data-style="outdoor">Outdoor</button>
              <button class="map-style-button" data-style="aquarelle">Aquarelle</button>
              <button class="map-style-button" data-style="bright">Bright</button>
              <button class="map-style-button" data-style="dark">Dark</button>
            </div>
            <button id="locate-me-button" class="locate-me-button">
              <i class="fas fa-location-arrow"></i> Locate Me
            </button>
          </div>
          <div id="map-container" class="map-container"></div>
        </section>
      </div>
    `;
  }

  _getPaginationTemplate(pagination) {
    const { currentPage, totalPages } = pagination;

    // Generate pagination links
    let paginationLinks = '';

    // First page button
    const firstDisabled = currentPage <= 1 ? 'disabled' : '';
    paginationLinks += `<a href="#/page/1"
                          class="pagination-link pagination-first ${firstDisabled}"
                          data-page="1"
                          title="First Page"
                          ${firstDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-double-left"></i>
                        </a>`;

    // Previous button
    const prevDisabled = currentPage <= 1 ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${currentPage - 1}"
                          class="pagination-link pagination-prev ${prevDisabled}"
                          data-page="${currentPage - 1}"
                          title="Previous Page"
                          ${prevDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-left"></i>
                        </a>`;

    // Calculate which page numbers to show (only 4)
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 3);

    // Adjust if we're near the end
    if (endPage - startPage < 3) {
      startPage = Math.max(1, endPage - 3);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage ? 'active' : '';
      paginationLinks += `<a href="#/page/${i}"
                            class="pagination-link pagination-number ${isActive}"
                            data-page="${i}"
                            title="Page ${i}">
                            ${i}
                          </a>`;
    }

    // Next button
    const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${currentPage + 1}"
                          class="pagination-link pagination-next ${nextDisabled}"
                          data-page="${currentPage + 1}"
                          title="Next Page"
                          ${nextDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-right"></i>
                        </a>`;

    // Last page button
    const lastDisabled = currentPage >= totalPages ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${totalPages}"
                          class="pagination-link pagination-last ${lastDisabled}"
                          data-page="${totalPages}"
                          title="Last Page"
                          ${lastDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-double-right"></i>
                        </a>`;

    return `
      <div class="pagination" style="view-transition-name: pagination-section">
        ${paginationLinks}
      </div>
    `;
  }
}

export default HomeView;
