/* ============================================================
   cloud.js — CLOUD APP DEVELOPMENT SERVICE PAGE
   Controls ALL 8 sections in one file
   Each section is wrapped in its own IIFE — fully isolated
   Sections:
     1. cadHero   — Canvas particles, stat counters, reveal animations
     2. cadHiw    — Step cards slide in on scroll
     3. cadFeat   — Feature cards stagger fade-up
     4. cadInd    — Industry tab switching
     5. cadTech   — Tech layer rows slide in
     6. cadCs     — Case study cards fade-up
     7. cadTest   — Auto-sliding testimonial carousel + dots
     8. cadCta    — CTA section reveal + orb animations
   Animation rule: All CSS animations are paused by default.
   IntersectionObserver resumes them on visibility and pauses on exit.
============================================================ */


/* ============================================================
   === SECTION 1: HERO ===
   Controls:
   - IntersectionObserver: pause / resume ALL hero animations
   - Canvas particle network drawing loop
   - Stat counter animation (counts up from 0 on first visible)
   - Reveal class (.cad-hero--visible) triggers CSS transitions
============================================================ */
(function () {
    'use strict';
  
    /* Guard — exit if section not on page */
    var section = document.getElementById('cad-hero-section');
    if (!section) return;
  
    /* Element references */
    var canvas      = document.querySelector('.cad-hero__canvas');
    var orbs        = section.querySelectorAll('.cad-hero__orb');
    var rings       = section.querySelectorAll('.cad-hero__visual-ring');
    var visual      = section.querySelector('.cad-hero__visual');
    var eyebrowDots = section.querySelectorAll('.cad-hero__eyebrow-dot');
    var scrollLine  = section.querySelector('.cad-hero__scroll-line');
    var statValues  = section.querySelectorAll('.cad-hero__stat-val');
  
    /* --- Helper: set animation-play-state on a NodeList --- */
    function setAnimState(els, state) {
      els.forEach(function (el) { el.style.animationPlayState = state; });
    }
  
    /* -------- CANVAS PARTICLE NETWORK -------- */
    var ctx         = null;
    var particles   = [];
    var animFrameId = null;
    var isVisible   = false;
  
    /* Set canvas size and create particles */
    function setupCanvas() {
      if (!canvas) return;
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
      ctx = canvas.getContext('2d');
      createParticles();
    }
  
    /* Create particle pool scaled to canvas area (max 60) */
    function createParticles() {
      particles = [];
      var count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.45, /* Slow horizontal drift */
          vy: (Math.random() - 0.5) * 0.45, /* Slow vertical drift */
          r: Math.random() * 2 + 1           /* Dot radius 1–3px */
        });
      }
    }
  
    /* Draw one frame — called every RAF tick while visible */
    function drawParticles() {
      if (!ctx || !isVisible) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      var MAX_DIST = 120; /* Max connection distance */
  
      /* Draw connection lines between nearby particles */
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx   = particles[i].x - particles[j].x;
          var dy   = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            var alpha = 1 - dist / MAX_DIST; /* Fade with distance */
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(10, 110, 189, ' + (alpha * 0.30) + ')';
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }
  
      /* Draw particle dots and update positions */
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 110, 189, 0.40)';
        ctx.fill();
  
        p.x += p.vx;
        p.y += p.vy;
  
        /* Bounce off canvas edges */
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
  
      animFrameId = requestAnimationFrame(drawParticles);
    }
  
    function startCanvas() {
      if (animFrameId) return;
      drawParticles();
    }
  
    function stopCanvas() {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    }
  
    /* -------- STAT COUNTERS -------- */
    var countersRun = false; /* Run once flag */
  
    function runCounters() {
      if (countersRun || !statValues.length) return;
      countersRun = true;
  
      statValues.forEach(function (el) {
        var target   = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800; /* Total count-up time (ms) */
        var start    = null;
  
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3); /* Ease-out cubic */
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  
    /* -------- INTERSECTION OBSERVER -------- */
    /* Pauses all animations when section is off-screen to save CPU */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting;
  
        if (entry.isIntersecting) {
          /* Section entered viewport — start everything */
          section.classList.add('cad-hero--visible');
          setAnimState(Array.from(orbs), 'running');
          setAnimState(Array.from(rings), 'running');
          setAnimState(Array.from(eyebrowDots), 'running');
          if (visual)     visual.style.animationPlayState     = 'running';
          if (scrollLine) scrollLine.style.animationPlayState = 'running';
          startCanvas();
          runCounters(); /* Only fires on first entry */
        } else {
          /* Section left viewport — pause everything */
          setAnimState(Array.from(orbs), 'paused');
          setAnimState(Array.from(rings), 'paused');
          setAnimState(Array.from(eyebrowDots), 'paused');
          if (visual)     visual.style.animationPlayState     = 'paused';
          if (scrollLine) scrollLine.style.animationPlayState = 'paused';
          stopCanvas();
        }
      });
    }, { threshold: 0.1 });
  
    observer.observe(section);
  
    /* Resize handler — re-setup canvas on window resize (debounced) */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        stopCanvas();
        setupCanvas();
        if (isVisible) startCanvas();
      }, 200);
    });
  
    /* Initial canvas setup */
    setupCanvas();
  
  })();
  
  
  /* ============================================================
     === SECTION 2: HOW IT WORKS ===
     Controls:
     - Each step gets its own IntersectionObserver
     - Steps slide in from the left with staggered delays
     - Steps reset (allow replay) when scrolled back above viewport
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-hiw-section');
    if (!section) return;
  
    /* All step elements */
    var steps = section.querySelectorAll('.cad-hiw__step');
    if (!steps.length) return;
  
    /* Each step gets its own observer so stagger timing works correctly */
    steps.forEach(function (step, index) {
      var delay = index * 120; /* 120ms between each step reveal */
  
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Reveal this step with its staggered delay */
            setTimeout(function () {
              entry.target.classList.add('cad-hiw--visible');
            }, delay);
          } else {
            /* Reset only if element scrolled above viewport (enables replay on scroll-up) */
            var rect = entry.target.getBoundingClientRect();
            if (rect.bottom < 0) {
              entry.target.classList.remove('cad-hiw--visible');
            }
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  
      obs.observe(step);
    });
  
  })();
  
  
  /* ============================================================
     === SECTION 3: FEATURES ===
     Controls:
     - IntersectionObserver per card
     - Reads data-delay attribute for staggered timing
     - One-time reveal (cards stay visible once shown)
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-feat-section');
    if (!section) return;
  
    var cards = section.querySelectorAll('.cad-feat__card');
    if (!cards.length) return;
  
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card  = entry.target;
          /* Read stagger delay from HTML data attribute */
          var delay = parseInt(card.getAttribute('data-delay') || '0', 10);
  
          /* Apply inline transition-delay then add visible class */
          card.style.transitionDelay = delay + 'ms';
          card.classList.add('cad-feat--visible');
  
          /* One-time only — stop observing after reveal */
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
  
    cards.forEach(function (card) { obs.observe(card); });
  
  })();
  
  
  /* ============================================================
     === SECTION 4: INDUSTRY USE CASES ===
     Controls:
     - Tab click → switch active tab + show matching panel
     - Panel fade-in on switch
     - Keyboard navigation (arrow keys) for accessibility
     - Section fade-in on scroll
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-ind-section');
    if (!section) return;
  
    var tabsWrapper  = document.getElementById('cadIndTabs');
    var panelsWrapper = document.getElementById('cadIndPanels');
    if (!tabsWrapper || !panelsWrapper) return;
  
    var tabs   = tabsWrapper.querySelectorAll('.cad-ind__tab');
    var panels = panelsWrapper.querySelectorAll('.cad-ind__panel');
    var activeInd = 'saas'; /* Default active industry */
  
    /* Switch to a given industry tab */
    function activateTab(ind) {
      if (ind === activeInd) return;
      activeInd = ind;
  
      /* Update tab button states */
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-ind') === ind;
        tab.classList.toggle('cad-ind__tab--active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
  
      /* Hide current panel */
      var current = panelsWrapper.querySelector('.cad-ind__panel--active');
      if (current) current.classList.remove('cad-ind__panel--active');
  
      /* Show new panel — force reflow so CSS transition fires */
      var next = panelsWrapper.querySelector('[data-ind="' + ind + '"]');
      if (next) {
        next.offsetHeight; /* Trigger layout */
        next.classList.add('cad-ind__panel--active');
      }
    }
  
    /* Tab click listeners */
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-ind'));
      });
  
      /* Keyboard: left/right arrows navigate tabs */
      tab.addEventListener('keydown', function (e) {
        var all = Array.from(tabs);
        var idx = all.indexOf(tab);
        if (e.key === 'ArrowRight') { var next = all[(idx + 1) % all.length]; next.focus(); activateTab(next.getAttribute('data-ind')); }
        if (e.key === 'ArrowLeft')  { var prev = all[(idx - 1 + all.length) % all.length]; prev.focus(); activateTab(prev.getAttribute('data-ind')); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.getAttribute('data-ind')); }
      });
    });
  
    /* Section fade-in on scroll */
    section.style.opacity  = '0';
    section.style.transform = 'translateY(24px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  
    var sectionObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.style.opacity  = '1';
        section.style.transform = 'translateY(0)';
      }
    }, { threshold: 0.1 });
  
    sectionObs.observe(section);
  
    /* Ensure first panel is instantly visible on load */
    var firstPanel = panelsWrapper.querySelector('.cad-ind__panel--active');
    if (firstPanel) { firstPanel.style.opacity = '1'; firstPanel.style.transform = 'translateY(0)'; }
  
  })();
  
  
  /* ============================================================
     === SECTION 5: TECH STACK ===
     Controls:
     - IntersectionObserver per layer row
     - Reads data-delay for staggered reveal
     - One-time reveal
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-tech-section');
    if (!section) return;
  
    var layers = section.querySelectorAll('.cad-tech__layer');
    if (!layers.length) return;
  
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var layer = entry.target;
          var delay = parseInt(layer.getAttribute('data-delay') || '0', 10);
  
          /* Apply stagger delay then reveal */
          setTimeout(function () {
            layer.classList.add('cad-tech--visible');
          }, delay);
  
          obs.unobserve(layer); /* One-time reveal */
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });
  
    layers.forEach(function (layer) { obs.observe(layer); });
  
  })();
  
  
  /* ============================================================
     === SECTION 6: CASE STUDIES ===
     Controls:
     - IntersectionObserver per card
     - Reads data-delay for staggered fade-up
     - One-time reveal
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-cs-section');
    if (!section) return;
  
    var cards = section.querySelectorAll('.cad-cs__card');
    if (!cards.length) return;
  
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card  = entry.target;
          var delay = parseInt(card.getAttribute('data-delay') || '0', 10);
          card.style.transitionDelay = delay + 'ms';
          card.classList.add('cad-cs--visible');
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
  
    cards.forEach(function (card) { obs.observe(card); });
  
  })();
  
  
  /* ============================================================
     === SECTION 7: TESTIMONIALS ===
     Controls:
     - Auto-sliding carousel — advances every 4 seconds
     - Dot navigation — click to jump to card
     - Touch/swipe support for mobile
     - IntersectionObserver: PAUSES auto-slide when off-screen,
       RESUMES when section enters viewport
     - Pause on mouse hover, resume on mouse leave
     - Resize handler — recalculates card width
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-test-section');
    if (!section) return;
  
    var track    = document.getElementById('cadTestTrack');
    var dotsWrap = document.getElementById('cadTestDots');
    if (!track || !dotsWrap) return;
  
    var cards        = Array.from(track.querySelectorAll('.cad-test__card'));
    var totalCards   = cards.length;
    var currentIndex = 0;
    var autoTimer    = null;
    var isActive     = false; /* True when section is visible */
    var cardWidth    = 0;
    var gap          = 24; /* Must match CSS gap value */
  
    /* Build dot navigation buttons */
    function buildDots() {
      dotsWrap.innerHTML = '';
      cards.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className    = 'cad-test__dot' + (i === 0 ? ' cad-test__dot--active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      });
    }
  
    /* Measure actual card width from first rendered card */
    function measureCardWidth() {
      if (cards.length) cardWidth = cards[0].offsetWidth + gap;
    }
  
    /* Slide track to a specific card index */
    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, totalCards - 1));
      track.style.transform = 'translateX(-' + (currentIndex * cardWidth) + 'px)';
  
      /* Update dot states */
      var dots = dotsWrap.querySelectorAll('.cad-test__dot');
      dots.forEach(function (d, i) { d.classList.toggle('cad-test__dot--active', i === currentIndex); });
    }
  
    /* Advance to next card, wrapping around */
    function next() { goTo((currentIndex + 1) % totalCards); }
  
    /* Start auto-advance interval */
    function startTimer() { if (!autoTimer) autoTimer = setInterval(next, 4000); }
  
    /* Stop auto-advance interval */
    function stopTimer() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  
    /* Restart timer after manual navigation */
    function resetTimer() { stopTimer(); if (isActive) startTimer(); }
  
    /* Touch swipe detection */
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (diff > 40)  { next(); resetTimer(); }          /* Swipe left → next */
      if (diff < -40) { goTo(currentIndex - 1); resetTimer(); } /* Swipe right → prev */
    }, { passive: true });
  
    /* Pause auto-slide on hover */
    track.addEventListener('mouseenter', stopTimer);
    track.addEventListener('mouseleave', function () { if (isActive) startTimer(); });
  
    /* IntersectionObserver: pause when not visible, resume when visible */
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          isActive = true;
          startTimer();
        } else {
          isActive = false;
          stopTimer();
        }
      });
    }, { threshold: 0.2 });
  
    obs.observe(section);
  
    /* Resize handler — recalculate and snap without animation */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measureCardWidth();
        track.style.transition = 'none';
        track.style.transform  = 'translateX(-' + (currentIndex * cardWidth) + 'px)';
        setTimeout(function () { track.style.transition = ''; }, 50);
      }, 200);
    });
  
    /* Init */
    buildDots();
    measureCardWidth();
    goTo(0);
  
  })();
  
  
  /* ============================================================
     === SECTION 8: CTA / CONTACT BANNER ===
     Controls:
     - IntersectionObserver: reveals text elements via CSS class
     - Orb animations resume when section is visible, pause when not
  ============================================================ */
  (function () {
    'use strict';
  
    var section = document.getElementById('cad-cta-section');
    if (!section) return;
  
    /* Orb elements */
    var orbs = section.querySelectorAll('.cad-cta__orb');
  
    /* IntersectionObserver: add/remove reveal class + pause/resume orbs */
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Reveal text via CSS class (CSS transitions handle animation) */
          section.classList.add('cad-cta--visible');
          /* Resume orb CSS animations */
          orbs.forEach(function (orb) { orb.style.animationPlayState = 'running'; });
        } else {
          /* Pause orb animations when off-screen */
          orbs.forEach(function (orb) { orb.style.animationPlayState = 'paused'; });
          /* Note: we do NOT remove cad-cta--visible once revealed
             so text stays visible when user scrolls past and back */
        }
      });
    }, { threshold: 0.15 });
  
    obs.observe(section);
  
  })();


  /* hero section animation//////////////////////////////////////////////////////////////////////////////////// */

  