/**
 * Ronille Alcala (@nille.arts) - Main Application Controller
 * Handles Theme Management, Navigation, Scroll Effects, Contact Form,
 * and component initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Manager
  initThemeManager();

  // 2. Navigation & Mobile Drawer
  initNavigation();

  // 3. Scroll Reveal Animations
  initScrollReveals();

  // 4. Contact Form
  initContactForm();

  // 5. Initialize Lightbox & Gallery
  let lightboxInstance = null;
  let galleryInstance = null;

  if (typeof ARTWORKS !== 'undefined') {
    lightboxInstance = new ArtworkLightbox(ARTWORKS);
    galleryInstance = new ArtworkGallery(ARTWORKS, lightboxInstance);

    // Bind featured artwork inspect button
    const featuredBtn = document.getElementById('featured-inspect-btn');
    if (featuredBtn) {
      featuredBtn.addEventListener('click', () => {
        const featId = featuredBtn.getAttribute('data-art-id') || 'ekko-arcane';
        lightboxInstance.open(featId);
      });
    }

    // Bind hero artwork click
    const heroFrame = document.getElementById('hero-art-frame');
    if (heroFrame) {
      heroFrame.addEventListener('click', () => {
        lightboxInstance.open('miles-morales');
      });
      heroFrame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          lightboxInstance.open('miles-morales');
        }
      });
    }

    // About section interactive logo & artwork orbit constellation
    initAboutInteractiveLogo(lightboxInstance);

    // Populate Instagram Mosaic thumbnails
    initInstagramMosaic(ARTWORKS, lightboxInstance);
  }
});

/* --------------------------------------------------------------------------
   Theme Manager: Light / Dark Mode
   -------------------------------------------------------------------------- */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('nille_portfolio_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nille_portfolio_theme', theme);

    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  // Initial theme determination (default to dark mode for rich artist aesthetic)
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    applyTheme('dark');
  }

  // Click toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Listen to system changes if user hasn't explicitly set a preference
  systemPrefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('nille_portfolio_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* --------------------------------------------------------------------------
   Navigation: Sticky Header & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header scroll listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Drawer Toggle
  function openDrawer() {
    hamburgerBtn?.classList.add('is-active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburgerBtn?.classList.remove('is-active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = mobileDrawer?.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawerBackdrop?.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Active section spy on scroll
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));
}

/* --------------------------------------------------------------------------
   Scroll Reveal Animations
   -------------------------------------------------------------------------- */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* --------------------------------------------------------------------------
   Instagram Section Mosaic
   -------------------------------------------------------------------------- */
function initInstagramMosaic(artworks, lightbox) {
  const mosaicGrid = document.getElementById('instagram-grid');
  if (!mosaicGrid) return;

  // Curate 6 diverse artworks for the Instagram preview
  const previewIds = ['miles-morales', 'ekko-arcane', 'denji-bad-habit', 'dabi-glow', 'mikasa-ackerman', 'tetsuo-akira'];
  const previewItems = artworks.filter(a => previewIds.includes(a.id));

  mosaicGrid.innerHTML = '';
  previewItems.forEach(art => {
    const item = document.createElement('a');
    item.className = 'instagram-item';
    item.href = 'https://www.instagram.com/nille.arts/';
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
    item.setAttribute('aria-label', `View ${art.title} on Instagram @nille.arts`);

    item.innerHTML = `
      <img src="images/${encodeURIComponent(art.primaryFile)}" alt="${art.title}" loading="lazy" />
      <div class="instagram-item-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </div>
    `;

    mosaicGrid.appendChild(item);
  });
}

