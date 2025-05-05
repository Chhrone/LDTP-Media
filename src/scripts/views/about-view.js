class AboutView {
  constructor() {
    this._initColorPalette = this._initColorPalette.bind(this);
  }

  getTemplate() {
    return `
      <div class="container">
        <div class="about-page" style="view-transition-name: about-page">
          <h1 class="about-title">About Loughshinny Dublinn Travel Post</h1>

          <div class="about-content">
            <div class="profile-section">
              <div class="profile-content">
                <div class="profile-image-container">
                  <img src="/profile.png" alt="Profile" class="profile-image">
                </div>
                <p class="profile-role">Web Developer & Arknights Enthusiast</p>
                <h2 class="profile-name">Rayina Ilham</h2>
              </div>
            </div>

            <div class="about-description">
              <h3>Our Mission</h3>
              <p>
                Loughshinny Dublinn Travel Post is dedicated to connecting travelers from around the world.
                We believe that sharing travel experiences enriches our understanding of different cultures
                and creates a global community of explorers.
              </p>

              <h3>What We Offer</h3>
              <p>
                Our platform allows you to share your travel stories with photos and precise locations,
                discover new destinations through other travelers' experiences, and connect with
                like-minded adventurers who share your passion for exploration.
              </p>

              <h3>Join Our Community</h3>
              <p>
                Whether you're a seasoned traveler or just starting your journey, Loughshinny Dublinn
                Travel Post welcomes you to join our growing community. Share your stories, find
                inspiration for your next adventure, and become part of our global network of explorers.
              </p>

              <h3>Project Information</h3>
              <div class="project-info">
                <p>
                  This project is part of a submission for <strong>Coding Camp 2025 by DBS Foundation</strong>.
                  The Loughshinny Dublinn Travel Post was developed as a demonstration of web development skills
                  using modern JavaScript, CSS, and HTML techniques.
                </p>
                <div class="social-links">
                  <a href="https://github.com/Chhrone" target="_blank" rel="noopener noreferrer" class="social-link">
                    <i class="fab fa-github"></i> GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/rayinailham/" target="_blank" rel="noopener noreferrer" class="social-link">
                    <i class="fab fa-linkedin"></i> LinkedIn
                  </a>
                </div>
              </div>

              <h3>Our Services</h3>
              <div class="services-grid">
                <div class="service-item">
                  <i class="fas fa-camera-retro"></i>
                  <h4>Story Sharing</h4>
                  <p>Share your travel experiences with photos and detailed descriptions</p>
                </div>
                <div class="service-item">
                  <i class="fas fa-map-marked-alt"></i>
                  <h4>Location Mapping</h4>
                  <p>Pin your stories to exact locations on interactive maps</p>
                </div>
                <div class="service-item">
                  <i class="fas fa-users"></i>
                  <h4>Community</h4>
                  <p>Connect with fellow travelers and explorers worldwide</p>
                </div>
                <div class="service-item">
                  <i class="fas fa-compass"></i>
                  <h4>Destination Discovery</h4>
                  <p>Find new and exciting places to visit through others' stories</p>
                </div>
              </div>

              <h3>Tech Stack</h3>
              <div class="tech-stack">
                <div class="tech-category">
                  <h4>Frontend</h4>
                  <ul class="tech-list">
                    <li><i class="fa-brands fa-html5"></i> HTML5</li>
                    <li><i class="fa-brands fa-css3-alt"></i> CSS3</li>
                    <li><i class="fa-brands fa-js"></i> JavaScript</li>
                    <li><i class="fa-solid fa-code"></i> Web Components</li>
                  </ul>
                </div>
                <div class="tech-category">
                  <h4>Libraries & APIs</h4>
                  <ul class="tech-list">
                    <li><i class="fa-solid fa-map"></i> Leaflet.js</li>
                    <li><i class="fa-solid fa-map-pin"></i> MapTiler</li>
                    <li><i class="fa-solid fa-camera"></i> MediaStream API</li>
                    <li><i class="fa-solid fa-bell"></i> SweetAlert2</li>
                  </ul>
                </div>
                <div class="tech-category">
                  <h4>Architecture</h4>
                  <ul class="tech-list">
                    <li><i class="fa-solid fa-sitemap"></i> MVP Pattern</li>
                    <li><i class="fa-solid fa-spa"></i> SPA</li>
                    <li><i class="fa-solid fa-route"></i> Custom Router</li>
                    <li><i class="fa-solid fa-mobile-alt"></i> Responsive Design</li>
                  </ul>
                </div>
              </div>

              <h3>Color Palette</h3>
              <div class="color-palette">
                <div class="color-item" style="background-color: var(--dark-brown);" data-color="#2F2925">
                  <span class="color-name">Dark Brown</span>
                  <span class="color-hex">#2F2925</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
                <div class="color-item" style="background-color: var(--medium-brown);" data-color="#37312E">
                  <span class="color-name">Medium Brown</span>
                  <span class="color-hex">#37312E</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
                <div class="color-item" style="background-color: var(--warm-brown);" data-color="#453325">
                  <span class="color-name">Warm Brown</span>
                  <span class="color-hex">#453325</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
                <div class="color-item" style="background-color: var(--orange-accent);" data-color="#D48944">
                  <span class="color-name">Orange Accent</span>
                  <span class="color-hex">#D48944</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
                <div class="color-item" style="background-color: var(--light-beige);" data-color="#F5EFE7">
                  <span class="color-name">Light Beige</span>
                  <span class="color-hex">#F5EFE7</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
                <div class="color-item" style="background-color: var(--cream);" data-color="#E8DCCA">
                  <span class="color-name">Cream</span>
                  <span class="color-hex">#E8DCCA</span>
                  <span class="copy-tooltip">Click to copy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    this._initColorPalette();
  }

  _initColorPalette() {
    const colorItems = document.querySelectorAll('.color-item');

    colorItems.forEach(item => {
      item.addEventListener('click', () => {
        const colorHex = item.getAttribute('data-color');
        this._copyToClipboard(colorHex, item);
      });
    });
  }

  _copyToClipboard(text, element) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show copied feedback
        const tooltip = element.querySelector('.copy-tooltip');
        tooltip.textContent = 'Copied!';
        element.classList.add('copied');

        // Reset after 2 seconds
        setTimeout(() => {
          tooltip.textContent = 'Click to copy';
          element.classList.remove('copied');
        }, 2000);

        // Show SweetAlert notification
        Swal.fire({
          title: 'Color Copied!',
          text: `${text} has been copied to clipboard`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);

        // Show error notification
        Swal.fire({
          title: 'Copy Failed',
          text: 'Could not copy to clipboard',
          icon: 'error',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      });
  }
}

export default AboutView;
