/**
 * Ronille Alcala (@nille.arts) Portfolio
 * Ambient Studio Canvas Animation
 * 
 * Performance-conscious, eye-friendly, and organic ambient particles.
 * Simulates soft studio dust motes & subtle digital stardust floating in gallery lighting.
 * Respects prefers-reduced-motion and pauses when tab is hidden.
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotionQuery.matches) {
    return; // Respect user accessibility preference
  }

  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let isRunning = false;
  let particles = [];

  // Theme tracking
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  // Mouse interaction state (subtle gentle deflection)
  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    radius: 95
  };

  // Particle count based on viewport size (clean, uncluttered)
  function getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    if (area < 500000) return 20; // Mobile
    if (area < 1000000) return 28; // Tablet / small desktop
    return 36; // Desktop
  }

  // Particle color palettes adapted to current theme
  function getParticleColor(type, isDark, alpha) {
    if (isDark) {
      if (type === 'accent-crimson') {
        return `rgba(255, 77, 90, ${alpha * 0.9})`;
      } else if (type === 'accent-cyan') {
        return `rgba(0, 240, 255, ${alpha * 0.75})`;
      } else {
        return `rgba(240, 244, 255, ${alpha * 0.7})`;
      }
    } else {
      // Light theme: gentle graphite and subtle terracotta
      if (type === 'accent-crimson') {
        return `rgba(214, 40, 40, ${alpha * 0.45})`;
      } else if (type === 'accent-cyan') {
        return `rgba(0, 143, 168, ${alpha * 0.4})`;
      } else {
        return `rgba(60, 65, 75, ${alpha * 0.35})`;
      }
    }
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 20;
      
      // Extremely gentle drift velocities (eye-friendly, calming motion)
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.28 + 0.12);
      
      // Fine-art dot sizes (tiny motes)
      this.radius = Math.random() * 1.3 + 0.9;
      
      // Opacity breathing
      this.baseAlpha = isDarkMode()
        ? Math.random() * 0.22 + 0.12
        : Math.random() * 0.14 + 0.06;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.018 + 0.008;
      this.pulsePhase = Math.random() * Math.PI * 2;

      // Color distribution: mostly neutral studio dust, with subtle crimson and cyan accents
      const rand = Math.random();
      if (rand < 0.2) {
        this.colorType = 'accent-crimson';
      } else if (rand < 0.35) {
        this.colorType = 'accent-cyan';
      } else {
        this.colorType = 'neutral';
      }
    }

    update(isDark) {
      // Breathing opacity wave
      this.pulsePhase += this.pulseSpeed;
      const pulseMultiplier = (Math.sin(this.pulsePhase) + 1) * 0.5; // 0 to 1
      const currentMaxAlpha = isDark ? 0.35 : 0.18;
      const currentMinAlpha = isDark ? 0.08 : 0.04;
      this.alpha = currentMinAlpha + (currentMaxAlpha - currentMinAlpha) * pulseMultiplier;

      // Position update with gentle horizontal sway
      this.x += this.vx + Math.sin(this.pulsePhase * 0.5) * 0.1;
      this.y += this.vy;

      // Subtle mouse interaction (tactile organic deflection)
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < mouse.radius && dist > 0) {
        const factor = (mouse.radius - dist) / mouse.radius;
        const pushForce = factor * 1.2;
        this.x += (dx / dist) * pushForce;
        this.y += (dy / dist) * pushForce;
      }

      // Wrap around edges smoothly
      if (this.y < -20) {
        this.reset(false);
      }
      if (this.x < -20) {
        this.x = width + 10;
      } else if (this.x > width + 20) {
        this.x = -10;
      }
    }

    draw(ctx, isDark) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = getParticleColor(this.colorType, isDark, this.alpha);
      ctx.fill();
    }
  }

  function initParticles() {
    const count = getParticleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-initialize or adjust particles when size changes
    initParticles();
  }

  function animate() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    // Smooth mouse position interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    const isDark = isDarkMode();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(isDark);
      particles[i].draw(ctx, isDark);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!isRunning) {
      isRunning = true;
      animate();
    }
  }

  function stopAnimation() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Track mouse movements softly
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  }, { passive: true });

  // Debounced resize handler
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 120);
  }, { passive: true });

  // Pause when tab is not visible to save CPU & battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  // Observe reduced motion toggle dynamically
  reducedMotionQuery.addEventListener('change', (e) => {
    if (e.matches) {
      stopAnimation();
      ctx.clearRect(0, 0, width, height);
    } else {
      resizeCanvas();
      startAnimation();
    }
  });

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resizeCanvas();
      startAnimation();
    });
  } else {
    resizeCanvas();
    startAnimation();
  }
})();
