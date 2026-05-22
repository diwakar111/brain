/* ============================================================
   bcb-hero.js — HERO SECTION JAVASCRIPT
   Section ID:  #bcb-hero-section
   Controls:    Particle canvas animation, parallax orbs on scroll,
                floating pill animation start/stop, search bar,
                scroll indicator animation
   IntersectionObserver: Starts all animations when hero is visible,
                         pauses when off-screen
   Edit this file to change: particle count, parallax speed,
   search behavior
   ============================================================ */

(function () {
  'use strict';

  /* --- Guard: exit if hero section doesn't exist on this page --- */
  const heroSection = document.getElementById('bcb-hero-section');
  if (!heroSection) return;

  /* ============================================================
     PARTICLE CANVAS ANIMATION
     Draws a connected-dot network on the hero canvas
  ============================================================ */

  const canvas  = document.getElementById('bcbHeroCanvas');
  const ctx     = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animFrame = null;    /* requestAnimationFrame handle */
  let isRunning = false;   /* Track if animation is active */

  /* --- Canvas config --- */
  const PARTICLE_COUNT  = 60;
  const CONNECT_DIST    = 120;
  const PARTICLE_SPEED  = 0.4;
  const PARTICLE_COLOR  = 'rgba(0, 229, 255, ';  /* cyan with variable alpha */

  /* --- Resize canvas to fill section --- */
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }

  /* --- Create a single particle object --- */
  function makeParticle() {
    return {
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * PARTICLE_SPEED * 2,
      vy:  (Math.random() - 0.5) * PARTICLE_SPEED * 2,
      r:   Math.random() * 1.8 + 0.6,
    };
  }

  /* --- Initialise particle array --- */
  function initParticles() {
    if (!canvas) return;
    resizeCanvas();
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  /* --- Draw one animation frame --- */
  function drawFrame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Move each particle and bounce off edges */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      /* Draw particle dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_COLOR + '0.6)';
      ctx.fill();
    });

    /* Draw connecting lines between nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.3;
          ctx.beginPath();
          ctx.strokeStyle = PARTICLE_COLOR + alpha + ')';
          ctx.lineWidth   = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* --- Main animation loop --- */
  function animateParticles() {
    if (!isRunning) return;
    drawFrame();
    animFrame = requestAnimationFrame(animateParticles);
  }

  /* --- Start animation --- */
  function startParticles() {
    if (isRunning) return;
    isRunning = true;
    animateParticles();
  }

  /* --- Stop animation --- */
  function stopParticles() {
    isRunning = false;
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  /* ============================================================
     ORB & PILL ANIMATION CONTROL
     CSS animations are paused by default;
     we start them when hero enters viewport
  ============================================================ */

  /* --- Get all orbs and pills in hero section --- */
  const heroOrbs   = heroSection.querySelectorAll('.bcb-hero__orb');
  const heroPills  = heroSection.querySelectorAll('.bcb-hero__pill');
  const scrollLine = heroSection.querySelector('.bcb-hero__scroll-line');

  /* --- Apply stagger delays to pills from data-delay attribute --- */
  heroPills.forEach(pill => {
    const delay = parseInt(pill.dataset.delay || '0', 10);
    pill.style.animationDelay       = delay + 'ms';
    pill.style.animationDuration    = (3.5 + Math.random() * 2) + 's'; /* slight random variety */
  });

  /* --- Start all CSS animations in hero --- */
  function startHeroAnimations() {
    heroOrbs.forEach(orb => {
      orb.style.animationPlayState = 'running';
    });
    heroPills.forEach(pill => {
      pill.style.animationPlayState = 'running';
    });
    if (scrollLine) scrollLine.style.animationPlayState = 'running';
    startParticles();
  }

  /* --- Pause all CSS animations in hero --- */
  function pauseHeroAnimations() {
    heroOrbs.forEach(orb => {
      orb.style.animationPlayState = 'paused';
    });
    heroPills.forEach(pill => {
      pill.style.animationPlayState = 'paused';
    });
    if (scrollLine) scrollLine.style.animationPlayState = 'paused';
    stopParticles();
  }

  /* ============================================================
     PARALLAX EFFECT ON SCROLL
     Moves orbs at different speeds for depth effect
  ============================================================ */

  const orb1 = heroSection.querySelector('.bcb-hero__orb--1');
  const orb2 = heroSection.querySelector('.bcb-hero__orb--2');
  const orb3 = heroSection.querySelector('.bcb-hero__orb--3');

  function handleParallax() {
    const scrollY = window.pageYOffset;
    const heroH   = heroSection.offsetHeight;

    /* Only apply parallax while hero is in view */
    if (scrollY > heroH) return;

    const progress = scrollY / heroH;

    if (orb1) orb1.style.transform = `translate(${progress * 40}px, ${progress * 60}px) scale(1)`;
    if (orb2) orb2.style.transform = `translate(${-progress * 30}px, ${-progress * 50}px) scale(1)`;
    if (orb3) orb3.style.transform = `translate(${-progress * 20}px, ${progress * 30}px)`;
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  /* ============================================================
     INTERSECTION OBSERVER
     Starts animations when hero enters viewport;
     pauses them when hero leaves viewport
  ============================================================ */

  const heroObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startHeroAnimations();
        } else {
          pauseHeroAnimations();
        }
      });
    },
    { threshold: 0.1 }
  );

  heroObserver.observe(heroSection);

  /* ============================================================
     SEARCH BAR — basic interaction
     Filters are handled by bcb-filter.js / bcb-grid.js
  ============================================================ */

  const searchInput = document.getElementById('bcbHeroSearch');
  const searchBtn   = heroSection.querySelector('.bcb-hero__search-btn');

  /* --- Trigger search on button click or Enter key --- */
  function doSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    /* Scroll down to grid section so user can see results */
    const gridSection = document.getElementById('bcb-layout-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth' });
    }

    /* Dispatch custom event — bcb-grid.js listens for this */
    document.dispatchEvent(new CustomEvent('bcbHeroSearch', { detail: { query } }));
  }

  if (searchBtn)   searchBtn.addEventListener('click', doSearch);
  if (searchInput) searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch();
  });

  /* ============================================================
     CANVAS RESIZE ON WINDOW RESIZE
     Debounced to avoid performance issues
  ============================================================ */

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeCanvas();
      initParticles();
    }, 150);
  });

  /* ============================================================
     INIT — Run on page load
  ============================================================ */
  initParticles();

  /* Start if hero is visible on initial load */
  const heroRect = heroSection.getBoundingClientRect();
  if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
    startHeroAnimations();
  }

})();
