/**
 * Ronille Alcala (@nille.arts) - Lightbox Modal Controller
 * Fullscreen artwork viewer with sketch-to-color process toggle,
 * keyboard accessibility, and mobile touch gestures.
 */

class ArtworkLightbox {
  constructor(artworks) {
    this.artworks = artworks;
    this.currentIndex = 0;
    this.currentViewMode = 'primary'; // 'primary' | 'process'
    this.isOpen = false;
    this.lastActiveElement = null;

    // Touch gesture state
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modal = document.getElementById('lightbox-modal');
    this.dialog = document.getElementById('lightbox-dialog');
    this.img = document.getElementById('lightbox-img');
    this.closeBtn = document.getElementById('lightbox-close-btn');
    this.prevBtn = document.getElementById('lightbox-prev-btn');
    this.nextBtn = document.getElementById('lightbox-next-btn');

    this.categoryEl = document.getElementById('lightbox-category');
    this.titleEl = document.getElementById('lightbox-title');
    this.descEl = document.getElementById('lightbox-desc');
    this.yearEl = document.getElementById('lightbox-year');
    this.mediumEl = document.getElementById('lightbox-medium');
    this.tagsContainer = document.getElementById('lightbox-tags');
    this.counterEl = document.getElementById('lightbox-counter');

    this.processBar = document.getElementById('lightbox-process-bar');
    this.primaryToggleBtn = document.getElementById('toggle-primary-btn');
    this.processToggleBtn = document.getElementById('toggle-process-btn');
  }

  bindEvents() {
    if (!this.modal) return;

    // Close on button click
    this.closeBtn?.addEventListener('click', () => this.close());

    // Close on backdrop click (outside dialog)
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Next / Prev navigation
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Process toggle buttons
    this.primaryToggleBtn?.addEventListener('click', () => this.setViewMode('primary'));
    this.processToggleBtn?.addEventListener('click', () => this.setViewMode('process'));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Touch gesture navigation for mobile
    this.modal.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.modal.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const threshold = 50;
    const diff = this.touchEndX - this.touchStartX;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prev(); // Swiped right -> go to previous
      } else {
        this.next(); // Swiped left -> go to next
      }
    }
  }

  open(indexOrId, currentList = null) {
    this.activeArtworks = (currentList && currentList.length > 0) ? currentList : this.artworks;
    let index = 0;
    if (typeof indexOrId === 'string') {
      index = this.activeArtworks.findIndex(a => a.id === indexOrId);
      if (index === -1) {
        index = this.activeArtworks.findIndex(a => a.originalId === indexOrId);
        if (index === -1) index = 0;
      }
    } else if (typeof indexOrId === 'number') {
      index = Math.max(0, Math.min(indexOrId, this.activeArtworks.length - 1));
    }

    this.lastActiveElement = document.activeElement;
    this.currentIndex = index;
    this.currentViewMode = 'primary';
    this.isOpen = true;

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.renderCurrentArtwork();
    this.closeBtn?.focus();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
  }

  next() {
    const list = this.activeArtworks || this.artworks;
    this.currentIndex = (this.currentIndex + 1) % list.length;
    this.currentViewMode = 'primary';
    this.renderCurrentArtwork();
  }

  prev() {
    const list = this.activeArtworks || this.artworks;
    this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
    this.currentViewMode = 'primary';
    this.renderCurrentArtwork();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    const list = this.activeArtworks || this.artworks;
    const item = list[this.currentIndex];
    if (!item) return;

    // Trigger smooth fade animation
    this.img.classList.remove('fade-cross');
    void this.img.offsetWidth; // Trigger reflow
    this.img.classList.add('fade-cross');

    if (mode === 'process') {
      const companionFile = item.processFile || item.altFile;
      this.img.src = 'images/' + encodeURIComponent(companionFile);
      this.img.alt = `${item.title} (${item.processLabel || 'Process View'})`;
      this.primaryToggleBtn?.classList.remove('active');
      this.processToggleBtn?.classList.add('active');
    } else {
      this.img.src = 'images/' + encodeURIComponent(item.primaryFile);
      this.img.alt = item.title;
      this.primaryToggleBtn?.classList.add('active');
      this.processToggleBtn?.classList.remove('active');
    }
  }

  renderCurrentArtwork() {
    const list = this.activeArtworks || this.artworks;
    const item = list[this.currentIndex];
    if (!item) return;

    // Update Image
    this.img.classList.remove('fade-cross');
    void this.img.offsetWidth; // Trigger reflow
    this.img.classList.add('fade-cross');
    this.img.src = 'images/' + encodeURIComponent(item.primaryFile);
    this.img.alt = item.title;

    // Update Text Content
    if (this.titleEl) this.titleEl.textContent = item.title;
    if (this.categoryEl) this.categoryEl.textContent = item.category;
    if (this.descEl) this.descEl.textContent = item.description || item.caption;
    if (this.yearEl) this.yearEl.textContent = item.year;
    if (this.mediumEl) this.mediumEl.textContent = item.medium;

    // Update Counter
    if (this.counterEl) {
      const cur = String(this.currentIndex + 1).padStart(2, '0');
      const tot = String(list.length).padStart(2, '0');
      this.counterEl.textContent = `${cur} / ${tot}`;
    }

    // Update Tags
    if (this.tagsContainer) {
      this.tagsContainer.innerHTML = '';
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          const pill = document.createElement('span');
          pill.className = 'lightbox-tag-pill';
          pill.textContent = tag;
          this.tagsContainer.appendChild(pill);
        });
      }
    }

    // Configure Process Switcher Bar
    if (this.processBar) {
      if (item.hasProcess && (item.processFile || item.altFile)) {
        this.processBar.style.display = 'flex';
        this.primaryToggleBtn.textContent = item.primaryLabel || 'Finished Art';
        this.primaryToggleBtn.classList.add('active');

        this.processToggleBtn.textContent = item.processLabel || 'Process View';
        this.processToggleBtn.classList.remove('active');
      } else {
        this.processBar.style.display = 'none';
      }
    }

    // Preload next and previous images for instant loading
    this.preloadAdjacentImages();
  }

  preloadAdjacentImages() {
    const list = this.activeArtworks || this.artworks;
    const nextIdx = (this.currentIndex + 1) % list.length;
    const prevIdx = (this.currentIndex - 1 + list.length) % list.length;

    const nextImg = new Image();
    nextImg.src = 'images/' + encodeURIComponent(list[nextIdx].primaryFile);

    const prevImg = new Image();
    prevImg.src = 'images/' + encodeURIComponent(list[prevIdx].primaryFile);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ArtworkLightbox };
}
