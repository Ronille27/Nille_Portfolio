/**
 * Ronille Alcala (@nille.arts) - Hero Featured Artworks Rotator
 * Dynamically cycles through featured artworks every few seconds with smooth cross-fade,
 * and allows clicking the artwork card to advance to the next piece without opening a modal.
 */

class HeroFeaturedRotator {
  constructor(artworks, options = {}) {
    this.artworks = Array.isArray(artworks) ? artworks : [];
    this.intervalMs = options.intervalMs || 4000;
    this.currentIndex = 0;
    this.timer = null;
    this.isTransitioning = false;

    this.frame = document.getElementById('hero-art-frame');
    this.img = document.getElementById('hero-art-img');
    this.titleEl = document.getElementById('hero-art-title');
    this.subEl = document.getElementById('hero-art-sub');
    this.yearEl = document.getElementById('hero-art-year');
    this.badge = document.getElementById('hero-floating-badge');

    if (!this.frame || !this.img || this.artworks.length === 0) return;

    this.init();
  }

  init() {
    // Determine starting index based on initial image if present
    const currentSrc = this.img.getAttribute('src');
    if (currentSrc) {
      const matchIdx = this.artworks.findIndex(a => currentSrc.includes(encodeURIComponent(a.primaryFile)));
      if (matchIdx !== -1) {
        this.currentIndex = matchIdx;
      }
    }

    // Set interactive accessibility attributes
    this.frame.style.cursor = 'pointer';
    this.frame.setAttribute('title', 'Click to switch artwork');

    const currentArt = this.artworks[this.currentIndex];
    if (currentArt) {
      this.frame.setAttribute('aria-label', `Featured Artwork: ${currentArt.title}. Click to switch artwork.`);
    }

    // Preload next image immediately
    this.preloadNext();

    // Click handler to advance artwork and reset interval
    this.frame.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.nextArtwork(true);
    });

    // Keyboard support (Enter or Space)
    this.frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.nextArtwork(true);
      }
    });

    // Start automatic interval rotation
    this.startTimer();

    // Pause on hover, resume on mouse leave
    this.frame.addEventListener('mouseenter', () => this.pauseTimer());
    this.frame.addEventListener('mouseleave', () => this.startTimer());

    // Pause when tab is not visible to preserve device performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    });
  }

  startTimer() {
    this.pauseTimer();
    this.timer = setInterval(() => {
      this.nextArtwork(false);
    }, this.intervalMs);
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  nextArtwork(isUserClick = false) {
    if (this.isTransitioning || this.artworks.length <= 1) return;
    this.isTransitioning = true;

    if (isUserClick) {
      // Reset timer on manual click so it won't jump immediately after
      this.startTimer();
    }

    this.currentIndex = (this.currentIndex + 1) % this.artworks.length;
    const nextArt = this.artworks[this.currentIndex];

    // Trigger smooth exit transition
    this.img.classList.add('fade-out');
    if (this.titleEl) this.titleEl.style.opacity = '0';
    if (this.subEl) this.subEl.style.opacity = '0';
    if (this.yearEl) this.yearEl.style.opacity = '0';

    setTimeout(() => {
      const newImg = new Image();
      newImg.src = 'images/' + encodeURIComponent(nextArt.primaryFile);

      const applyNewArtwork = () => {
        this.img.src = newImg.src;
        this.img.alt = `${nextArt.title} — ${nextArt.medium} by Ronille Alcala`;

        // Parse title and subtitle cleanly
        if (this.titleEl) {
          if (nextArt.title.includes('—')) {
            const parts = nextArt.title.split('—');
            this.titleEl.textContent = parts[0].trim();
          } else {
            this.titleEl.textContent = nextArt.title;
          }
          this.titleEl.style.opacity = '1';
        }

        if (this.subEl) {
          if (nextArt.title.includes('—')) {
            const parts = nextArt.title.split('—');
            this.subEl.textContent = `${parts[1].trim()} • ${nextArt.medium}`;
          } else {
            this.subEl.textContent = `${nextArt.category || 'Artwork'} • ${nextArt.medium}`;
          }
          this.subEl.style.opacity = '1';
        }

        if (this.yearEl) {
          this.yearEl.textContent = nextArt.year || '';
          this.yearEl.style.opacity = '0.85';
        }

        this.frame.setAttribute('aria-label', `Featured Artwork: ${nextArt.title}. Click to switch artwork.`);

        // Fade in
        this.img.classList.remove('fade-out');
        this.isTransitioning = false;

        // Preload upcoming artwork
        this.preloadNext();
      };

      if (newImg.complete) {
        applyNewArtwork();
      } else {
        newImg.onload = applyNewArtwork;
        newImg.onerror = () => {
          this.img.classList.remove('fade-out');
          this.isTransitioning = false;
        };
      }
    }, 240);
  }

  preloadNext() {
    const nextIdx = (this.currentIndex + 1) % this.artworks.length;
    const nextArt = this.artworks[nextIdx];
    if (nextArt && nextArt.primaryFile) {
      const preload = new Image();
      preload.src = 'images/' + encodeURIComponent(nextArt.primaryFile);
    }
  }
}

function initHeroFeaturedRotator(artworks) {
  return new HeroFeaturedRotator(artworks, { intervalMs: 4000 });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HeroFeaturedRotator, initHeroFeaturedRotator };
}