/* --------------------------------------------------------------------------
   Contact Form Handler (Direct Delivery to Gmail via Web3Forms API)
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');

  if (!form || !statusEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const projectType = document.getElementById('contact-project')?.value;
    const message = document.getElementById('contact-message')?.value.trim();
    const accessKeyInput = document.getElementById('contact-access-key');
    const accessKey = accessKeyInput?.value?.trim() || '';

    // 1. Client-side input validation
    if (!name || !email || !message) {
      statusEl.className = 'form-status-message error';
      statusEl.textContent = 'Please fill out all required fields (*).';
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      statusEl.className = 'form-status-message error';
      statusEl.textContent = 'Please enter a valid email address.';
      return;
    }

    // Honeypot anti-spam verification: if checked, silently ignore spambots
    const botcheck = form.querySelector('.botcheck-field');
    if (botcheck && botcheck.checked) {
      statusEl.className = 'form-status-message success';
      statusEl.innerHTML = `<strong>Thank you, ${name}!</strong> Your message has been sent.`;
      form.reset();
      return;
    }

    // 2. Check if Access Key is configured
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      statusEl.className = 'form-status-message info';
      statusEl.innerHTML = `
        <strong>Gmail Delivery Ready:</strong> To connect this form to your Gmail, please insert your free 
        <strong>Web3Forms Access Key</strong> into <code>index.html</code> (get your free key in 30 seconds at 
        <a href="https://web3forms.com" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 700;">web3forms.com</a> by entering your Gmail).
        <br/><br/>
        <em>In the meantime, you can reach out directly via Instagram: 
        <a href="https://www.instagram.com/nille.arts/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 700;">@nille.arts</a></em>.
      `;
      return;
    }

    // 3. UI Loading State
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending Message...';
    }
    statusEl.style.display = 'none';

    // 4. Dispatch to Web3Forms API
    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        statusEl.className = 'form-status-message success';
        statusEl.innerHTML = `
          <strong>Message Sent Successfully!</strong> Thank you, ${name}. Your inquiry regarding "${projectType}" has been delivered directly to Ronille's Gmail. You will receive a reply at <strong>${email}</strong> soon.
        `;
        form.reset();
      } else {
        throw new Error(result.message || 'Submission was not accepted by the mail service.');
      }
    } catch (error) {
      statusEl.className = 'form-status-message error';
      statusEl.innerHTML = `
        <strong>Message Could Not Be Sent:</strong> ${error.message}
        <br/>
        Please check your connection, or contact Ronille directly on Instagram at 
        <a href="https://www.instagram.com/nille.arts/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 700;">@nille.arts</a>.
      `;
    } finally {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
      }
    }
  });
}

/* --------------------------------------------------------------------------
   About Profile Interactive Logo & Pop-Out Artwork Orbit
   -------------------------------------------------------------------------- */
function initAboutInteractiveLogo(lightboxInstance) {
  const logoGroup = document.getElementById('about-interactive-logo');
  const logoBtn = document.getElementById('about-logo-seal');
  if (!logoGroup) return;

  const orbitButtons = logoGroup.querySelectorAll('.orbit-art-icon');

  // Click on any popped-out artwork badge opens it directly in fullscreen lightbox
  orbitButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const artId = btn.getAttribute('data-art-id');
      if (lightboxInstance && artId) {
        lightboxInstance.open(artId);
      }
    });

    // Keyboard support: Enter or Space
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const artId = btn.getAttribute('data-art-id');
        if (lightboxInstance && artId) {
          lightboxInstance.open(artId);
        }
      }
    });
  });

  // Mobile / Touch or click toggle on center seal button
  if (logoBtn) {
    const toggleExpand = (e) => {
      e.preventDefault();
      const isExpanded = logoGroup.classList.toggle('is-expanded');
      logoBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    };

    logoBtn.addEventListener('click', toggleExpand);
    logoBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleExpand(e);
      }
    });
  }

  // Close when clicking outside the interactive logo group
  document.addEventListener('click', (e) => {
    if (!logoGroup.contains(e.target)) {
      if (logoGroup.classList.contains('is-expanded')) {
        logoGroup.classList.remove('is-expanded');
        if (logoBtn) {
          logoBtn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && logoGroup.classList.contains('is-expanded')) {
      logoGroup.classList.remove('is-expanded');
      if (logoBtn) {
        logoBtn.setAttribute('aria-expanded', 'false');
        logoBtn.focus();
      }
    }
  });
}
