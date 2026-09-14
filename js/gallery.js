/**
 * Ronille Alcala (@nille.arts) - Portfolio Gallery Engine
 * Dynamic grid rendering, category filter tabs, and responsive layout.
 */

class ArtworkGallery {
  constructor(artworks, lightbox) {
    this.artworks = artworks;
    this.lightbox = lightbox;
    this.activeFilter = 'all';

    this.gridContainer = document.getElementById('gallery-grid');
    this.filterContainer = document.getElementById('filter-tabs-wrapper');
    this.counterEl = document.getElementById('works-counter-total');

    this.initFilterTabs();
    this.render();
  }

  initFilterTabs() {
    if (!this.filterContainer) return;

    // Calculate category counts
    const traditionalDrawings = this.getTraditionalDrawings();
    const counts = {
      'all': this.artworks.length,
      'fan-art': this.artworks.filter(a => this.matchesFilter(a, 'fan-art')).length,
      'character-art': this.artworks.filter(a => this.matchesFilter(a, 'character-art')).length,
      'original-concept': this.artworks.filter(a => this.matchesFilter(a, 'original-concept')).length,
      'surrealism': this.artworks.filter(a => this.matchesFilter(a, 'surrealism')).length,
      'traditional': traditionalDrawings.length
    };

    const categories = [
      { id: 'all', label: 'All Works' },
      { id: 'fan-art', label: 'Fan Art' },
      { id: 'character-art', label: 'Character Art' },
      { id: 'original-concept', label: 'Original Concepts' },
      { id: 'surrealism', label: 'Surrealism' },
      { id: 'traditional', label: 'Traditional Drawings' }
    ];

    this.filterContainer.innerHTML = '';
    categories.forEach(cat => {
      const count = counts[cat.id] || 0;
      if (count === 0 && cat.id !== 'all') return;

      const btn = document.createElement('button');
      btn.className = `filter-tab-btn ${cat.id === this.activeFilter ? 'active' : ''}`;
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-filter', cat.id);
      btn.innerHTML = `${cat.label} <span class="filter-tab-count">(${count})</span>`;

      btn.addEventListener('click', () => {
        this.setFilter(cat.id);
      });

      this.filterContainer.appendChild(btn);
    });

    if (this.counterEl) {
      this.counterEl.textContent = `${this.artworks.length} Works`;
    }
  }

  setFilter(filterId) {
    if (this.activeFilter === filterId) return;
    this.activeFilter = filterId;

    // Update button active states
    const buttons = this.filterContainer.querySelectorAll('.filter-tab-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-filter') === filterId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Smooth filter transition
    const cards = this.gridContainer.querySelectorAll('.art-card');
    cards.forEach(card => card.classList.add('filtering-out'));

    setTimeout(() => {
      this.render();
    }, 200);
  }

  getTraditionalDrawings() {
    return this.artworks
      .filter(a => a.hasTraditionalDrawing)
      .map(art => {
        const isStandalone = art.primaryFile === art.traditionalFile;
        return {
          id: art.id + (isStandalone ? '' : '-trad'),
          originalId: art.id,
          title: art.traditionalTitle || art.title,
          category: art.traditionalType === 'pencil' ? 'Traditional Pencil' : 'Traditional Inks',
          filterCategory: 'traditional',
          year: art.year,
          medium: art.traditionalMedium || art.medium,
          primaryFile: art.traditionalFile,
          hasProcess: !isStandalone,
          processFile: isStandalone ? null : art.primaryFile,
          processType: 'ink-to-color',
          processLabel: 'Digital Colored Version',
          primaryLabel: 'Traditional Drawing',
          featured: false,
          aspectRatio: art.aspectRatio,
          caption: isStandalone ? (art.caption || art.description) : `Uncolored traditional ${art.traditionalType === 'pencil' ? 'pencil drawing' : 'ink linework'} foundation for ${art.title}.`,
          description: art.description,
          tags: [...(art.tags || []), 'Traditional Drawing', art.traditionalType === 'pencil' ? 'Pencil Drawing' : 'Ink Linework']
        };
      });
  }

  matchesFilter(art, filterId) {
    if (Array.isArray(art.filterCategory)) {
      return art.filterCategory.includes(filterId);
    }
    return art.filterCategory === filterId;
  }

  getFilteredArtworks() {
    if (this.activeFilter === 'all') {
      return this.artworks;
    }
    if (this.activeFilter === 'traditional') {
      return this.getTraditionalDrawings();
    }
    return this.artworks.filter(a => this.matchesFilter(a, this.activeFilter));
  }

  render() {
    if (!this.gridContainer) return;

    const filtered = this.getFilteredArtworks();
    this.gridContainer.innerHTML = '';

    if (this.counterEl) {
      this.counterEl.textContent = `${filtered.length} Works`;
    }

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No artworks found in this category.</div>`;
      return;
    }

    filtered.forEach((art, index) => {
      const card = document.createElement('article');
      card.className = 'art-card filtering-in';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${art.title}`);

      // Process pill badge
      let processBadgeHtml = '';
      if (art.hasProcess) {
        const badgeLabel = art.processLabel === 'Digital Colored Version' ? 'Digital Color' : 'Process';
        processBadgeHtml = `
          <div class="art-card-process-badge" title="${art.processLabel || 'Process View'} available">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>${badgeLabel}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="art-card-media">
          ${processBadgeHtml}
          <img 
            src="images/${encodeURIComponent(art.primaryFile)}" 
            alt="${art.title} by Ronille Alcala" 
            class="art-card-img" 
            loading="lazy"
            decoding="async"
          />
          <div class="art-card-overlay">
            <div class="art-card-action-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </div>
            <span class="art-card-category">${art.category}</span>
            <h3 class="art-card-title">${art.title}</h3>
            <p class="art-card-medium">${art.medium}</p>
          </div>
        </div>
        <div class="art-card-caption-strip">
          <span class="art-card-caption-title">${art.title}</span>
          <span class="art-card-caption-year">${art.year}</span>
        </div>
      `;

      // Open lightbox on click or enter key with current filtered list
      card.addEventListener('click', () => {
        this.lightbox.open(art.id, filtered);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.lightbox.open(art.id, filtered);
        }
      });

      this.gridContainer.appendChild(card);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ArtworkGallery };
}
