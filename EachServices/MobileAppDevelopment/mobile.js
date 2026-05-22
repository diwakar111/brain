/* ============================================================
   FILE: mobile-app.js
   PAGE: Mobile App Development — services/mobile-app.html
   SCOPE: All JS scoped to mobApp IIFE namespace.
          Zero global variable pollution.
          No dependencies — vanilla JS only.
   SECTIONS:
     00 · INIT — DOMContentLoaded entry point
     01 · HERO CANVAS — floating phone mockup animation
     02 · SCROLL REVEAL — IntersectionObserver reveal system
     03 · TECH STACK — float chip pause/resume
     04 · INDUSTRIES — tab switching
     05 · PROCESS — step activation + timeline
     06 · STATS — count-up animation
     07 · FAQ — accordion open/close
     08 · CLIENTS — scroll strip (CSS-only, no JS needed)
   ============================================================ */

/* ── IIFE wrapper — keeps all variables private ── */
(function () {
    'use strict';
  
    /* ============================================================
       SECTION 00 · INIT
       PURPOSE: Single entry point. Fires after DOM is ready.
                Calls every module in the correct order.
                Guard checks ensure nothing crashes if a section
                doesn't exist on the page.
       ============================================================ */
    document.addEventListener('DOMContentLoaded', function () {
  
      /* 01 — Start canvas animation (Hero only on load) */
      initHeroCanvas();
  
      /* 02 — Watch all [data-mob-reveal] elements */
      initScrollReveal();
  
      /* 03 — Assign float timings to tech chips; pause when off-screen */
      initTechStack();
  
      /* 04 — Wire industry tab buttons */
      initIndustryTabs();
  
      /* 05 — Process step activation animation */
      initProcess();
  
      /* 06 — Animated count-up stats */
      initStats();
  
      /* 07 — FAQ accordion toggle */
      initFaq();
  
    });
  
  
    /* ============================================================
       SECTION 01 · HERO CANVAS
       PURPOSE: Draws floating smartphone silhouettes connected
                by soft network lines on the hero canvas.
                Uses requestAnimationFrame loop.
                IntersectionObserver pauses it when hero is
                off-screen (saves CPU/GPU battery).
       ============================================================ */
    function initHeroCanvas() {
  
      /* Get canvas element — exit if not on page */
      var canvas  = document.getElementById('mob-hero-canvas');
      var section = document.getElementById('mob-hero');
      if (!canvas || !section) return;
  
      var ctx = canvas.getContext('2d');
      var rafId = null;           /* requestAnimationFrame ID — used to cancel */
      var isRunning = false;      /* Track whether animation loop is active */
      var phones = [];            /* Array holding all phone silhouette objects */
      var W = 0, H = 0;           /* Canvas dimensions — updated on resize */
  
      /* ── Canvas config values ── */
      var CONFIG = {
        count:        6,                /* Number of phone silhouettes */
        connectDist:  220,              /* Max px distance to draw a connecting line */
        speed:        0.22,             /* Movement speed multiplier */
        lineAlpha:    0.10,             /* Max line opacity */
        phoneColor:   'rgba(10,110,189,0.18)',   /* Phone fill colour */
        lineColor:    'rgba(10,110,189,0.12)',   /* Connection line colour */
      };
  
      /* ── Resize canvas to fill hero section ── */
      function resize() {
        W = canvas.width  = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
      }
  
      /* ── Create a single phone object ── */
      /* Each phone has position, velocity, size, and rotation */
      function makePhone() {
        return {
          x:   Math.random() * W,                                /* Random x position */
          y:   Math.random() * H,                                /* Random y position */
          vx:  (Math.random() - 0.5) * CONFIG.speed,            /* Horizontal velocity */
          vy:  (Math.random() - 0.5) * CONFIG.speed,            /* Vertical velocity */
          w:   14 + Math.random() * 12,                         /* Phone width */
          h:   0,                                                /* Height — calculated below */
          r:   (Math.random() - 0.5) * 0.25,                   /* Slight rotation */
          rV:  (Math.random() - 0.5) * 0.003,                  /* Rotation velocity */
          opacity: 0.3 + Math.random() * 0.5,                  /* Varied opacity for depth */
        };
      }
  
      /* ── Initialise phone array ── */
      function initPhones() {
        phones = [];
        for (var i = 0; i < CONFIG.count; i++) {
          var p = makePhone();
          p.h = p.w * 2;   /* Phone height is always 2× width */
          phones.push(p);
        }
      }
  
      /* ── Update phone positions each frame ── */
      function updatePhones() {
        phones.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.rV;
  
          /* Bounce off canvas walls */
          if (p.x - p.w / 2 < 0 || p.x + p.w / 2 > W) p.vx *= -1;
          if (p.y - p.h / 2 < 0 || p.y + p.h / 2 > H) p.vy *= -1;
        });
      }
  
      /* ── Draw a single phone silhouette as a rounded rectangle ── */
      function drawPhone(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = CONFIG.phoneColor;
        ctx.strokeStyle = 'rgba(10,110,189,0.3)';
        ctx.lineWidth = 1;
  
        /* Draw rounded-rectangle phone shape */
        var rx = -p.w / 2;
        var ry = -p.h / 2;
        var radius = p.w * 0.22;   /* Corner radius proportional to width */
  
        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + p.w - radius, ry);
        ctx.arcTo(rx + p.w, ry, rx + p.w, ry + radius, radius);
        ctx.lineTo(rx + p.w, ry + p.h - radius);
        ctx.arcTo(rx + p.w, ry + p.h, rx + p.w - radius, ry + p.h, radius);
        ctx.lineTo(rx + radius, ry + p.h);
        ctx.arcTo(rx, ry + p.h, rx, ry + p.h - radius, radius);
        ctx.lineTo(rx, ry + radius);
        ctx.arcTo(rx, ry, rx + radius, ry, radius);
        ctx.closePath();
  
        ctx.fill();
        ctx.stroke();
  
        /* Draw tiny "home button" at bottom of phone */
        ctx.beginPath();
        ctx.arc(0, p.h / 2 - p.w * 0.18, p.w * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(10,110,189,0.4)';
        ctx.stroke();
  
        ctx.restore();
        ctx.globalAlpha = 1;   /* Reset global alpha after each phone */
      }
  
      /* ── Draw connecting lines between nearby phones ── */
      function drawConnections() {
        for (var i = 0; i < phones.length; i++) {
          for (var j = i + 1; j < phones.length; j++) {
            var dx = phones[i].x - phones[j].x;
            var dy = phones[i].y - phones[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
  
            if (dist < CONFIG.connectDist) {
              /* Line fades as phones move apart */
              var alpha = (1 - dist / CONFIG.connectDist) * CONFIG.lineAlpha;
              ctx.beginPath();
              ctx.moveTo(phones[i].x, phones[i].y);
              ctx.lineTo(phones[j].x, phones[j].y);
              ctx.strokeStyle = 'rgba(10,110,189,' + alpha + ')';
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }
  
      /* ── Main animation render loop ── */
      function render() {
        if (!isRunning) return;   /* Respect pause state */
  
        ctx.clearRect(0, 0, W, H);   /* Clear previous frame */
        updatePhones();
        drawConnections();            /* Draw lines first (behind phones) */
        phones.forEach(drawPhone);   /* Then draw phones on top */
  
        rafId = requestAnimationFrame(render);   /* Schedule next frame */
      }
  
      /* ── Start animation loop ── */
      function start() {
        if (isRunning) return;   /* Guard against double-start */
        isRunning = true;
        render();
      }
  
      /* ── Stop animation loop — cancels pending frame ── */
      function stop() {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
  
      /* ── IntersectionObserver — pauses canvas when hero scrolls off screen ── */
      /* This saves CPU and battery when the user scrolls away */
      if ('IntersectionObserver' in window) {
        var heroObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              start();   /* Resume when hero enters viewport */
            } else {
              stop();    /* Pause when hero leaves viewport */
            }
          });
        }, { threshold: 0.1 });   /* Trigger at 10% visibility */
  
        heroObs.observe(section);
      } else {
        start();   /* Fallback — always run on old browsers */
      }
  
      /* ── Initial setup ── */
      resize();
      initPhones();
  
      /* ── Re-seed phones on resize (prevents out-of-bounds positions) ── */
      window.addEventListener('resize', function () {
        resize();
        initPhones();
      });
  
    }
    /* END: SECTION 01 · HERO CANVAS */
  
  
    /* ============================================================
       SECTION 02 · SCROLL REVEAL
       PURPOSE: Watches every [data-mob-reveal] element.
                Adds .mob-revealed when element enters viewport.
                Element's CSS transitions from hidden to visible.
                data-mob-delay attribute adds stagger offset (ms).
                Fires ONCE per element — no repeated animation.
     ============================================================ */
    function initScrollReveal() {
  
      /* Select all elements that should animate in on scroll */
      var targets = document.querySelectorAll('.mob-page [data-mob-reveal]');
      if (!targets.length) return;
  
      if ('IntersectionObserver' in window) {
  
        var revealObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
  
            var el    = entry.target;
            /* Read optional stagger delay from data attribute (default 0ms) */
            var delay = parseInt(el.getAttribute('data-mob-delay') || 0, 10);
  
            /* Apply delay then add revealed class (triggers CSS transition) */
            setTimeout(function () {
              el.classList.add('mob-revealed');
            }, delay);
  
            /* Stop observing after reveal — element only animates once */
            revealObs.unobserve(el);
          });
        }, { threshold: 0.14 });   /* Trigger at 14% element visibility */
  
        targets.forEach(function (el) { revealObs.observe(el); });
  
      } else {
        /* Fallback — instantly show all elements on old browsers */
        targets.forEach(function (el) { el.classList.add('mob-revealed'); });
      }
  
    }
    /* END: SECTION 02 · SCROLL REVEAL */
  
  
    /* ============================================================
       SECTION 03 · TECH STACK CHIP ANIMATION
       PURPOSE: Assigns unique float animation timing to each chip
                so they bob at different speeds and rhythms.
                IntersectionObserver adds/removes .mob-chip-paused
                to pause CSS animation when section is off-screen.
                This saves GPU compositing when not visible.
     ============================================================ */
    function initTechStack() {
  
      var section = document.getElementById('mob-techstack');
      if (!section) return;
  
      var chips = section.querySelectorAll('.mob-tech__chip');
  
      /* ── Assign random float timing to each chip via CSS custom properties ── */
      chips.forEach(function (chip, i) {
        /* Duration: 3.5s to 6s — varied so chips bob at different speeds */
        var dur   = (3.5 + Math.random() * 2.5).toFixed(2) + 's';
  
        /* Delay: staggered by index + small random offset — prevents sync */
        var delay = (i * 0.18 + Math.random() * 0.5).toFixed(2) + 's';
  
        /* Set as CSS custom properties — CSS animation picks these up */
        chip.style.setProperty('--mob-chip-dur',   dur);
        chip.style.setProperty('--mob-chip-delay', delay);
      });
  
      /* ── IntersectionObserver — pause float when section off-screen ── */
      if ('IntersectionObserver' in window) {
        var techObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            chips.forEach(function (chip) {
              if (entry.isIntersecting) {
                chip.classList.remove('mob-chip-paused');   /* Resume float */
              } else {
                chip.classList.add('mob-chip-paused');      /* Pause float */
              }
            });
          });
        }, { threshold: 0.1 });
  
        techObs.observe(section);
      }
  
    }
    /* END: SECTION 03 · TECH STACK */
  
  
    /* ============================================================
       SECTION 04 · INDUSTRY TABS
       PURPOSE: Tab switching for the Industries section.
                Clicking a tab deactivates all, then activates
                the clicked tab and its matching panel.
                Panel has a fade-in animation defined in CSS.
     ============================================================ */
    function initIndustryTabs() {
  
      var section = document.getElementById('mob-industries');
      if (!section) return;
  
      var tabs   = section.querySelectorAll('.mob-ind__tab');
      var panels = section.querySelectorAll('.mob-ind__panel');
  
      /* ── Activate a tab by its index ── */
      function activateTab(index) {
        /* Remove active state from all tabs */
        tabs.forEach(function (t) { t.classList.remove('mob-tab-active'); });
        /* Remove active state from all panels */
        panels.forEach(function (p) { p.classList.remove('mob-panel-active'); });
  
        /* Activate the selected tab */
        if (tabs[index])   tabs[index].classList.add('mob-tab-active');
        /* Activate the matching panel — triggers CSS fade-in animation */
        if (panels[index]) panels[index].classList.add('mob-panel-active');
      }
  
      /* ── Wire click handler to each tab ── */
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activateTab(i); });
      });
  
      /* ── Show first tab on load ── */
      activateTab(0);
  
    }
    /* END: SECTION 04 · INDUSTRY TABS */
  
  
    /* ============================================================
       SECTION 05 · PROCESS STEP ANIMATION
       PURPOSE: When the process section enters viewport, each step
                circle activates sequentially (staggered delays).
                When section LEAVES viewport, all steps reset
                so the animation replays on next scroll-in.
     ============================================================ */
    function initProcess() {
  
      var section = document.getElementById('mob-process');
      if (!section) return;
  
      var steps = section.querySelectorAll('.mob-proc__step');
      var activated = false;   /* Prevents double-triggering on same scroll */
  
      /* ── Activate steps with staggered delay ── */
      function activateSteps() {
        if (activated) return;
        activated = true;
  
        /* Each step activates 250ms after the previous */
        steps.forEach(function (step, i) {
          setTimeout(function () {
            step.classList.add('mob-step-active');   /* CSS handles visual change */
          }, 200 + i * 250);
        });
      }
  
      /* ── Reset all steps — called when section leaves viewport ── */
      function resetSteps() {
        activated = false;
        steps.forEach(function (step) {
          step.classList.remove('mob-step-active');
        });
      }
  
      /* ── IntersectionObserver — activate on enter, reset on leave ── */
      if ('IntersectionObserver' in window) {
        var procObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              activateSteps();   /* Play animation when visible */
            } else {
              resetSteps();      /* Reset so it replays next time */
            }
          });
        }, { threshold: 0.25 });   /* Need 25% visible before triggering */
  
        procObs.observe(section);
      } else {
        activateSteps();   /* Fallback — activate immediately */
      }
  
    }
    /* END: SECTION 05 · PROCESS */
  
  
    /* ============================================================
       SECTION 06 · STATS COUNT-UP ANIMATION
       PURPOSE: Animates numbers from 0 to their target value
                using easeOutExpo easing over 1.8 seconds.
                Fires when stats section enters viewport.
                Resets when section leaves — replays on re-entry.
                Uses requestAnimationFrame for smooth animation.
     ============================================================ */
    function initStats() {
  
      var section = document.getElementById('mob-stats');
      if (!section) return;
  
      /* Find all elements with a count target defined */
      var counters = section.querySelectorAll('[data-mob-count]');
      var started  = false;   /* Flag — prevents double-start */
  
      /* ── Easing function — fast start, slow finish ── */
      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }
  
      /* ── Animate a single counter element ── */
      function animateCounter(el) {
        var target   = parseFloat(el.getAttribute('data-mob-count'));
        var suffix   = el.getAttribute('data-mob-suffix')  || '';
        var prefix   = el.getAttribute('data-mob-prefix')  || '';
        var decimals = parseInt(el.getAttribute('data-mob-dec') || '0', 10);
        var duration = 1800;     /* Animation duration in milliseconds */
        var startTime = null;
  
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
  
          var elapsed  = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);   /* 0 to 1 */
          var eased    = easeOutExpo(progress);              /* Apply easing */
          var current  = target * eased;                     /* Current value */
  
          /* Update displayed text */
          el.textContent = prefix + current.toFixed(decimals) + suffix;
  
          if (progress < 1) {
            /* Continue animating until done */
            el._rafId = requestAnimationFrame(step);
          } else {
            /* Snap to exact final value (avoids floating point issues) */
            el.textContent = prefix + target.toFixed(decimals) + suffix;
          }
        }
  
        /* Cancel any running animation before starting new one */
        if (el._rafId) cancelAnimationFrame(el._rafId);
        el._rafId = requestAnimationFrame(step);
      }
  
      /* ── Reset all counters to zero ── */
      function resetCounters() {
        started = false;
        counters.forEach(function (el) {
          if (el._rafId) cancelAnimationFrame(el._rafId);
          var suffix   = el.getAttribute('data-mob-suffix') || '';
          var prefix   = el.getAttribute('data-mob-prefix') || '';
          var decimals = parseInt(el.getAttribute('data-mob-dec') || '0', 10);
          el.textContent = prefix + (0).toFixed(decimals) + suffix;
        });
      }
  
      /* ── IntersectionObserver — play on enter, reset on leave ── */
      if ('IntersectionObserver' in window) {
        var statsObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
              started = true;
              /* Stagger each counter by 140ms for a cascading effect */
              counters.forEach(function (el, i) {
                setTimeout(function () { animateCounter(el); }, i * 140);
              });
            }
            if (!entry.isIntersecting) {
              resetCounters();   /* Reset so animation replays next time */
            }
          });
        }, { threshold: 0.3 });   /* Need 30% visible before starting */
  
        statsObs.observe(section);
  
      } else {
        /* Fallback — just show final values immediately */
        counters.forEach(function (el) { animateCounter(el); });
      }
  
    }
    /* END: SECTION 06 · STATS */
  
  
    /* ============================================================
       SECTION 07 · FAQ ACCORDION
       PURPOSE: One FAQ item open at a time (accordion mode).
                Clicking a question opens it and closes all others.
                CSS max-height transition handles smooth animation.
                aria-expanded updated for screen reader support.
                First item open by default on load.
     ============================================================ */
    function initFaq() {
  
      var section = document.getElementById('mob-faq');
      if (!section) return;
  
      var items = section.querySelectorAll('.mob-faq__item');
  
      /* ── Close a specific FAQ item ── */
      function closeItem(item) {
        item.classList.remove('mob-faq-open');
        var btn = item.querySelector('.mob-faq__q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
  
      /* ── Open a specific FAQ item ── */
      function openItem(item) {
        item.classList.add('mob-faq-open');
        var btn = item.querySelector('.mob-faq__q');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
  
      /* ── Wire click handler to each question button ── */
      items.forEach(function (item) {
        var btn = item.querySelector('.mob-faq__q');
        if (!btn) return;
  
        btn.addEventListener('click', function () {
          var isOpen = item.classList.contains('mob-faq-open');
  
          /* Close all items first (single-open accordion mode) */
          items.forEach(function (other) { closeItem(other); });
  
          /* If this item was closed, open it — otherwise leave all closed */
          if (!isOpen) openItem(item);
        });
  
        /* ── Keyboard support — Enter and Space open/close ── */
        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();   /* Trigger the click handler defined above */
          }
        });
      });
  
      /* ── Open first item on load ── */
      if (items[0]) openItem(items[0]);
  
    }
    /* END: SECTION 07 · FAQ */
  
  })();
  /* END: IIFE — all variables stay private */